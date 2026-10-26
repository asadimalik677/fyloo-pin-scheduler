import { listBoards } from "./pinterest";
import { listQueue } from "./queue";
import { getSavedLists } from "./keywords";
import { listDrafts } from "./drafts";
import { detectDuplicatePins } from "./planner";

export interface AssistantContext {
  boardsCount: number;
  boardNames: string[];
  queuedCount: number;
  publishedCount: number;
  draftsCount: number;
  savedKeywords: string[];
  duplicateCount: number;
}

export async function gatherUserContext(): Promise<AssistantContext> {
  let boardNames: string[] = [];
  try {
    const boards = await listBoards();
    boardNames = boards.map((b) => b.name);
  } catch {}

  const queue = await listQueue();
  const queued = queue.filter((i) => i.status === "queued");
  const published = queue.filter((i) => i.status === "published");

  const drafts = await listDrafts();
  const lists = await getSavedLists();
  const savedKeywords = lists.flatMap((l) => l.keywords);
  const duplicates = await detectDuplicatePins();

  return {
    boardsCount: boardNames.length,
    boardNames,
    queuedCount: queued.length,
    publishedCount: published.length,
    draftsCount: drafts.length,
    savedKeywords,
    duplicateCount: duplicates.length,
  };
}

export async function answerAssistantQuestion(question: string): Promise<string> {
  const ctx = await gatherUserContext();
  const q = question.toLowerCase().trim();

  // 1. Queue & Schedule questions
  if (q.includes("queue") || q.includes("schedule") || q.includes("upcoming")) {
    if (ctx.queuedCount === 0) {
      return `🌿 Your queue is currently empty. You have ${ctx.boardsCount} board(s) (${ctx.boardNames.slice(0, 3).join(", ") || "General"}) ready for pins. I recommend heading over to the Bulk Scheduler (/bulk) or Composer (/compose) to schedule at least 5 pins for the upcoming week.`;
    }
    return `📅 You currently have ${ctx.queuedCount} pin(s) queued for automatic delivery. You have published ${ctx.publishedCount} pin(s) so far. ${ctx.duplicateCount > 0 ? `⚠️ Note: We detected ${ctx.duplicateCount} duplicate pin warning(s) in your Content Planner—make sure to space identical URLs at least 7 days apart.` : "All scheduled pins are properly spaced."}`;
  }

  // 2. What should I pin next?
  if (q.includes("what should i pin") || q.includes("what to pin") || q.includes("ideas") || q.includes("next")) {
    return `💡 Based on your shop's saved keywords (${ctx.savedKeywords.slice(0, 3).join(", ") || "handmade ceramics"}), here are 3 high-impact ideas for your next batch:

1. **Studio Making-Of Reel / Video Still**: Behind the scenes shaping or carving. Process shots generate 40% more saves than static product photos.
2. **Cozy Morning Styling**: A lifestyle scene with warm coffee or tea and natural light. Target boards: ${ctx.boardNames[0] || "Home Inspiration"}.
3. **Gift Guide Flatlay**: Bundle 2 or 3 handcrafted pieces together with a caption targeting "Handmade Gift for Coffee Lovers".

You can generate complete copy for any of these right in the AI Pin Creator (/ai-creator)!`;
  }

  // 3. Keywords & SEO
  if (q.includes("keyword") || q.includes("seo") || q.includes("tags") || q.includes("search")) {
    return `🔍 Your active workspace currently tracks ${ctx.savedKeywords.length} saved keywords.

Key Pinterest SEO principles for maker shops:
- **Title Formula**: Primary Keyword (First 35 chars) + Aesthetic Modifier + Shop Name.
- **Hashtags**: Place 3 to 5 specific tags at the end of your description (e.g. #${ctx.savedKeywords[0]?.replace(/\s+/g, "") || "ceramics"}).
- **Rich Pins**: Ensure your product links include Open Graph meta tags so prices update automatically. Run a check in the AI SEO Auditor (/seo-auditor).`;
  }

  // 4. Drafts & Content Planning
  if (q.includes("draft") || q.includes("planner")) {
    return `📝 You have ${ctx.draftsCount} draft(s) waiting in your Drafts Workshop (/drafts). Drafts are great for holding uncaptioned product photos until you're ready to batch-schedule. In the Content Planner (/planner), you can also import dozens of pins at once using a CSV spreadsheet!`;
  }

  // 5. Default Maker Concierge Response
  return `🌿 Welcome to your Fyloo Studio Assistant! I have direct visibility into your workspace:

- **Boards Synced**: ${ctx.boardsCount} (${ctx.boardNames.slice(0, 3).join(", ") || "General"})
- **Pins in Queue**: ${ctx.queuedCount} scheduled
- **Saved Keywords**: ${ctx.savedKeywords.length} tracked
- **Drafts in Workshop**: ${ctx.draftsCount}

Feel free to ask me anything about your posting cadence, keyword opportunities, content ideas, or how to optimize your pins for Pinterest search!`;
}
