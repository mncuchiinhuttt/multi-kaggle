import { createApp } from "./server/index";

const port = Number(process.env.PORT || 7890);
const { app } = createApp();

console.log(`Multi-Kaggle server listening at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
