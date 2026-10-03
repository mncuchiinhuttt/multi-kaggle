import { z } from "zod";

export interface PushKernelInput {
  slug: string;
  notebookContent: string;
  kernelType?: "notebook" | "script";
  language?: "python";
  isPrivate?: boolean;
  enableGpu?: boolean;
  enableInternet?: boolean;
  datasetDataSources?: string[];
  competitionSources?: string[];
  kernelDataSources?: string[];
}

export interface KernelStatusResponse {
  status: "queued" | "running" | "complete" | "error" | "cancelled" | "unknown";
  failureMessage?: string;
}

export interface KernelOutputResponse {
  log: string;
  files: Array<{ name: string; url: string }>;
}

export const KernelStatusSchema = z.object({
  status: z.string().optional(),
  failureMessage: z.string().optional(),
});

export const KernelOutputSchema = z.object({
  log: z.string().optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});
