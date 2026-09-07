import dayjs from "dayjs";
import type { Device, LifecycleItem, RiskStatus } from "../types";

export const BASE_DATE = dayjs("2026-09-03");

export function statusFromDays(days?: number): RiskStatus {
  if (days === undefined) return "UNKNOWN";
  if (days < 0) return "OVERDUE";
  if (days <= 7) return "RED";
  if (days <= 14) return "YELLOW";
  return "GREEN";
}

export function lifecycle(days?: number): LifecycleItem {
  return {
    days,
    dueDate:
      days === undefined
        ? undefined
        : BASE_DATE.add(days, "day").format("YYYY-MM-DD"),
    status: statusFromDays(days),
  };
}

const severity: Record<RiskStatus, number> = {
  UNKNOWN: 0,
  GREEN: 1,
  YELLOW: 2,
  RED: 3,
  OVERDUE: 4,
};
export function worstStatus(items: LifecycleItem[]): RiskStatus {
  return items.reduce<RiskStatus>(
    (worst, item) =>
      severity[item.status] > severity[worst] ? item.status : worst,
    "UNKNOWN",
  );
}

export const statusMeta: Record<RiskStatus, { label: string; color: string }> =
  {
    OVERDUE: { label: "已过期", color: "purple" },
    RED: { label: "7天内", color: "red" },
    YELLOW: { label: "8–14天", color: "gold" },
    GREEN: { label: "正常", color: "green" },
    UNKNOWN: { label: "未知", color: "default" },
  };

export function riskMessage(device: Device) {
  const known = [device.cal, device.pm, device.val]
    .filter((x) => x.days !== undefined)
    .sort((a, b) => (a.days ?? 999) - (b.days ?? 999))[0];
  if (!known) return "暂无有效到期数据";
  if ((known.days ?? 0) < 0)
    return `已有项目过期 ${Math.abs(known.days ?? 0)} 天`;
  return `${known.days} 天后有项目到期`;
}

export function signalLabel(rssi: number) {
  return rssi >= -60 ? "强" : rssi >= -75 ? "中" : "弱";
}
