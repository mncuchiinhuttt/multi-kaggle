import { initDatabase } from "@/db/database";
import { encryptApiKey } from "@/core/crypto";

const db = initDatabase("data/multi-kaggle.db");
const secret = process.env.MASTER_SECRET_KEY || "multi-kaggle-default-secret-key-32b";

console.log("Seeding realistic mock data into data/multi-kaggle.db...");

// 1. Seed Accounts
const existingAccounts = db.query("SELECT username FROM accounts").all() as Array<{ username: string }>;
const existingUsernames: Record<string, true> = {};
for (const a of existingAccounts) {
  existingUsernames[a.username] = true;
}

const mockAccounts = [
  {
    id: "acc-alpha",
    label: "LLM Primary Farm",
    username: "alpha_researcher",
    apiKey: "kg_mock_token_alpha_12345678",
    proxyUrl: "http://us-east.proxy.host:8080",
    gpu: 21.5,
    tpu: 14.0,
    datasetsUsed: 42.8,
    datasetsMax: 214.75,
    modelsMax: 214.75,
  },
  {
    id: "acc-beta",
    label: "Vision Benchmark Node",
    username: "beta_vision_lab",
    apiKey: "kg_mock_token_beta_87654321",
    proxyUrl: "http://eu-west.proxy.host:3128",
    gpu: 8.2,
    tpu: 19.5,
    datasetsUsed: 128.4,
    datasetsMax: 214.75,
    modelsMax: 214.75,
  },
  {
    id: "acc-gamma",
    label: "Backup JAX/TPU Worker",
    username: "gamma_compute_farm",
    apiKey: "kg_mock_token_gamma_55443322",
    proxyUrl: null,
    gpu: 29.0,
    tpu: 6.5,
    datasetsUsed: 2.38,
    datasetsMax: 214.75,
    modelsMax: 214.75,
  },
];

for (const acc of mockAccounts) {
  if (!existingUsernames[acc.username]) {
    const { encrypted, iv } = encryptApiKey(acc.apiKey, secret);
    const now = Date.now();
    db.run(
      `INSERT INTO accounts (
        id, label, username, api_key_encrypted, api_key_iv, proxy_url, 
        gpu_hours_remaining, tpu_hours_remaining, private_datasets_used_gb, 
        private_datasets_max_gb, private_models_max_gb, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        acc.id,
        acc.label,
        acc.username,
        encrypted,
        iv,
        acc.proxyUrl,
        acc.gpu,
        acc.tpu,
        acc.datasetsUsed,
        acc.datasetsMax,
        acc.modelsMax,
        now,
        now,
      ]
    );
    console.log(`+ Seeded Account: ${acc.label} (@${acc.username})`);
  }
}

// 2. Seed Jobs across the last 120 days for realistic heatmap & streaks
const allAccounts = db.query("SELECT id, username FROM accounts").all() as Array<{ id: string; username: string }>;

const jobTitles = [
  { title: "DeepSeek R1 LoRA Fine-Tuning Stage 1", slug: "deepseek-r1-lora-stage1", gpu: 1, tpu: 0, dur: 7420, status: "complete" },
  { title: "Llama 3.3 70B Vision QLoRA Epoch 2", slug: "llama3-vision-qlora-ep2", gpu: 1, tpu: 0, dur: 10800, status: "complete" },
  { title: "JAX TPU Sharded Pre-training V3-8", slug: "jax-tpu-sharded-pretrain", gpu: 0, tpu: 1, dur: 14400, status: "complete" },
  { title: "Whisper Large V3 Subtitle Alignment", slug: "whisper-v3-align-subtitles", gpu: 1, tpu: 0, dur: 3600, status: "complete" },
  { title: "Distributed Gradient Aggregation EDA", slug: "distributed-grad-eda", gpu: 0, tpu: 0, dur: 1800, status: "complete" },
  { title: "FlashAttention Benchmark Matrix", slug: "flash-attn-benchmark-matrix", gpu: 1, tpu: 0, dur: 4500, status: "complete" },
  { title: "VMR ResNet 101 Spatial Embeddings", slug: "vmr-resnet-embeddings", gpu: 1, tpu: 0, dur: 8200, status: "complete" },
];

const nowMs = Date.now();
const sampleLogs = [
  "Epoch 1/5 [==============================] - loss: 0.421 - val_accuracy: 0.912\nArtifact weights saved: model_checkpoint.pt\nExecution completed successfully in 7420s",
  "Initializing TPU v3-8 topology: 8 cores online.\nXLA graph compiled in 48.2s.\nThroughput: 1420 tokens/sec. Checkpoint saved: ./tpu_weights.msgpack",
  "Preprocessing dataset tensors...\nNormalizing image batches (128x3x512x512).\nMetrics logged to tensorboard. Run finished.",
];

const sampleOutputs = JSON.stringify([
  { name: "model_weights_final.pt", url: "https://www.kaggle.com/code/outputs/model_weights_final.pt", size: 458920120 },
  { name: "eval_metrics.csv", url: "https://www.kaggle.com/code/outputs/eval_metrics.csv", size: 148290 },
  { name: "training_curve.png", url: "https://www.kaggle.com/code/outputs/training_curve.png", size: 521940 },
]);

db.run("DELETE FROM jobs WHERE id LIKE 'mock-job-%'");

let jobCount = 0;
// Generate jobs for active days out of the last 150 days
for (let dayOffset = 0; dayOffset < 150; dayOffset++) {
  const isRecentStreak = dayOffset <= 8; // Active every day for the last 8 days (streak!)
  const isWeekend = (dayOffset % 7 === 0 || dayOffset % 7 === 1);
  const isTrainingDay = isRecentStreak || (!isWeekend && (dayOffset % 3 !== 0));

  if (isTrainingDay) {
    const runsToday = isRecentStreak ? 3 : (dayOffset % 2 === 0 ? 2 : 1);
    for (let r = 0; r < runsToday; r++) {
      const template = jobTitles[(dayOffset + r) % jobTitles.length];
      const startMs = nowMs - (dayOffset * 86400000) - (r * 14400000);
      const accId = allAccounts[(dayOffset + r) % allAccounts.length].id;
      const jobId = `mock-job-${dayOffset}-${r}`;

      db.run(
        `INSERT INTO jobs (
          id, account_id, kernel_slug, title, language, kernel_type, 
          is_gpu, is_tpu, enable_internet, status, start_time, end_time, 
          duration_seconds, log_preview, output_urls, created_at
        ) VALUES (?, ?, ?, ?, 'python', 'notebook', ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
        [
          jobId,
          accId,
          `${template.slug}-d${dayOffset}`,
          template.title,
          template.gpu,
          template.tpu,
          template.status,
          startMs,
          startMs + template.dur * 1000,
          template.dur,
          sampleLogs[r % sampleLogs.length],
          sampleOutputs,
          startMs,
        ]
      );
      jobCount++;
    }
  }
}

// Add 1 currently running job
const activeAcc = allAccounts[0];
db.run(
  `INSERT INTO jobs (
    id, account_id, kernel_slug, title, language, kernel_type, 
    is_gpu, is_tpu, enable_internet, status, start_time, duration_seconds, created_at
  ) VALUES ('mock-running-job-1', ?, 'deepseek-r1-distill-active', 'Active QLoRA Training on Kaggle GPU', 'python', 'notebook', 1, 0, 1, 'running', ?, 1840, ?)`,
  [activeAcc.id, nowMs - 1840000, nowMs - 1840000]
);

console.log(`+ Seeded ${jobCount} historical completed jobs & 1 active running job.`);
console.log("Mock data seeding complete!");
db.close();
