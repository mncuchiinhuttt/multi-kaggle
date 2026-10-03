import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function getAllFiles(dir: string, baseDir: string = dir): Record<string, { content: Buffer; contentType: string }> {
  const result: Record<string, { content: Buffer; contentType: string }> = {};
  if (!existsSync(dir)) return result;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      Object.assign(result, getAllFiles(fullPath, baseDir));
    } else {
      const relPath = fullPath.slice(baseDir.length).replace(/^[/\\]+/, "");
      const ext = relPath.split(".").pop() ?? "";
      let contentType = "application/octet-stream";
      if (ext === "html") contentType = "text/html";
      else if (ext === "js") contentType = "application/javascript";
      else if (ext === "css") contentType = "text/css";
      else if (ext === "svg") contentType = "image/svg+xml";
      else if (ext === "webp") contentType = "image/webp";
      else if (ext === "json") contentType = "application/json";

      const content = readFileSync(fullPath);
      result[relPath] = { content, contentType };
    }
  }
  return result;
}

const distDir = join(process.cwd(), "frontend", "dist");
const files = getAllFiles(distDir);

let out = `// Auto-generated embedded frontend bundle\n`;
out += `export const EMBEDDED_FRONTEND: Record<string, { content: string; contentType: string }> = {\n`;

for (const [pathKey, file] of Object.entries(files)) {
  const base64 = file.content.toString("base64");
  out += `  "${pathKey}": {\n`;
  out += `    contentType: "${file.contentType}",\n`;
  out += `    content: "${base64}",\n`;
  out += `  },\n`;
}

out += `};\n`;

out += `\nexport function getEmbeddedFile(pathKey: string): { data: Buffer; contentType: string } | null {\n`;
out += `  const entry = EMBEDDED_FRONTEND[pathKey];\n`;
out += `  if (!entry) return null;\n`;
out += `  return {\n`;
out += `    data: Buffer.from(entry.content, "base64"),\n`;
out += `    contentType: entry.contentType,\n`;
out += `  };\n`;
out += `}\n`;

await Bun.write("src/server/embedded-assets.ts", out);
console.log(`Generated embedded-assets.ts with ${Object.keys(files).length} files.`);
