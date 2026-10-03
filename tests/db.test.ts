import { describe, expect, it } from "bun:test";
import { initDatabase } from "@/db/database";

describe("SQLite Database Layer", () => {
  it("initializes tables in-memory properly", () => {
    const db = initDatabase(":memory:");

    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table';")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain("accounts");
    expect(tableNames).toContain("jobs");
    expect(tableNames).toContain("settings");

    // Insert an account
    const now = Date.now();
    db.run(
      `INSERT INTO accounts (id, label, username, api_key_encrypted, api_key_iv, gpu_hours_remaining, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["acc-1", "Acc 1", "kaggleuser1", "enc_key", "iv_1", 30.0, "active", now, now]
    );

    const inserted = db
      .query("SELECT * FROM accounts WHERE id = ?")
      .get("acc-1") as { username: string; gpu_hours_remaining: number };

    expect(inserted.username).toBe("kaggleuser1");
    expect(inserted.gpu_hours_remaining).toBe(30.0);
    db.close();
  });
});
