export const APP_VERSION = "1.0.0";
export const GITHUB_REPO = "mncuchiinhuttt/multi-kaggle";

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseUrl?: string;
  releaseNotes?: string;
  publishedAt?: string;
}

export async function checkAppUpdate(): Promise<VersionCheckResult> {
  const currentVersion = APP_VERSION;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          "User-Agent": "Multi-Kaggle-Client",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!res.ok) {
      return {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
      };
    }

    const data = (await res.json()) as {
      tag_name?: string;
      html_url?: string;
      body?: string;
      published_at?: string;
    };

    const latestTag = (data.tag_name || "").replace(/^v/, "").trim();
    const hasUpdate = Boolean(latestTag && latestTag !== currentVersion);

    return {
      currentVersion,
      latestVersion: latestTag || currentVersion,
      hasUpdate,
      releaseUrl: data.html_url,
      releaseNotes: data.body,
      publishedAt: data.published_at,
    };
  } catch {
    return {
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
    };
  }
}
