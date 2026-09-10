import {
  ApiOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Input,
  message,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { departments, gateways, permissionLabels } from "../mock/data";
import { useDemo } from "../store/DemoContext";
import type { Permission, Scope, User } from "../types";

const pageCopy: Record<string, [string, string]> = {
  "/admin/users": ["用户与权限", "为用户配置数据范围和功能权限"],
  "/admin/departments": ["部门管理", "管理部门、管理员与设备归属"],
  "/admin/gateways": ["BLE 网关", "监控房间网关、心跳与连接设备"],
  "/admin/maximo": ["Maximo 同步", "模拟 REST API 数据同步与历史记录"],
  "/admin/settings": ["通知配置", "管理设备到期和连接异常的邮件规则"],
  "/admin/logs": ["系统日志", "追踪权限、预警、定位和同步等关键操作"],
};
export default function AdminPage() {
  const location = useLocation();
  const { hasPermission } = useDemo();
  const navigate = useNavigate();
  const copy = pageCopy[location.pathname] || pageCopy["/admin/users"];
  if (!hasPermission("SYSTEM_CONFIG") && !hasPermission("USER_AUTHORIZE"))
    return (
      <Alert
        type="error"
        showIcon
        message="无权访问系统管理"
        description="当前身份未获得 USER_AUTHORIZE 或 SYSTEM_CONFIG 权限。"
        action={
          <Button onClick={() => navigate("/dashboard")}>返回总览</Button>
        }
      />
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>{copy[0]}</Typography.Title>
          <Typography.Text type="secondary">{copy[1]}</Typography.Text>
        </div>
        <Tag icon={<SafetyCertificateOutlined />} color="blue">
          Super Admin
        </Tag>
      </div>
      {location.pathname === "/admin/users" ? (
        <UsersAdmin />
      ) : location.pathname === "/admin/departments" ? (
        <DepartmentsAdmin />
      ) : location.pathname === "/admin/gateways" ? (
        <GatewayAdmin />
      ) : location.pathname === "/admin/maximo" ? (
        <MaximoAdmin />
      ) : location.pathname === "/admin/settings" ? (
        <SettingsAdmin />
      ) : (
        <LogsAdmin />
      )}
    </>
  );
}

function UsersAdmin() {
  const { users, saveUserAccess } = useDemo();
  const [selected, setSelected] = useState<User>();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [scope, setScope] = useState<Scope>("本部门");
  const [msg, ctx] = message.useMessage();
  const open = (u: User) => {
    setSelected(u);
    setPermissions(u.permissions);
    setScope(u.scope);
  };
  const save = () => {
    if (!selected) return;
    saveUserAccess(selected.id, permissions, scope);
    msg.success("权限更新成功，对应用户切换身份后立即生效");
    setSelected(undefined);
  };
  return (
    <>
      {ctx}
      <Card>
        <Table
          rowKey="id"
          dataSource={users}
          columns={[
            {
              title: "用户",
              dataIndex: "name",
              render: (v, r) => (
                <div className="user-table">
                  <span>{v.slice(0, 1)}</span>
                  <div>
                    <b>{v}</b>
                    <small>{r.username}</small>
                  </div>
                </div>
              ),
            },
            { title: "部门", dataIndex: "department" },
            {
              title: "角色",
              dataIndex: "role",
              render: (v) => (
                <Tag color={v === "Super Admin" ? "purple" : "blue"}>{v}</Tag>
              ),
            },
            { title: "数据范围", dataIndex: "scope" },
            {
              title: "权限数量",
              dataIndex: "permissions",
              render: (v) => `${v.length} 项`,
            },
            {
              title: "状态",
              dataIndex: "status",
              render: (v) => <Tag color="green">{v}</Tag>,
            },
            { title: "最近登录", dataIndex: "lastLogin" },
            {
              title: "操作",
              render: (_, r) => (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => open(r)}
                  disabled={r.role === "Super Admin"}
                >
                  授权
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Drawer
        open={!!selected}
        onClose={() => setSelected(undefined)}
        title={`用户授权 · ${selected?.name}`}
        width={620}
        extra={
          <Button type="primary" onClick={save}>
            保存权限
          </Button>
        }
      >
        {selected && (
          <>
            <Alert
              type="info"
              showIcon
              message={`${selected.role} · ${selected.department}`}
              description="保存后将写入 LocalStorage，并新增一条审计日志。"
            />
            <Divider>数据范围</Divider>
            <Select
              value={scope}
              onChange={setScope}
              style={{ width: "100%" }}
              options={["本部门", "指定房间", "指定设备", "全公司"].map(
                (x) => ({ value: x, label: x }),
              )}
            />
            <Divider>功能权限</Divider>
            <Checkbox.Group
              value={permissions}
              onChange={(v) => setPermissions(v as Permission[])}
              className="permission-grid"
            >
              {(Object.entries(permissionLabels) as [Permission, string][]).map(
                ([key, label]) => (
                  <Checkbox key={key} value={key}>
                    <span>
                      <b>{label}</b>
                      <small>{key}</small>
                    </span>
                  </Checkbox>
                ),
              )}
            </Checkbox.Group>
            <Alert
              className="section-row"
              type="warning"
              message="权限演示提示"
              description="例如为 QC User 勾选 LED_CONTROL，保存后切换为王晨，该用户的“闪烁寻找设备”按钮会立即可用。"
            />
          </>
        )}
      </Drawer>
    </>
  );
}

function DepartmentsAdmin() {
  const [rows, setRows] = useState(departments);
  const [msg, ctx] = message.useMessage();
  return (
    <>
      {ctx}
      <Card
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => msg.success("已新增演示部门")}
          >
            新增部门
          </Button>
        }
      >
        <Table
          rowKey="name"
          dataSource={rows}
          columns={[
            { title: "部门名称", dataIndex: "name", render: (v) => <b>{v}</b> },
            { title: "部门管理员", dataIndex: "manager" },
            { title: "用户数", dataIndex: "users", render: (v) => `${v} 人` },
            { title: "设备数", dataIndex: "devices", render: (v) => `${v} 台` },
            { title: "房间数", dataIndex: "rooms", render: (v) => `${v} 个` },
            {
              title: "状态",
              dataIndex: "status",
              render: (v) => (
                <Tag color={v === "启用" ? "green" : "default"}>{v}</Tag>
              ),
            },
            {
              title: "操作",
              render: (_, r) => (
                <Space>
                  <Button
                    type="link"
                    onClick={() => msg.success(`${r.name} 部门信息已保存`)}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确认切换部门状态？"
                    onConfirm={() => {
                      setRows((x) =>
                        x.map((d) =>
                          d.name === r.name
                            ? {
                                ...d,
                                status: d.status === "启用" ? "停用" : "启用",
                              }
                            : d,
                        ),
                      );
                      msg.success("部门状态已更新");
                    }}
                  >
                    <Button type="link">
                      {r.status === "启用" ? "停用" : "启用"}
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}

function GatewayAdmin() {
  const [msg, ctx] = message.useMessage();
  const [selected, setSelected] = useState<(typeof gateways)[0]>();
  const mock = (text: string) => {
    msg.loading({ content: `正在${text}…`, key: "gw" });
    setTimeout(() => msg.success({ content: `${text}完成`, key: "gw" }), 800);
  };
  return (
    <>
      {ctx}
      <Row gutter={[16, 16]}>
        {[
          ["网关总数", 13],
          ["在线网关", 12],
          ["离线网关", 1],
          ["连接设备", 168],
        ].map(([a, b]) => (
          <Col span={6} key={a}>
            <Card>
              <Typography.Text type="secondary">{a}</Typography.Text>
              <Typography.Title level={3}>{b}</Typography.Title>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="section-row">
        <Table
          rowKey="id"
          dataSource={gateways}
          columns={[
            { title: "Gateway", dataIndex: "id", render: (v) => <b>{v}</b> },
            { title: "Location", dataIndex: "room" },
            { title: "IP", dataIndex: "ip" },
            { title: "Port", dataIndex: "port" },
            {
              title: "Status",
              dataIndex: "online",
              render: (v) => (
                <Tag color={v ? "green" : "red"}>
                  {v ? "Online" : "Offline"}
                </Tag>
              ),
            },
            { title: "Connected Devices", dataIndex: "devices" },
            { title: "Last Heartbeat", dataIndex: "heartbeat" },
            {
              title: "操作",
              render: (_, r) => (
                <Space>
                  <Button type="link" onClick={() => setSelected(r)}>
                    详情
                  </Button>
                  <Button type="link" onClick={() => mock("刷新状态")}>
                    刷新
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title="BLE 网关详情"
        open={!!selected}
        onCancel={() => setSelected(undefined)}
        footer={
          <Space>
            <Button onClick={() => mock("查看连接设备")}>查看设备</Button>
            <Button danger onClick={() => mock("模拟重启")}>
              模拟重启
            </Button>
          </Space>
        }
      >
        {selected && (
          <Descriptions
            bordered
            column={2}
            items={[
              { key: "1", label: "Gateway ID", children: selected.id },
              { key: "2", label: "Room", children: selected.room },
              { key: "3", label: "IP", children: selected.ip },
              { key: "4", label: "Port", children: selected.port },
              {
                key: "5",
                label: "Status",
                children: (
                  <Tag color={selected.online ? "green" : "red"}>
                    {selected.online ? "Online" : "Offline"}
                  </Tag>
                ),
              },
              { key: "6", label: "BLE Devices", children: selected.devices },
              {
                key: "7",
                label: "Last Heartbeat",
                children: selected.heartbeat,
              },
              { key: "8", label: "Uptime", children: selected.uptime },
            ]}
          />
        )}
      </Modal>
    </>
  );
}

function MaximoAdmin() {
  const { syncs, addSync } = useDemo();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [msg, ctx] = message.useMessage();
  const sync = () => {
    setRunning(true);
    setStep(0);
    [500, 1050, 1650].forEach((t, i) => setTimeout(() => setStep(i + 1), t));
    setTimeout(() => {
      const r = {
        id: `SYNC-${Date.now()}`,
        time: new Date().toLocaleString("zh-CN", { hour12: false }),
        scanned: 356,
        inserted: 2,
        updated: 18,
        failed: 0,
        status: "成功",
      };
      addSync(r);
      setRunning(false);
      msg.success("Maximo 模拟同步成功");
    }, 2300);
  };
  return (
    <>
      {ctx}
      <Alert
        type="info"
        showIcon
        message="Mock Integration"
        description="此页面展示未来 Maximo REST API 的集成流程，目前没有连接真实 Maximo 环境。"
      />
      <Row gutter={[16, 16]} className="section-row">
        <Col span={15}>
          <Card title="连接与同步状态">
            <Descriptions
              column={2}
              items={[
                {
                  key: "1",
                  label: "连接状态",
                  children: <Tag color="green">正常（Mock）</Tag>,
                },
                {
                  key: "2",
                  label: "REST API",
                  children: "/maxrest/rest/os/MXASSET",
                },
                {
                  key: "3",
                  label: "数据对象",
                  children: "ASSET / LOCATIONS / PERSON",
                },
                { key: "4", label: "最后同步", children: syncs[0]?.time },
                { key: "5", label: "下次同步", children: "今天 16:00" },
                { key: "6", label: "设备总数", children: "356" },
              ]}
            />
            <Divider />
            <div className="sync-flow">
              <span>Maximo</span>
              <b>REST API ↓</b>
              <span>Application Database</span>
              <b>Normalization ↓</b>
              <span>Equipment Platform</span>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<SyncOutlined spin={running} />}
              loading={running}
              onClick={sync}
            >
              立即同步
            </Button>
            {running && (
              <div className="sync-progress">
                <Steps
                  current={step}
                  size="small"
                  items={[
                    { title: "连接 Maximo" },
                    { title: "读取 ASSET" },
                    { title: "更新本地数据" },
                    { title: "完成" },
                  ]}
                />
                <Progress percent={Math.min(95, step * 32)} status="active" />
              </div>
            )}
          </Card>
        </Col>
        <Col span={9}>
          <Card title="最近同步结果">
            <div className="sync-result">
              <CheckCircleOutlined />
              <h2>同步成功</h2>
              <p>{syncs[0]?.time}</p>
              <div>
                <span>
                  Scanned<b>{syncs[0]?.scanned}</b>
                </span>
                <span>
                  Inserted<b>{syncs[0]?.inserted}</b>
                </span>
                <span>
                  Updated<b>{syncs[0]?.updated}</b>
                </span>
                <span>
                  Failed<b>{syncs[0]?.failed}</b>
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <Card title="同步历史" className="section-row">
        <Table
          rowKey="id"
          dataSource={syncs}
          pagination={false}
          columns={[
            { title: "时间", dataIndex: "time" },
            { title: "Scanned", dataIndex: "scanned" },
            { title: "Inserted", dataIndex: "inserted" },
            { title: "Updated", dataIndex: "updated" },
            { title: "Failed", dataIndex: "failed" },
            {
              title: "状态",
              dataIndex: "status",
              render: (v) => <Tag color="green">{v}</Tag>,
            },
          ]}
        />
      </Card>
    </>
  );
}

function SettingsAdmin() {
  const { rules, toggleRule } = useDemo();
  const [msg, ctx] = message.useMessage();
  return (
    <>
      {ctx}
      {/* <Alert
        type="info"
        showIcon
        message="邮件服务为 Mock 模式"
        description="规则修改会保存在当前浏览器中，但不会向真实收件人发送邮件。"
      /> */}
      <Card className="section-row">
        <Table
          rowKey="id"
          dataSource={rules}
          pagination={false}
          columns={[
            { title: "规则名称", dataIndex: "name", render: (v) => <b>{v}</b> },
            { title: "触发条件", dataIndex: "condition" },
            { title: "通知对象", dataIndex: "audience" },
            { title: "邮件模板", dataIndex: "template" },
            {
              title: "是否启用",
              dataIndex: "enabled",
              render: (v, r) => (
                <Switch
                  checked={v}
                  onChange={(x) => {
                    toggleRule(r.id, x);
                    msg.success("通知规则已保存");
                  }}
                />
              ),
            },
            {
              title: "操作",
              render: () => (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => msg.info("模板编辑功能为演示交互")}
                >
                  编辑
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}

function LogsAdmin() {
  const { logs, resetDemo } = useDemo();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<string>();
  const [msg, ctx] = message.useMessage();
  const view = logs
    .filter(
      (l) =>
        !query ||
        `${l.user}${l.object}${l.detail}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .filter((l) => !action || l.action === action);
  return (
    <>
      {ctx}
      <Card className="filter-card">
        <Space wrap>
          <Input
            placeholder="用户、对象或详情"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="操作类型"
            value={action}
            onChange={setAction}
            style={{ width: 170 }}
            options={[...new Set(logs.map((l) => l.action))].map((x) => ({
              value: x,
              label: x,
            }))}
          />
          <Popconfirm
            title="确定重置所有 Demo 数据？"
            description="权限、预警状态、日志和同步记录将恢复初始值。"
            onConfirm={() => {
              resetDemo();
              msg.success("Demo 数据已重置");
            }}
          >
            <Button danger icon={<ReloadOutlined />}>
              重置 Demo 数据
            </Button>
          </Popconfirm>
        </Space>
      </Card>
      <Card className="table-card">
        <Table
          rowKey="id"
          dataSource={view}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: "时间", dataIndex: "time", width: 190 },
            { title: "用户", dataIndex: "user", width: 110 },
            { title: "部门", dataIndex: "department", width: 110 },
            {
              title: "操作",
              dataIndex: "action",
              width: 140,
              render: (v) => <Tag color="blue">{v}</Tag>,
            },
            { title: "对象", dataIndex: "object", width: 150 },
            {
              title: "结果",
              dataIndex: "result",
              width: 85,
              render: (v) => <Tag color="green">{v}</Tag>,
            },
            { title: "详情", dataIndex: "detail" },
          ]}
        />
      </Card>
    </>
  );
}
