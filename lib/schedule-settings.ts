import { storeGet, storeSet } from "./store";

export interface ScheduleSlot {
  id: string;
  label: string; // e.g. "Morning Coffee", "Afternoon Inspiration", "Evening Peak"
  time: string;  // "09:00", "14:00", "20:00"
  enabled: boolean;
}

export interface ScheduleSettings {
  slots: ScheduleSlot[];
  timezone?: string;
}

const KEY = "fyloo:schedule_settings";

export const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  slots: [
    { id: "slot-morning", label: "Morning Inspiration", time: "09:00", enabled: true },
    { id: "slot-afternoon", label: "Afternoon Showcase", time: "14:30", enabled: true },
    { id: "slot-night", label: "Evening Prime", time: "20:00", enabled: true },
  ],
  timezone: "UTC",
};

export async function getScheduleSettings(): Promise<ScheduleSettings> {
  const raw = await storeGet(KEY);
  if (!raw) return DEFAULT_SCHEDULE_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as ScheduleSettings;
    if (!parsed.slots || !Array.isArray(parsed.slots) || parsed.slots.length === 0) {
      return DEFAULT_SCHEDULE_SETTINGS;
    }
    return parsed;
  } catch {
    return DEFAULT_SCHEDULE_SETTINGS;
  }
}

export async function saveScheduleSettings(settings: ScheduleSettings): Promise<ScheduleSettings> {
  await storeSet(KEY, JSON.stringify(settings));
  return settings;
}
