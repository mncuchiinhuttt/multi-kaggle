import { createHash, randomBytes } from "node:crypto";
import type { AccountService } from "@/services/account-service";

export interface PendingOAuthSession {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  createdAt: number;
}

// In-memory active OAuth challenges awaiting browser callback
const activeSessions = new Map<string, PendingOAuthSession>();

const KAGGLE_OAUTH_CLIENT_ID = "kagglesdk";
const KAGGLE_AUTH_URL = "https://www.kaggle.com/api/v1/oauth2/authorize";
const KAGGLE_TOKEN_URL = "https://www.kaggle.com/api/v1/oauth2/token";

function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/**
 * Builds the direct Kaggle OAuth URL with PKCE for any browser.
 * Kaggle strict whitelist requires redirect_uri to end with trailing slash: http://localhost:<port>/
 */
export function buildKaggleOAuthUrl(host: string): { authUrl: string; state: string } {
  // Generate high-entropy 32-byte state as required by Kaggle (min 32 chars)
  const state = randomBytes(32).toString("base64url");
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Kaggle whitelist allows: http://localhost:<port>/ or http://127.0.0.1:<port>/
  const redirectUri = `http://${host}/`;

  activeSessions.set(state, {
    state,
    codeVerifier,
    redirectUri,
    createdAt: Date.now(),
  });

  const params = new URLSearchParams({
    response_type: "code",
    response_mode: "query",
    client_id: KAGGLE_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "resources.admin:*",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return {
    authUrl: `${KAGGLE_AUTH_URL}?${params.toString()}`,
    state,
  };
}

/**
 * Exchanges returned OAuth code for access & refresh token, then saves account.
 */
export async function handleKaggleOAuthCallback(
  code: string,
  state: string,
  accountService: AccountService
): Promise<{ ok: boolean; username?: string; error?: string }> {
  const session = activeSessions.get(state);
  if (!session) {
    return { ok: false, error: "Invalid or expired OAuth state session." };
  }
  activeSessions.delete(state);

  try {
    const res = await fetch(KAGGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: session.codeVerifier,
        grant_type: "authorization_code",
        client_id: KAGGLE_OAUTH_CLIENT_ID,
        redirect_uri: session.redirectUri,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Kaggle token exchange failed: ${errText}` };
    }

    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
      username?: string;
    };

    const token = data.refreshToken || data.accessToken;
    const username = data.username;

    if (!username || !token) {
      return { ok: false, error: "Missing username or token in Kaggle OAuth response." };
    }

    accountService.create({
      label: `${username}-oauth`,
      username,
      apiKey: token,
    });

    return { ok: true, username };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error during OAuth token exchange";
    return { ok: false, error: msg };
  }
}
