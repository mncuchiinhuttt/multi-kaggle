export interface TelegramNotificationPayload {
  status: "complete" | "error" | "cancelled";
  accountLabel: string;
  username: string;
  kernelSlug: string;
  title: string;
  durationSeconds: number;
  errorMessage?: string | null;
  logPreview?: string | null;
}

export class TelegramNotifier {
  constructor(
    private readonly botToken?: string,
    private readonly chatId?: string
  ) {}

  async sendNotification(payload: TelegramNotificationPayload): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      return false;
    }

    const durationMin = Math.round((payload.durationSeconds / 60) * 10) / 10;
    const badge = payload.status === "complete" ? "[SUCCESS]" : "[FAILED]";

    const message = [
      `*${badge} Kaggle Kernel Run*`,
      `*Title:* ${payload.title}`,
      `*Slug:* \`${payload.kernelSlug}\``,
      `*Account:* ${payload.accountLabel} (@${payload.username})`,
      `*Duration:* ${durationMin} mins (${payload.durationSeconds}s)`,
      payload.errorMessage ? `*Error:* \`${payload.errorMessage}\`` : null,
      payload.logPreview ? `*Logs:*\n\`\`\`\n${payload.logPreview.slice(-400)}\n\`\`\`` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
