import { describe, expect, it } from "bun:test";
import { decryptApiKey, encryptApiKey } from "@/core/crypto";

describe("AES-256-GCM Crypto Service", () => {
  const secretKey = "test-master-secret-key-123456789";

  it("should encrypt and decrypt API key correctly", () => {
    const originalKey = "kg_test_token_abcdef1234567890";
    const { encrypted, iv } = encryptApiKey(originalKey, secretKey);

    expect(encrypted).not.toBe(originalKey);
    expect(encrypted).toContain(":");
    expect(iv).toBeDefined();

    const decrypted = decryptApiKey(encrypted, iv, secretKey);
    expect(decrypted).toBe(originalKey);
  });

  it("should fail when decrypting with incorrect secret key", () => {
    const originalKey = "kaggle_api_token_secret";
    const { encrypted, iv } = encryptApiKey(originalKey, secretKey);

    expect(() => {
      decryptApiKey(encrypted, iv, "wrong-key");
    }).toThrow();
  });

  it("should fail on invalid encrypted structure", () => {
    expect(() => {
      decryptApiKey("malformed_payload", "00112233445566778899aabb", secretKey);
    }).toThrow("Invalid encrypted format");
  });
});
