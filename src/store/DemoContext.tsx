import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  initialAlerts,
  initialLogs,
  initialNotifications,
  initialRules,
  initialSyncs,
  initialUsers,
} from "../mock/data";
import type {
  AlertStatus,
  AuditLog,
  NoticeRule,
  NotificationRecord,
  Permission,
  SyncRecord,
  User,
} from "../types";

type PersistentState = {
  users: User[];
  alerts: typeof initialAlerts;
  logs: AuditLog[];
  notifications: NotificationRecord[];
  rules: NoticeRule[];
  syncs: SyncRecord[];
  epaper: Record<string, string>;
};
const initialState: PersistentState = {
  users: initialUsers,
  alerts: initialAlerts,
  logs: initialLogs,
  notifications: initialNotifications,
  rules: initialRules,
  syncs: initialSyncs,
  epaper: {},
};
const STORAGE_KEY = "lab-equipment-demo-v2";

interface DemoStore extends PersistentState {
  currentUser: User | null;
  login: (id: string) => void;
  logout: () => void;
  switchUser: (id: string) => void;
  hasPermission: (permission: Permission) => boolean;
  visibleDepartments: string[];
  saveUserAccess: (
    id: string,
    permissions: Permission[],
    scope: User["scope"],
  ) => void;
  changeAlert: (id: string, status: AlertStatus) => void;
  addLog: (action: string, object: string, detail: string) => void;
  resendMail: (record: NotificationRecord) => void;
  toggleRule: (id: string, enabled: boolean) => void;
  updateEpaper: (deviceId: string) => void;
  addSync: (record: SyncRecord) => void;
  resetDemo: () => void;
}

const Context = createContext<DemoStore | null>(null);
const now = () =>
  new Date().toLocaleString("zh-CN", { hour12: false }).replaceAll("/", "-");

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistentState>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "",
      ) as PersistentState;
    } catch {
      return initialState;
    }
  });
  const [currentId, setCurrentId] = useState<string | null>(() =>
    sessionStorage.getItem("demo-user"),
  );
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  const currentUser = state.users.find((u) => u.id === currentId) || null;
  const addLog = (action: string, object: string, detail: string) =>
    setState((s) => ({
      ...s,
      logs: [
        {
          id: `LOG-${Date.now()}`,
          time: now(),
          user: currentUser?.name || "系统",
          department: currentUser?.department || "全公司",
          action,
          object,
          result: "成功",
          detail,
        },
        ...s.logs,
      ],
    }));
  const value = useMemo<DemoStore>(
    () => ({
      ...state,
      currentUser,
      login: (id) => {
        setCurrentId(id);
        sessionStorage.setItem("demo-user", id);
      },
      logout: () => {
        setCurrentId(null);
        sessionStorage.removeItem("demo-user");
      },
      switchUser: (id) => {
        setCurrentId(id);
        sessionStorage.setItem("demo-user", id);
      },
      hasPermission: (p) => Boolean(currentUser?.permissions.includes(p)),
      visibleDepartments:
        currentUser?.scope === "全公司"
          ? ["QC", "Production", "Engineering", "Laboratory"]
          : currentUser
            ? [currentUser.department]
            : [],
      saveUserAccess: (id, permissions, scope) =>
        setState((s) => ({
          ...s,
          users: s.users.map((u) =>
            u.id === id ? { ...u, permissions, scope } : u,
          ),
          logs: [
            {
              id: `LOG-${Date.now()}`,
              time: now(),
              user: currentUser?.name || "管理员",
              department: currentUser?.department || "全公司",
              action: "权限修改",
              object: s.users.find((u) => u.id === id)?.username || id,
              result: "成功",
              detail: `数据范围：${scope}；功能权限：${permissions.length} 项`,
            },
            ...s.logs,
          ],
        })),
      changeAlert: (id, status) =>
        setState((s) => ({
          ...s,
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
          logs: [
            {
              id: `LOG-${Date.now()}`,
              time: now(),
              user: currentUser?.name || "用户",
              department: currentUser?.department || "-",
              action:
                status === "ACKNOWLEDGED"
                  ? "预警确认"
                  : status === "CLOSED"
                    ? "预警关闭"
                    : "预警处理",
              object: id,
              result: "成功",
              detail: `预警状态更新为 ${status}`,
            },
            ...s.logs,
          ],
        })),
      addLog,
      resendMail: (record) =>
        setState((s) => ({
          ...s,
          notifications: [
            {
              ...record,
              id: `MAIL-${Date.now()}`,
              time: now(),
              status: "已发送",
            },
            ...s.notifications,
          ],
          logs: [
            {
              id: `LOG-${Date.now() + 1}`,
              time: now(),
              user: currentUser?.name || "用户",
              department: currentUser?.department || "-",
              action: "邮件重发",
              object: record.deviceId || record.id,
              result: "成功",
              detail: record.subject,
            },
            ...s.logs,
          ],
        })),
      toggleRule: (id, enabled) =>
        setState((s) => ({
          ...s,
          rules: s.rules.map((r) => (r.id === id ? { ...r, enabled } : r)),
          logs: [
            {
              id: `LOG-${Date.now()}`,
              time: now(),
              user: currentUser?.name || "管理员",
              department: currentUser?.department || "-",
              action: "通知规则修改",
              object: id,
              result: "成功",
              detail: enabled ? "规则已启用" : "规则已停用",
            },
            ...s.logs,
          ],
        })),
      updateEpaper: (deviceId) =>
        setState((s) => ({
          ...s,
          epaper: { ...s.epaper, [deviceId]: now() },
          logs: [
            {
              id: `LOG-${Date.now()}`,
              time: now(),
              user: currentUser?.name || "用户",
              department: currentUser?.department || "-",
              action: "电子标签更新",
              object: deviceId,
              result: "成功",
              detail: "电子墨水屏显示内容更新成功",
            },
            ...s.logs,
          ],
        })),
      addSync: (record) =>
        setState((s) => ({
          ...s,
          syncs: [record, ...s.syncs],
          logs: [
            {
              id: `LOG-${Date.now()}`,
              time: now(),
              user: currentUser?.name || "管理员",
              department: currentUser?.department || "-",
              action: "Maximo 同步",
              object: "ASSET",
              result: "成功",
              detail: `Scanned ${record.scanned} / Updated ${record.updated}`,
            },
            ...s.logs,
          ],
        })),
      resetDemo: () => {
        setState(initialState);
        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [state, currentUser],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("useDemo must be used within DemoProvider");
  return value;
}
