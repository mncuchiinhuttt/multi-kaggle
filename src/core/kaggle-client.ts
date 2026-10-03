import {
  KernelOutputSchema,
  KernelStatusSchema,
  type KernelOutputResponse,
  type KernelStatusResponse,
  type PushKernelInput,
} from "./kaggle-types";
import { injectNotebookWatermark } from "./notebook-formatter";

export class KaggleApiClient {
  private readonly baseUrl = "https://www.kaggle.com/api/v1";
  private readonly authHeader: string;
  private readonly proxyUrl?: string;

  constructor(
    public readonly username: string,
    apiKey: string,
    proxyUrl?: string | null
  ) {
    this.authHeader = `Basic ${Buffer.from(`${username}:${apiKey}`).toString("base64")}`;
    this.proxyUrl = proxyUrl ?? undefined;
  }

  private async request(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      Authorization: this.authHeader,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const fetchOptions: RequestInit & { proxy?: string } = {
      ...options,
      headers,
    };

    if (this.proxyUrl) {
      fetchOptions.proxy = this.proxyUrl;
    }

    return await fetch(url, fetchOptions);
  }

  async testCredentials(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await this.request(`/datasets/list?mine=true&pageSize=1`, { method: "GET" });
      if (res.status === 200) return { ok: true, message: "Credentials valid" };
      if (res.status === 401 || res.status === 403) {
        return { ok: false, message: "Authentication failed. Check API key or proxy." };
      }
      return { ok: false, message: `Kaggle responded with HTTP ${res.status}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error connecting to Kaggle";
      return { ok: false, message: msg };
    }
  }

  async pushKernel(input: PushKernelInput): Promise<{ ok: boolean; error?: string; url?: string }> {
    try {
      const fullId = `${this.username}/${input.slug}`;
      const text = injectNotebookWatermark(input.notebookContent, input.kernelType);

      const payload = {
        id: fullId,
        slug: input.slug,
        text,
        language: input.language ?? "python",
        kernelType: input.kernelType ?? "notebook",
        isPrivate: input.isPrivate ?? true,
        enableGpu: input.enableGpu ?? false,
        enableTpu: input.enableTpu ?? false,
        enableInternet: input.enableInternet ?? true,
        datasetDataSources: input.datasetDataSources ?? [],
        competitionSources: input.competitionSources ?? [],
        kernelDataSources: input.kernelDataSources ?? [],
      };

      const res = await this.request(`/kernels/push`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { ok: false, error: `Kaggle push failed (${res.status}): ${errorText}` };
      }

      const rawJson: unknown = await res.json();
      const urlCandidate =
        rawJson && typeof rawJson === "object" && "url" in rawJson && typeof rawJson.url === "string"
          ? rawJson.url
          : `https://www.kaggle.com/code/${fullId}`;

      return { ok: true, url: urlCandidate };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown push error";
      return { ok: false, error: msg };
    }
  }

  async getKernelStatus(slug: string): Promise<KernelStatusResponse> {
    try {
      const res = await this.request(`/kernels/status?kernel=${this.username}/${slug}`, {
        method: "GET",
      });
      if (!res.ok) return { status: "unknown", failureMessage: `HTTP ${res.status}` };

      const rawJson: unknown = await res.json();
      const parseResult = KernelStatusSchema.safeParse(rawJson);
      if (!parseResult.success) {
        return { status: "unknown", failureMessage: "Invalid response format from Kaggle" };
      }

      const statusRaw = (parseResult.data.status ?? "").toLowerCase();
      let status: KernelStatusResponse["status"] = "unknown";
      if (statusRaw.includes("running") || statusRaw.includes("queued")) {
        status = statusRaw.includes("running") ? "running" : "queued";
      } else if (statusRaw.includes("complete")) {
        status = "complete";
      } else if (statusRaw.includes("error") || statusRaw.includes("failed")) {
        status = "error";
      } else if (statusRaw.includes("cancel")) {
        status = "cancelled";
      }

      return { status, failureMessage: parseResult.data.failureMessage };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return { status: "unknown", failureMessage: msg };
    }
  }

  async getKernelOutput(slug: string): Promise<KernelOutputResponse> {
    try {
      const res = await this.request(`/kernels/output?kernel=${this.username}/${slug}`, {
        method: "GET",
      });
      if (!res.ok) return { log: `Failed to fetch output: HTTP ${res.status}`, files: [] };

      const rawJson: unknown = await res.json();
      const parseResult = KernelOutputSchema.safeParse(rawJson);
      if (!parseResult.success) return { log: "Failed to parse Kaggle output format", files: [] };

      const files = (parseResult.data.files ?? []).map((f) => ({
        name: f.name || f.fileName || "output_file",
        url: f.url,
        size: f.size,
      }));

      return { log: parseResult.data.log ?? "", files };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { log: `Error: ${msg}`, files: [] };
    }
  }

  async listDatasets(search = ""): Promise<Array<{ ref: string; title: string; size: string }>> {
    try {
      const res = await this.request(
        `/datasets/list?mine=true&search=${encodeURIComponent(search)}&pageSize=20`,
        { method: "GET" }
      );
      if (!res.ok) return [];
      const list = (await res.json()) as Array<{ ref?: string; title?: string; totalBytes?: number }>;
      return list.map((d) => ({
        ref: d.ref || "",
        title: d.title || "",
        size: d.totalBytes ? `${Math.round(d.totalBytes / 1024 / 1024)} MB` : "N/A",
      }));
    } catch {
      return [];
    }
  }
}
