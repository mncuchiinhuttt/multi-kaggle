import { describe, expect, it } from "bun:test";
import { initDatabase } from "@/db/database";
import { AccountService } from "@/services/account-service";

describe("AccountService & Strategy Selection", () => {
  const secretKey = "test-secret-123456789";

  it("creates account, retrieves it with masked info and handles max_quota strategy", () => {
    const db = initDatabase(":memory:");
    const service = new AccountService(db, secretKey);

    const acc1 = service.create({
      label: "Account 1",
      username: "user_one",
      apiKey: "secret_token_1",
    });

    const acc2 = service.create({
      label: "Account 2",
      username: "user_two",
      apiKey: "secret_token_2",
    });

    // Artificially change quota of user_one to 10.0
    db.run("UPDATE accounts SET gpu_hours_remaining = 10.0 WHERE id = ?", [acc1.id]);

    const pickedMaxQuota = service.selectAccount("max_quota");
    expect(pickedMaxQuota.id).toBe(acc2.id); // user_two has 30.0 vs 10.0

    // Deduct quota
    service.updateQuota(acc2.id, 3600); // 1 hour
    const updatedAcc2 = service.getById(acc2.id);
    expect(updatedAcc2?.gpu_hours_remaining).toBe(29.0);

    db.close();
  });
});
