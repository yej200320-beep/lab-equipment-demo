export type Permission =
  | "DEVICE_VIEW"
  | "DEVICE_EDIT"
  | "LOCATION_VIEW"
  | "ALERT_VIEW"
  | "ALERT_HANDLE"
  | "LED_CONTROL"
  | "EPAPER_UPDATE"
  | "AUDIT_VIEW"
  | "USER_AUTHORIZE"
  | "SYSTEM_CONFIG";

export type Role =
  "Super Admin" | "QC Manager" | "QC User" | "Engineering User";
export type Scope = "本部门" | "指定房间" | "指定设备" | "全公司";
export type RiskStatus = "OVERDUE" | "RED" | "YELLOW" | "GREEN" | "UNKNOWN";

export interface User {
  id: string;
  name: string;
  username: string;
  department: string;
  role: Role;
  status: "启用" | "停用";
  lastLogin: string;
  scope: Scope;
  permissions: Permission[];
}

export interface LifecycleItem {
  dueDate?: string;
  days?: number;
  status: RiskStatus;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  assetTag: string;
  department: string;
  owner: string;
  maximoLocation: string;
  bleRoom: string;
  gateway: string;
  rssi: number;
  lastSeen: string;
  online: boolean;
  battery: number;
  cal: LifecycleItem;
  pm: LifecycleItem;
  val: LifecycleItem;
  overall: RiskStatus;
  tagId: string;
  tagUpdatedAt: string;
}

export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "IN PROGRESS" | "CLOSED";
export interface AlertItem {
  id: string;
  level: "紧急" | "高" | "中" | "低";
  deviceId?: string;
  type: string;
  content: string;
  department: string;
  owner: string;
  createdAt: string;
  notified: boolean;
  status: AlertStatus;
}

export interface AuditLog {
  id: string;
  time: string;
  user: string;
  department: string;
  action: string;
  object: string;
  result: "成功" | "失败";
  detail: string;
}

export interface NotificationRecord {
  id: string;
  time: string;
  recipients: string;
  cc: string;
  subject: string;
  body: string;
  status: "已发送" | "发送中" | "失败";
  deviceId?: string;
}

export interface NoticeRule {
  id: string;
  name: string;
  condition: string;
  audience: string;
  template: string;
  enabled: boolean;
}
export interface SyncRecord {
  id: string;
  time: string;
  scanned: number;
  inserted: number;
  updated: number;
  failed: number;
  status: string;
}
export interface Gateway {
  id: string;
  room: string;
  ip: string;
  port: number;
  online: boolean;
  devices: number;
  heartbeat: string;
  uptime: string;
}
