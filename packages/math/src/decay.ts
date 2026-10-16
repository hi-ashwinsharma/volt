import {
  DECAY_RATE_PER_DAY,
  MAX_DECAY_FACTOR,
  MIN_DECAY_FACTOR,
  type TimelinessDecayInput,
  type TimelinessDecayResult,
} from "@volt/types";
import { roundToTwoDecimals } from "./weightage";

const DEFAULT_TIMEZONE = "Asia/Kolkata";
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function formatDateInTimezone(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function parseIsoDateToUtcMidnightMs(dateStr: string): number {
  if (!DATE_REGEX.test(dateStr)) {
    throw new Error(`Invalid YYYY-MM-DD date string: ${dateStr}`);
  }
  const parts = dateStr.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return Date.UTC(year, month - 1, day);
}

export function calculateTimelinessDecay(
  input: TimelinessDecayInput
): TimelinessDecayResult {
  const timezone = input.timezone ?? DEFAULT_TIMEZONE;
  const referenceDate = input.referenceTimestampIso
    ? new Date(input.referenceTimestampIso)
    : new Date();

  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error(
      `Invalid referenceTimestampIso: ${String(input.referenceTimestampIso)}`
    );
  }

  const currentIstDate = formatDateInTimezone(referenceDate, timezone);
  const currentUtcMs = parseIsoDateToUtcMidnightMs(currentIstDate);
  const workUtcMs = parseIsoDateToUtcMidnightMs(input.workDate);

  const diffDays = Math.floor((currentUtcMs - workUtcMs) / (1000 * 60 * 60 * 24));
  const daysLate = Math.max(0, diffDays);

  if (daysLate === 0) {
    return {
      workDate: input.workDate,
      currentIstDate,
      daysLate: 0,
      decayFactor: MAX_DECAY_FACTOR,
    };
  }

  const rawDecay = MAX_DECAY_FACTOR - DECAY_RATE_PER_DAY * daysLate;
  const decayFactor = roundToTwoDecimals(
    Math.max(MIN_DECAY_FACTOR, rawDecay)
  );

  return {
    workDate: input.workDate,
    currentIstDate,
    daysLate,
    decayFactor,
  };
}
