import { Badge, Tag } from "antd";
import type { LifecycleItem, RiskStatus } from "../types";
import { statusMeta } from "../utils/status";

export function RiskTag({ status }: { status: RiskStatus }) {
  const meta = statusMeta[status];
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
export function LifecycleTag({ item }: { item: LifecycleItem }) {
  return (
    <div className="lifecycle-cell">
      <RiskTag status={item.status} />
      <small>
        {item.days === undefined
          ? "无数据"
          : item.days < 0
            ? `过期 ${Math.abs(item.days)} 天`
            : `剩余 ${item.days} 天`}
      </small>
    </div>
  );
}
export function OnlineBadge({ online }: { online: boolean }) {
  return (
    <Badge
      status={online ? "success" : "error"}
      text={online ? "在线" : "离线"}
    />
  );
}
