// Full journal export as one JSON file: the owner downloads it on a signed-in device
// and hands it to the agent. Reading only; the site still never writes to the database.
import type { Snapshot } from "./cloud";

export type ExportFile = { name: string; json: string };

export function exportFile(snap: Snapshot, email: string | null, now = new Date()): ExportFile {
  const day = now.toISOString().slice(0, 10);
  const { syncedAt, ...tables } = snap;
  const body = { format: "foodsport-export-v1", exportedAt: now.toISOString(), syncedAt, account: email, ...tables };
  return { name: `foodsport-${day}.json`, json: JSON.stringify(body, null, 1) };
}

/** Share sheet on phones (Telegram, Files, Claude), plain download elsewhere. */
export async function saveExport(f: ExportFile) {
  const blob = new Blob([f.json], { type: "application/json" });
  const file = typeof File !== "undefined" ? new File([blob], f.name, { type: "application/json" }) : null;
  if (file && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: f.name }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = f.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
