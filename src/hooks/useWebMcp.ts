import { useEffect } from "react";
import { devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";

type McpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, boolean>;
  execute: (input: Record<string, unknown>) => unknown;
};
type ModelContext = {
  registerTool: (
    tool: McpTool,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

export function useWebMcp() {
  const { visibleDepartments, hasPermission, alerts, changeAlert } = useDemo();
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: McpTool) => {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => undefined);
      } catch {
        /* Unsupported preview browser. */
      }
    };
    register({
      name: "find_equipment",
      title: "查找设备",
      description:
        "按设备编号或名称查找当前用户可见的设备，并返回 BLE 最近检测房间。",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: (input) => {
        const q = String(input.query || "").toLowerCase();
        return devices
          .filter(
            (d) =>
              visibleDepartments.includes(d.department) &&
              `${d.id}${d.name}`.toLowerCase().includes(q),
          )
          .slice(0, 10)
          .map((d) => ({
            id: d.id,
            name: d.name,
            room: d.bleRoom,
            gateway: d.gateway,
            online: d.online,
          }));
      },
    });
    register({
      name: "acknowledge_alert",
      title: "确认预警",
      description: "将当前用户权限范围内的一条预警标记为 ACKNOWLEDGED。",
      inputSchema: {
        type: "object",
        properties: { alertId: { type: "string" } },
        required: ["alertId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: (input) => {
        if (!hasPermission("ALERT_HANDLE"))
          throw new Error("当前用户没有预警处理权限");
        const alert = alerts.find(
          (a) =>
            a.id === input.alertId && visibleDepartments.includes(a.department),
        );
        if (!alert) throw new Error("未找到可处理的预警");
        changeAlert(alert.id, "ACKNOWLEDGED");
        return { id: alert.id, status: "ACKNOWLEDGED" };
      },
    });
    return () => lifecycle.abort();
  }, [alerts, changeAlert, hasPermission, visibleDepartments]);
}
