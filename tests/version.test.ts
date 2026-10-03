import { describe, expect, it } from "bun:test";
import { checkAppUpdate, APP_VERSION } from "@/services/version-service";

describe("Version Service and Auto-Updater", () => {
  it("reports current installed version and checks GitHub manifests", async () => {
    expect(APP_VERSION).toBe("1.0.0");
    const result = await checkAppUpdate();
    expect(result.currentVersion).toBe(APP_VERSION);
    expect(typeof result.hasUpdate).toBe("boolean");
    expect(typeof result.latestVersion).toBe("string");
  });
});
