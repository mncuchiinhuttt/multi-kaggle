import { describe, expect, it } from "bun:test";
import { initDatabase } from "@/db/database";
import { AccountService } from "@/services/account-service";

describe("AccountService & Strategy Selection with TPU", () => {
  const secretKey = "test-secret-123456789";

  it("handles GPU and TPU quota tracking and selection strategies", () => {
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

    // Artificially change TPU quota of user_one to 5.0
    db.run("UPDATE accounts SET tpu_hours_remaining = 5.0 WHERE id = ?", [acc1.id]);

    const pickedMaxTpu = service.selectAccount("max_quota", undefined, "tpu");
    expect(pickedMaxTpu.id).toBe(acc2.id); // user_two has 20.0 vs 5.0

    // Deduct TPU quota
    service.updateQuota(acc2.id, 3600, "tpu"); // 1 hour
    const updatedAcc2 = service.getById(acc2.id);
    expect(updatedAcc2?.tpu_hours_remaining).toBe(19.0);

    db.close();
  });
});
