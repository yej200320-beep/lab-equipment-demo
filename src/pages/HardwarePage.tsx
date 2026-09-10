import {
  ApiOutlined,
  HddOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  SearchOutlined,
  ToolOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Input,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { devices, systemHardware } from "../mock/data";
import { useDemo } from "../store/DemoContext";
import type { SystemHardware, SystemHardwareType } from "../types";

const typeColor: Record<SystemHardwareType, string> = {
  "BLE 网关": "blue",
  定位基站: "cyan",
  电子标签写入器: "purple",
};

export default function HardwarePage() {
  const { hasPermission, addLog } = useDemo();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SystemHardwareType>();
  const [status, setStatus] = useState<string>();
  const [selected, setSelected] = useState<SystemHardware>();
  const [msg, contextHolder] = message.useMessage();
  const canManage = hasPermission("SYSTEM_CONFIG");
  const rows = useMemo(
    () =>
      systemHardware.filter(
        (item) =>
          (!query ||
            `${item.id}${item.name}${item.room}${item.ip}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (!type || item.type === type) &&
          (!status || String(item.online) === status),
      ),
    [query, type, status],
  );
  const operate = (action: string, item: SystemHardware) => {
    if (!canManage) {
      msg.warning("当前身份仅能查看系统硬件");
      return;
    }
    msg.loading({ content: `正在${action}…`, key: "hardware" });
    setTimeout(() => {
      msg.success({ content: `${action}完成`, key: "hardware" });
      addLog(action, item.id, `${item.type} · ${item.room}`);
    }, 800);
  };

  if (!hasPermission("LOCATION_VIEW") && !canManage) {
    return (
      <Alert
        showIcon
        type="error"
        message="无权查看系统硬件"
        description="当前身份未获得位置查看或系统配置权限。"
      />
    );
  }

  return (
    <>
      {contextHolder}
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>系统硬件</Typography.Title>
          <Typography.Text type="secondary">
            管理平台部署的蓝牙网关、定位基站与电子标签写入器
          </Typography.Text>
        </div>
        {/* <Tag icon={<HddOutlined />} color="blue">
          平台自有硬件 · 独立于 Maximo 设备台账
        </Tag> */}
      </div>

      <Row gutter={[16, 16]}>
        {[
          ["硬件总数", systemHardware.length, "台"],
          [
            "在线硬件",
            systemHardware.filter((item) => item.online).length,
            "台",
          ],
          [
            "异常硬件",
            systemHardware.filter((item) => !item.online).length,
            "台",
          ],
          [
            "连接设备",
            systemHardware.reduce(
              (sum, item) => sum + item.connectedDevices,
              0,
            ),
            "个",
          ],
        ].map(([title, value, suffix], index) => (
          <Col xs={12} xl={6} key={String(title)}>
            <Card className={`hardware-stat hardware-stat-${index}`}>
              <Statistic title={title} value={Number(value)} suffix={suffix} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* <Alert
        className="section-row"
        showIcon
        type="info"
        message="资产边界"
        description="设备列表展示甲方 Maximo 设备；本页展示二次开发平台自有硬件，可由系统管理员执行诊断、刷新和重启操作。"
      /> */}

      <Card className="filter-card">
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="硬件编号、名称、房间或 IP"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ width: 320 }}
          />
          <Select
            allowClear
            placeholder="硬件类型"
            value={type}
            onChange={setType}
            style={{ width: 180 }}
            options={(["BLE 网关", "定位基站", "电子标签写入器"] as const).map(
              (value) => ({ value, label: value }),
            )}
          />
          <Select
            allowClear
            placeholder="在线状态"
            value={status}
            onChange={setStatus}
            style={{ width: 150 }}
            options={[
              { value: "true", label: "在线" },
              { value: "false", label: "离线" },
            ]}
          />
          <Typography.Text type="secondary">
            共 {rows.length} 台
          </Typography.Text>
        </Space>
      </Card>

      <Card className="table-card">
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1240 }}
          columns={[
            {
              title: "硬件",
              dataIndex: "id",
              width: 220,
              render: (value, record) => (
                <button
                  className="link-button"
                  onClick={() => setSelected(record)}
                >
                  <b>{value}</b>
                  <small>{record.name}</small>
                </button>
              ),
            },
            {
              title: "类型",
              dataIndex: "type",
              width: 130,
              render: (value: SystemHardwareType) => (
                <Tag color={typeColor[value]}>{value}</Tag>
              ),
            },
            {
              title: "安装位置",
              width: 180,
              render: (_, record) => (
                <span>
                  {record.room} · {record.position}
                </span>
              ),
            },
            { title: "IP 地址", dataIndex: "ip", width: 130 },
            {
              title: "状态",
              dataIndex: "online",
              width: 90,
              render: (online: boolean) => (
                <Tag color={online ? "green" : "red"}>
                  {online ? "在线" : "离线"}
                </Tag>
              ),
            },
            {
              title: "连接设备",
              dataIndex: "connectedDevices",
              width: 100,
              render: (value: number) => `${value} 个`,
            },
            { title: "固件版本", dataIndex: "firmware", width: 100 },
            { title: "最近上报时间", dataIndex: "heartbeat", width: 120 },
            { title: "负责人", dataIndex: "owner", width: 90 },
            {
              title: "操作",
              fixed: "right",
              width: 150,
              render: (_, record) => (
                <Space size={4}>
                  <Button type="link" onClick={() => setSelected(record)}>
                    详情
                  </Button>
                  <Button
                    type="link"
                    icon={<ReloadOutlined />}
                    onClick={() => operate("刷新状态", record)}
                  >
                    刷新
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        width={620}
        open={!!selected}
        onClose={() => setSelected(undefined)}
        title={selected ? `${selected.id} · ${selected.name}` : "硬件详情"}
        extra={
          selected && (
            <Tag color={selected.online ? "green" : "red"}>
              {selected.online ? "在线" : "离线"}
            </Tag>
          )
        }
      >
        {selected && (
          <>
            {!canManage && (
              <Alert
                showIcon
                type="warning"
                message="当前身份为只读权限"
                description="系统硬件的诊断与控制操作仅对系统管理员开放。"
              />
            )}
            <Descriptions
              className="hardware-detail"
              bordered
              column={2}
              items={[
                { key: "1", label: "硬件类型", children: selected.type },
                { key: "2", label: "设备型号", children: selected.model },
                { key: "3", label: "序列号", children: selected.serialNumber },
                { key: "4", label: "负责人", children: selected.owner },
                { key: "5", label: "安装房间", children: selected.room },
                { key: "6", label: "具体位置", children: selected.position },
                {
                  key: "7",
                  label: "IP / 端口",
                  children: `${selected.ip}:${selected.port}`,
                },
                { key: "8", label: "固件版本", children: selected.firmware },
                { key: "9", label: "最近上报时间", children: selected.heartbeat },
                { key: "10", label: "连续运行", children: selected.uptime },
              ]}
            />
            <Card size="small" title="当前连接" className="section-row">
              <Space size="large">
                <Statistic
                  title="连接设备"
                  value={selected.connectedDevices}
                  suffix="个"
                />
                <Tag
                  icon={<WifiOutlined />}
                  color={selected.online ? "green" : "red"}
                >
                  {selected.online ? "通信正常" : "通信中断"}
                </Tag>
              </Space>
              {selected.connectedDevices > 0 && (
                <div className="hardware-linked-devices">
                  {devices
                    .filter((device) => device.bleRoom === selected.room)
                    .slice(0, 4)
                    .map((device) => (
                      <Tag key={device.id}>{device.id}</Tag>
                    ))}
                </div>
              )}
            </Card>
            <Card size="small" title="运维操作" className="section-row">
              <Space wrap>
                <Button
                  icon={<ReloadOutlined />}
                  disabled={!canManage}
                  onClick={() => operate("刷新状态", selected)}
                >
                  刷新状态
                </Button>
                <Button
                  icon={<ApiOutlined />}
                  disabled={!canManage}
                  onClick={() => operate("网络诊断", selected)}
                >
                  网络诊断
                </Button>
                <Button
                  icon={<ToolOutlined />}
                  disabled={!canManage}
                  onClick={() => operate("配置检查", selected)}
                >
                  配置检查
                </Button>
                <Button
                  danger
                  icon={<PoweroffOutlined />}
                  disabled={!canManage}
                  onClick={() => operate("模拟重启", selected)}
                >
                  模拟重启
                </Button>
              </Space>
            </Card>
          </>
        )}
      </Drawer>
    </>
  );
}
