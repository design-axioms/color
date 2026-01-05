import type { ObservationEvent, ObservationLog } from "../observation-log.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

export function asObservationLog(value: unknown): ObservationLog | null {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value["events"])) return null;
  return value as ObservationLog;
}

export function findLastEvent<TType extends ObservationEvent["type"]>(
  log: ObservationLog,
  type: TType,
): (ObservationEvent & { type: TType }) | undefined {
  for (let i = log.events.length - 1; i >= 0; i--) {
    const ev = log.events[i];
    if (ev?.type === type) return ev as ObservationEvent & { type: TType };
  }
  return undefined;
}

export function listMeasurementTypes(log: ObservationLog): string[] {
  const types = new Set<string>();
  for (const ev of log.events) {
    if (typeof ev?.type === "string" && ev.type.startsWith("measure:")) {
      types.add(ev.type);
    }
  }
  return [...types].sort();
}
