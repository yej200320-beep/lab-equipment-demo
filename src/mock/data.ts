import type {
  AlertItem,
  AuditLog,
  Device,
  Gateway,
  NoticeRule,
  NotificationRecord,
  Permission,
  SyncRecord,
  User,
} from "../types";
import { lifecycle, worstStatus } from "../utils/status";

export const permissionLabels: Record<Permission, string> = {
  DEVICE_VIEW: "查看设备",
  DEVICE_EDIT: "编辑设备",
  LOCATION_VIEW: "查看位置",
  ALERT_VIEW: "查看预警",
  ALERT_HANDLE: "处理预警",
  LED_CONTROL: "LED 闪烁控制",
  EPAPER_UPDATE: "更新电子标签",
  AUDIT_VIEW: "查看审计日志",
  USER_AUTHORIZE: "用户授权",
  SYSTEM_CONFIG: "系统配置",
};

const allPermissions = Object.keys(permissionLabels) as Permission[];
export const initialUsers: User[] = [
  {
    id: "u-admin",
    name: "王处",
    username: "admin",
    department: "全公司",
    role: "Super Admin",
    status: "启用",
    lastLogin: "2026-09-03 15:38",
    scope: "全公司",
    permissions: allPermissions,
  },
  {
    id: "u-qcm",
    name: "李梅",
    username: "qc.manager",
    department: "QC",
    role: "QC Manager",
    status: "启用",
    lastLogin: "2026-09-03 14:52",
    scope: "本部门",
    permissions: [
      "DEVICE_VIEW",
      "DEVICE_EDIT",
      "LOCATION_VIEW",
      "ALERT_VIEW",
      "ALERT_HANDLE",
      "LED_CONTROL",
      "EPAPER_UPDATE",
    ],
  },
  {
    id: "u-qcu",
    name: "王晨",
    username: "qc.user",
    department: "QC",
    role: "QC User",
    status: "启用",
    lastLogin: "2026-09-02 16:20",
    scope: "本部门",
    permissions: ["DEVICE_VIEW", "LOCATION_VIEW", "ALERT_VIEW"],
  },
  {
    id: "u-eng",
    name: "陈工",
    username: "engineering",
    department: "Engineering",
    role: "Engineering User",
    status: "启用",
    lastLogin: "2026-09-03 09:08",
    scope: "本部门",
    permissions: ["DEVICE_VIEW", "LOCATION_VIEW", "ALERT_VIEW", "LED_CONTROL"],
  },
];

export const departments = [
  {
    name: "QC",
    manager: "李梅",
    users: 8,
    devices: 13,
    rooms: 3,
    status: "启用",
  },
  {
    name: "Production",
    manager: "赵海",
    users: 15,
    devices: 10,
    rooms: 2,
    status: "启用",
  },
  {
    name: "Engineering",
    manager: "陈工",
    users: 6,
    devices: 9,
    rooms: 3,
    status: "启用",
  },
  {
    name: "Laboratory",
    manager: "周敏",
    users: 11,
    devices: 8,
    rooms: 3,
    status: "启用",
  },
];

const names = [
  "Portable Analyzer",
  "Analytical Balance",
  "Conductivity Meter",
  "HPLC System",
  "TOC Analyzer",
  "Dissolution Tester",
  "pH Meter",
  "Incubator",
  "Centrifuge",
  "Autoclave",
  "Spectrophotometer",
  "Moisture Analyzer",
  "Particle Counter",
  "Temperature Logger",
  "Gas Chromatograph",
  "Microscope",
  "Water Purification Unit",
  "Stability Chamber",
  "Viscometer",
  "Tablet Hardness Tester",
];
const depts = ["QC", "Production", "Engineering", "Laboratory"];
const rooms = [
  "Room 101",
  "Room 105",
  "Room 201",
  "Room 202",
  "Room 203",
  "Room 301",
  "Room 302",
];
const owners: Record<string, string[]> = {
  QC: ["李梅", "王晨", "吴倩"],
  Production: ["赵海", "孙强"],
  Engineering: ["陈工", "刘洋"],
  Laboratory: ["周敏", "郑洁"],
};
const calDays = [
  3, 6, 11, -2, 45, 28, 90, 14, 7, 62, 31, -8, 120, 20, 4, 80, 12, 55, 1, 39,
  70, 9, -1, 18, 33, 105, 5, 61, 13, 26, 88, -4, 42, 72, 2, 15, 48, 99, 10, 36,
];
const pmDays = [
  46, 6, 38, 42, -5, 70, 18, 55, 13, 33, 7, 80, 25, 90, 62, 4, 120, 27, 51, 11,
  16, 30, 49, -2, 84, 22, 36, 8, 99, 5, 65, 43, 21, 110, 57, 12, 34, 77, 2, 60,
];
const valDays = [
  90, 86, 11, 31, 50, 4, 72, 19, -3, 95, 40, 13, 64, 2, 88, 29, 54, 7, 100, 46,
  10, 77, 26, 39, 1, 58, 92, 14, 47, 66, 5, 85, 23, 44, -6, 71, 32, 18, 53, 106,
];

export const devices: Device[] = Array.from({ length: 40 }, (_, i) => {
  const department = depts[i % depts.length];
  const bleRoom = rooms[(i * 3 + 2) % rooms.length];
  const maximoLocation =
    i % 9 === 0 ? rooms[(i * 3 + 3) % rooms.length] : bleRoom;
  const online = ![7, 18, 29, 36, 39].includes(i);
  const battery = [8, 12, 18].includes(i)
    ? [9, 14, 18][[8, 12, 18].indexOf(i)]
    : 48 + ((i * 7) % 49);
  const cal = lifecycle(calDays[i]),
    pm = lifecycle(pmDays[i]),
    val = lifecycle(valDays[i]);
  const processAttention = i % 11 === 0;
  const processStandby = !online || i % 9 === 0;
  const metricStatus = processStandby
    ? "待机"
    : processAttention
      ? "关注"
      : "正常";
  return {
    id: i === 0 ? "EQ-001527" : `EQ-${String(120 + i).padStart(5, "0")}`,
    name: names[i % names.length],
    model: `LAB-${["A", "B", "C", "X"][i % 4]}${100 + i}`,
    serialNumber: `SN26${String(51000 + i * 17)}`,
    assetTag: `AT-${String(8600 + i)}`,
    department,
    owner: owners[department][i % owners[department].length],
    maximoLocation: i === 0 ? "Room 201" : maximoLocation,
    bleRoom: i === 0 ? "Room 203" : bleRoom,
    gateway: i === 0 ? "GW-203-01" : `GW-${bleRoom.slice(-3)}-01`,
    rssi: -48 - ((i * 5) % 39),
    lastSeen: online
      ? `2026-09-03 ${String(15 - (i % 7)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`
      : `2026-09-03 ${String(8 - (i % 5)).padStart(2, "0")}:12`,
    online,
    battery,
    cal,
    pm,
    val,
    overall: worstStatus([cal, pm, val]),
    tagId: `BLE-29-${String(3000 + i)}`,
    tagUpdatedAt: `2026-09-${String(1 + (i % 3)).padStart(2, "0")} 10:${String((i * 3) % 60).padStart(2, "0")}`,
    maximoSyncedAt: `2026-09-03 ${String(15 - (i % 4)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    process: {
      ph: {
        value: processStandby ? "—" : (6.82 + (i % 7) * 0.06).toFixed(2),
        status: metricStatus,
      },
      temperature: {
        value: processStandby ? "—" : `${20 + (i % 8)}.${i % 10} ℃`,
        status: metricStatus,
      },
      chromatography: {
        value: processStandby
          ? "待机"
          : processAttention
            ? "基线波动"
            : i % 3 === 0
              ? "运行中"
              : "基线稳定",
        status: metricStatus,
      },
      speed: {
        value: processStandby ? "0 rpm" : `${800 + (i % 9) * 250} rpm`,
        status: metricStatus,
      },
      pressure: {
        value: processStandby ? "—" : `${98 + (i % 7) * 4} kPa`,
        status: metricStatus,
      },
    },
  };
});

const alertTypes = [
  "Calibration 到期",
  "PM 到期",
  "Validation 到期",
  "设备已过期",
  "BLE 标签离线",
  "BLE 标签低电量",
  "Maximo Location 与 BLE Last Seen 不一致",
  "BLE 网关离线",
  "Maximo 同步失败",
  "数据长时间未更新",
];
export const initialAlerts: AlertItem[] = Array.from({ length: 15 }, (_, i) => {
  const d = devices[(i * 3) % devices.length];
  return {
    id: `ALT-202609-${String(i + 1).padStart(3, "0")}`,
    level: i < 3 ? "紧急" : i < 8 ? "高" : i < 12 ? "中" : "低",
    deviceId: i === 7 ? undefined : d.id,
    type: alertTypes[i % alertTypes.length],
    content: `${d.name} 检测到${alertTypes[i % alertTypes.length]}，请及时确认并处理。`,
    department: d.department,
    owner: d.owner,
    createdAt: `2026-09-03 ${String(15 - (i % 8)).padStart(2, "0")}:${String(i * 4).padStart(2, "0")}`,
    notified: i !== 12,
    status: i < 12 ? "OPEN" : "ACKNOWLEDGED",
  };
});

export const gateways: Gateway[] = rooms.map((room, i) => ({
  id: `GW-${room.slice(-3)}-01`,
  room,
  ip: `10.20.30.${21 + i}`,
  port: 9000,
  online: i !== 5,
  devices: i === 5 ? 0 : 4 + ((i * 7) % 28),
  heartbeat: i === 5 ? "46 分钟前" : i < 2 ? "刚刚" : `${i} 分钟前`,
  uptime: i === 5 ? "0 天" : `${18 + i * 3} 天`,
}));

export const initialRules: NoticeRule[] = [
  "14 天提醒",
  "7 天提醒",
  "3 天提醒",
  "1 天提醒",
  "过期提醒",
  "离线提醒",
  "低电量提醒",
].map((name, i) => ({
  id: `rule-${i}`,
  name,
  condition: name.replace("提醒", ""),
  audience: i < 5 ? "设备 Owner、部门 Manager" : "部门 Manager、Engineering",
  template: i < 5 ? "设备到期通知模板" : "设备状态异常模板",
  enabled: true,
}));

export const initialLogs: AuditLog[] = [
  {
    id: "LOG-001",
    time: "2026-09-03 15:38:12",
    user: "王处",
    department: "全公司",
    action: "登录",
    object: "管理后台",
    result: "成功",
    detail: "Super Admin 登录系统",
  },
  {
    id: "LOG-002",
    time: "2026-09-03 15:30:42",
    user: "系统任务",
    department: "全公司",
    action: "Maximo 同步",
    object: "ASSET",
    result: "成功",
    detail: "Scanned 356 / Updated 18",
  },
  {
    id: "LOG-003",
    time: "2026-09-03 14:51:20",
    user: "李梅",
    department: "QC",
    action: "预警确认",
    object: "ALT-202609-002",
    result: "成功",
    detail: "确认设备 PM 到期预警",
  },
];

export const initialNotifications: NotificationRecord[] = [
  {
    id: "MAIL-001",
    time: "2026-09-03 14:32",
    recipients: "wangchen@demo.local",
    cc: "limei@demo.local",
    subject: "[紧急] EQ-001527 Calibration 将于 3 天后到期",
    body: "设备 EQ-001527（Portable Analyzer）的 Calibration 将于 2026-09-06 到期，请及时安排处理。",
    status: "已发送",
    deviceId: "EQ-001527",
  },
  {
    id: "MAIL-002",
    time: "2026-09-03 09:00",
    recipients: "engineering@demo.local",
    cc: "",
    subject: "[提醒] BLE 网关 GW-301-01 离线",
    body: "BLE 网关 GW-301-01 已超过 30 分钟未发送心跳，请检查网络与供电。",
    status: "已发送",
  },
];

export const initialSyncs: SyncRecord[] = [
  {
    id: "SYNC-001",
    time: "2026-09-03 15:30",
    scanned: 356,
    inserted: 2,
    updated: 18,
    failed: 0,
    status: "成功",
  },
];
