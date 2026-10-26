import { listQueue, QueueItem } from "./queue";
import { listDrafts, DraftItem } from "./drafts";

export interface DuplicateWarning {
  id: string;
  pinA: QueueItem;
  pinB: QueueItem;
  reason: string;
  daysApart: number;
}

export interface CSVImportedRow {
  title: string;
  description: string;
  boardName: string;
  scheduledAt: string;
  link?: string;
  imageUrl?: string;
}

export async function detectDuplicatePins(): Promise<DuplicateWarning[]> {
  const items = await listQueue();
  const queuedOnly = items.filter((i) => i.status === "queued");
  const warnings: DuplicateWarning[] = [];

  for (let i = 0; i < queuedOnly.length; i++) {
    for (let j = i + 1; j < queuedOnly.length; j++) {
      const a = queuedOnly[i];
      const b = queuedOnly[j];

      // Check title similarity or identical destination link
      const sameLink = a.link && b.link && a.link.trim() === b.link.trim();
      const sameTitle = a.title.trim().toLowerCase() === b.title.trim().toLowerCase();

      if (sameLink || sameTitle) {
        const dateA = new Date(a.scheduled_at).getTime();
        const dateB = new Date(b.scheduled_at).getTime();
        const daysApart = Math.abs(Math.round((dateA - dateB) / (1000 * 60 * 60 * 24)));

        if (daysApart < 7) {
          warnings.push({
            id: `dup-${a.id}-${b.id}`,
            pinA: a,
            pinB: b,
            reason: sameLink
              ? `Both pins share the identical destination URL (${a.link}) within ${daysApart} day(s).`
              : `Both pins have the exact same title ("${a.title}") within ${daysApart} day(s).`,
            daysApart,
          });
        }
      }
    }
  }

  return warnings;
}

export function parseCSVToPins(csvText: string): CSVImportedRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const rows: CSVImportedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV row parser handling quotes
    const values: string[] = [];
    let insideQuotes = false;
    let curVal = "";
    const line = lines[i];

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(curVal.trim());
        curVal = "";
      } else {
        curVal += char;
      }
    }
    values.push(curVal.trim());

    const titleIdx = headers.findIndex((h) => h.includes("title"));
    const descIdx = headers.findIndex((h) => h.includes("desc"));
    const boardIdx = headers.findIndex((h) => h.includes("board"));
    const dateIdx = headers.findIndex((h) => h.includes("date") || h.includes("schedule"));
    const linkIdx = headers.findIndex((h) => h.includes("link") || h.includes("url"));
    const imageIdx = headers.findIndex((h) => h.includes("image") || h.includes("photo"));

    const title = values[titleIdx] || `Imported Pin #${i}`;
    const description = values[descIdx] || "";
    const boardName = values[boardIdx] || "General Crafts";

    let scheduledAt = values[dateIdx] || "";
    if (!scheduledAt || isNaN(new Date(scheduledAt).getTime())) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(10, 0, 0, 0);
      scheduledAt = d.toISOString();
    } else {
      scheduledAt = new Date(scheduledAt).toISOString();
    }

    const link = values[linkIdx] || "";
    const imageUrl = values[imageIdx] || "";

    rows.push({
      title,
      description,
      boardName,
      scheduledAt,
      link,
      imageUrl,
    });
  }

  return rows;
}
