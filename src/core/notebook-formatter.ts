/**
 * Injects a unique watermark into notebook JSON or script text to prevent hash collisions.
 */
export function injectNotebookWatermark(
  content: string,
  kernelType: "notebook" | "script" = "notebook"
): string {
  const watermark = `\n# Run-ID: ${crypto.randomUUID()} - ${new Date().toISOString()}\n`;

  if (kernelType === "notebook") {
    try {
      const parsed = JSON.parse(content) as { cells?: Array<{ source?: string | string[] }> };
      if (Array.isArray(parsed.cells) && parsed.cells.length > 0) {
        const firstCell = parsed.cells[0];
        if (Array.isArray(firstCell.source)) {
          firstCell.source.unshift(watermark);
        } else if (typeof firstCell.source === "string") {
          firstCell.source = watermark + firstCell.source;
        }
        return JSON.stringify(parsed);
      }
    } catch {
      // Fallback to appending if json parsing fails
    }
  }

  return watermark + content;
}
