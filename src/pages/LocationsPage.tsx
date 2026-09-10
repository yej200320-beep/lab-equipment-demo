import {
  AimOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
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
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OnlineBadge, RiskTag } from "../components/StatusTag";
import { devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";
import type { Device } from "../types";
import { signalLabel } from "../utils/status";

const floorPlans = [
  {
    floor: "3F",
    label: "三层 · 仪器分析区",
    rooms: [
      { id: "Room 301", position: "西侧" },
      { id: "Room 302", position: "东侧" },
    ],
  },
  {
    floor: "2F",
    label: "二层 · 核心实验区",
    rooms: [
      { id: "Room 201", position: "西侧" },
      { id: "Room 202", position: "中部" },
      { id: "Room 203", position: "东侧" },
    ],
  },
  {
    floor: "1F",
    label: "一层 · 样品与准备区",
    rooms: [
      { id: "Room 101", position: "西侧" },
      { id: "Room 105", position: "东侧" },
    ],
  },
];

function roomPosition(room: string) {
  const floor = floorPlans.find((item) =>
    item.rooms.some((entry) => entry.id === room),
  );
  const entry = floor?.rooms.find((item) => item.id === room);
  return floor && entry ? `${floor.floor} · ${entry.position}` : "位置未配置";
}

export default function LocationsPage() {
  const { visibleDepartments, hasPermission, addLog } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const [msg, ctx] = message.useMessage();
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [query, setQuery] = useState("EQ-001527");
  const [found, setFound] = useState<Device>();
  const view = devices.filter((d) => visibleDepartments.includes(d.department));
  const rooms = [...new Set(view.map((d) => d.bleRoom))];

  const findDevice = (value = query) => {
    const normalized = value.trim().toLowerCase();
    const hit = view.find((d) =>
      `${d.id}${d.name}${d.tagId}`.toLowerCase().includes(normalized),
    );
    setFound(hit);
    if (!hit) msg.warning("未找到当前权限范围内的设备");
  };

  const flashDevice = (device: Device) => {
    msg.loading({
      content: `正在通过 ${device.gateway} 下发指令…`,
      key: "led",
    });
    setTimeout(() => {
      msg.success({ content: "LED 闪烁指令发送成功", key: "led" });
      addLog(
        "LED 查找",
        device.id,
        `位置 ${device.bleRoom} / 网关 ${device.gateway}`,
      );
    }, 900);
  };

  if (location.pathname === "/finder") {
    const queue = view
      .filter(
        (d) => !d.online || d.rssi < -70 || d.maximoLocation !== d.bleRoom,
      )
      .slice(0, 8);
    const nearby = found
      ? view
          .filter((d) => d.bleRoom === found.bleRoom && d.id !== found.id)
          .sort((a, b) => b.rssi - a.rssi)
          .slice(0, 4)
      : [];
    return (
      <>
        {ctx}
        <div className="page-heading">
          <div>
            <Typography.Title level={2}>设备查找</Typography.Title>
            <Typography.Text type="secondary">
              结合 BLE 最后出现位置、信号强度和房间方位定位设备
            </Typography.Text>
          </div>
        </div>
        <Row gutter={[14, 14]} className="finder-stats">
          <Col span={8}>
            <Card>
              <Statistic title="权限范围设备" value={view.length} suffix="台" />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="覆盖房间" value={rooms.length} suffix="间" />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="待确认位置"
                value={queue.length}
                suffix="台"
                valueStyle={{ color: queue.length ? "#d46b08" : undefined }}
              />
            </Card>
          </Col>
        </Row>
        <Card className="finder-card">
          <Input.Search
            size="large"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            enterButton={
              <>
                <SearchOutlined /> 查找设备
              </>
            }
            onSearch={findDevice}
            placeholder="输入设备编号、名称或标签 ID"
          />
          <div className="finder-shortcuts">
            <Typography.Text type="secondary">快速选择：</Typography.Text>
            {view.slice(0, 4).map((d) => (
              <Button
                key={d.id}
                size="small"
                onClick={() => {
                  setQuery(d.id);
                  setFound(d);
                }}
              >
                {d.id}
              </Button>
            ))}
          </div>
        </Card>
        {found && (
          <Card className="finder-result">
            <Row gutter={[24, 20]} align="middle">
              <Col xs={24} xl={9}>
                <Space align="start">
                  <div className="finder-pin">
                    <EnvironmentOutlined />
                  </div>
                  <div>
                    <Typography.Text type="secondary">
                      BLE 最近检测位置
                    </Typography.Text>
                    <Typography.Title level={2}>
                      {found.bleRoom}
                    </Typography.Title>
                    <Tag color="blue">{roomPosition(found.bleRoom)}</Tag>
                    <Typography.Paragraph className="finder-device-name">
                      {found.id} · {found.name}
                    </Typography.Paragraph>
                  </div>
                </Space>
              </Col>
              <Col xs={24} xl={9}>
                <Descriptions
                  column={1}
                  size="small"
                  items={[
                    { key: "1", label: "检测网关", children: found.gateway },
                    {
                      key: "2",
                      label: "信号强度",
                      children: `${signalLabel(found.rssi)} · ${found.rssi} dBm`,
                    },
                    { key: "3", label: "最后发现", children: found.lastSeen },
                    {
                      key: "4",
                      label: "台账位置",
                      children: found.maximoLocation,
                    },
                  ]}
                />
              </Col>
              <Col xs={24} xl={6}>
                <Space direction="vertical" className="finder-actions">
                  <Button
                    block
                    onClick={() => navigate(`/devices/${found.id}`)}
                  >
                    设备详情
                  </Button>
                  <Button
                    block
                    type="primary"
                    danger
                    icon={<AimOutlined />}
                    disabled={!hasPermission("LED_CONTROL")}
                    onClick={() => flashDevice(found)}
                  >
                    闪烁寻找
                  </Button>
                </Space>
              </Col>
            </Row>
            <Alert
              className="section-row"
              showIcon
              type={
                found.maximoLocation === found.bleRoom ? "success" : "warning"
              }
              message={
                found.maximoLocation === found.bleRoom
                  ? "BLE 位置与 Maximo 台账一致"
                  : "BLE 位置与 Maximo 台账不一致"
              }
              description="系统只展示网关最后检测到标签的位置，不将 RSSI 信号强度换算为精确距离。"
            />
            <div className="nearby-devices">
              <Typography.Title level={5}>同房间附近设备</Typography.Title>
              {nearby.length ? (
                <Space wrap>
                  {nearby.map((d) => (
                    <Button
                      key={d.id}
                      onClick={() => {
                        setQuery(d.id);
                        setFound(d);
                      }}
                    >
                      {d.id} · {signalLabel(d.rssi)}
                    </Button>
                  ))}
                </Space>
              ) : (
                <Typography.Text type="secondary">
                  当前房间没有其他可见设备
                </Typography.Text>
              )}
            </div>
          </Card>
        )}
        <Card title="定位确认队列" className="section-row table-card">
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={queue}
            columns={[
              {
                title: "设备",
                render: (_: unknown, d: Device) => (
                  <button
                    className="link-button"
                    onClick={() => {
                      setQuery(d.id);
                      setFound(d);
                    }}
                  >
                    <b>{d.id}</b>
                    <small>{d.name}</small>
                  </button>
                ),
              },
              {
                title: "BLE 位置",
                dataIndex: "bleRoom",
                render: (value: string) => (
                  <Tag icon={<EnvironmentOutlined />}>{value}</Tag>
                ),
              },
              { title: "Maximo 位置", dataIndex: "maximoLocation" },
              {
                title: "信号",
                dataIndex: "rssi",
                render: (value: number) =>
                  `${signalLabel(value)} · ${value} dBm`,
              },
              {
                title: "状态",
                render: (_: unknown, d: Device) => (
                  <OnlineBadge online={d.online} />
                ),
              },
              { title: "最后发现", dataIndex: "lastSeen" },
            ]}
          />
        </Card>
      </>
    );
  }

  if (location.pathname === "/movement") {
    const rows = view.slice(0, 14).map((d, i) => ({
      key: i,
      time: `2026-09-03 ${String(20 - (i % 11)).padStart(2, "0")}:${String(i * 4).padStart(2, "0")}`,
      device: d.id,
      from: i % 3 === 0 ? "Room 201" : d.maximoLocation,
      to: d.bleRoom,
      gateway: d.gateway,
    }));
    return (
      <>
        <div className="page-heading">
          <div>
            <Typography.Title level={2}>移动历史</Typography.Title>
            <Typography.Text type="secondary">
              查看设备在不同房间之间的最近检测记录
            </Typography.Text>
          </div>
        </div>
        <Card className="filter-card">
          <Space wrap>
            <Input
              prefix={<SearchOutlined />}
              placeholder="设备编号"
              style={{ width: 230 }}
            />
            <Select
              placeholder="房间"
              allowClear
              style={{ width: 150 }}
              options={rooms.map((x) => ({ value: x, label: x }))}
            />
            <Button type="primary">查询</Button>
          </Space>
        </Card>
        <Card className="table-card">
          <Table
            dataSource={rows}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: "时间", dataIndex: "time" },
              {
                title: "设备",
                dataIndex: "device",
                render: (v) => (
                  <Button type="link" onClick={() => navigate(`/devices/${v}`)}>
                    {v}
                  </Button>
                ),
              },
              { title: "原房间", dataIndex: "from" },
              {
                title: "检测房间",
                dataIndex: "to",
                render: (v) => <Tag icon={<EnvironmentOutlined />}>{v}</Tag>,
              },
              { title: "网关", dataIndex: "gateway" },
              {
                title: "事件",
                render: () => (
                  <Badge status="processing" text="BLE Last Seen 更新" />
                ),
              },
            ]}
          />
        </Card>
      </>
    );
  }

  const selectedDevices = view.filter((d) => d.bleRoom === selectedRoom);
  return (
    <>
      {ctx}
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>房间视图</Typography.Title>
          <Typography.Text type="secondary">
            按楼层和实际左右方位查看设备分布、在线与预警状态
          </Typography.Text>
        </div>
        <Tag icon={<WifiOutlined />} color="green">
          12 / 13 网关在线
        </Tag>
      </div>
      <div className="building-map">
        <div className="building-map-head">
          <div>
            <Typography.Title level={5}>
              Building A · Laboratory Area
            </Typography.Title>
            <Typography.Text type="secondary">
              图示上方为北侧；房间按西—东方向排列
            </Typography.Text>
          </div>
          <Tag>北 ↑</Tag>
        </div>
        {floorPlans.map((floor) => (
          <section className="floor-plan" key={floor.floor}>
            <div className="floor-label">
              <strong>{floor.floor}</strong>
              <span>{floor.label}</span>
            </div>
            <div
              className={`floor-room-grid floor-room-grid-${floor.rooms.length}`}
            >
              {floor.rooms.map((entry) => {
                const ds = view.filter((d) => d.bleRoom === entry.id);
                const off = ds.filter((d) => !d.online).length;
                const alerts = ds.filter((d) => d.overall !== "GREEN").length;
                return (
                  <Card
                    key={entry.id}
                    hoverable
                    role="button"
                    tabIndex={0}
                    className={`room-card ${selectedRoom === entry.id ? "selected" : ""}`}
                    onClick={() => setSelectedRoom(entry.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedRoom(entry.id);
                      }
                    }}
                  >
                    <div className="room-top">
                      <span>
                        <EnvironmentOutlined />
                      </span>
                      <Badge
                        status={off ? "warning" : "success"}
                        text={off ? "需要关注" : "运行正常"}
                      />
                    </div>
                    <Typography.Title level={4}>{entry.id}</Typography.Title>
                    <Typography.Text type="secondary">
                      {entry.position}
                    </Typography.Text>
                    <div className="room-stats">
                      <span>
                        <b>{ds.length}</b> 设备
                      </span>
                      <span>
                        <b>{ds.length - off}</b> 在线
                      </span>
                      <span className={alerts ? "text-danger" : ""}>
                        <b>{alerts}</b> 预警
                      </span>
                    </div>
                  </Card>
                );
              })}
              <div className="floor-corridor">
                <span>西 ←</span>
                <b>公共走廊 · BLE 网关覆盖带</b>
                <span>→ 东</span>
              </div>
            </div>
          </section>
        ))}
      </div>
      {/* {selectedRoom && (
        <Card
          title={`${selectedRoom} · 房间设备`}
          className="section-row"
          extra={
            <Button onClick={() => setSelectedRoom(undefined)}>关闭</Button>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={7}>
              <div className="room-summary">
                <EnvironmentOutlined />
                <h2>{selectedRoom}</h2>
                <p>{roomPosition(selectedRoom)}</p>
                <div>
                  <span>
                    设备<strong>{selectedDevices.length}</strong>
                  </span>
                  <span>
                    离线
                    <strong>
                      {selectedDevices.filter((d) => !d.online).length}
                    </strong>
                  </span>
                  <span>
                    低电量
                    <strong>
                      {selectedDevices.filter((d) => d.battery < 20).length}
                    </strong>
                  </span>
                </div>
              </div>
            </Col>
            <Col span={17}>
              <Table
                size="small"
                pagination={false}
                rowKey="id"
                dataSource={selectedDevices}
                columns={[
                  {
                    title: "设备",
                    dataIndex: "id",
                    render: (v, r) => (
                      <button
                        className="link-button"
                        onClick={() => navigate(`/devices/${v}`)}
                      >
                        <b>{v}</b>
                        <small>{r.name}</small>
                      </button>
                    ),
                  },
                  {
                    title: "状态",
                    dataIndex: "overall",
                    render: (v) => <RiskTag status={v} />,
                  },
                  {
                    title: "BLE",
                    dataIndex: "online",
                    render: (v) => <OnlineBadge online={v} />,
                  },
                  {
                    title: "信号",
                    dataIndex: "rssi",
                    render: (v) => (
                      <Tag>
                        {signalLabel(v)} · {v} dBm
                      </Tag>
                    ),
                  },
                  { title: "最后发现", dataIndex: "lastSeen" },
                ]}
              />
            </Col>
          </Row>
        </Card>
        )} */}

      <Drawer
        title={`${selectedRoom ?? ""} · 房间设备`}
        placement="bottom"
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(undefined)}
        height="48vh"
        destroyOnClose
        mask={false}
        styles={{
          wrapper: {
            left: 288,
            width: "calc(100% - 288px)",
          },
          mask: {
            left: 288,
            width: "calc(100% - 288px)",
          },
        }}
      >
        {selectedRoom && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={7}>
              <div className="room-summary">
                <EnvironmentOutlined />

                <h2>{selectedRoom}</h2>

                <p>{roomPosition(selectedRoom)}</p>

                <div>
                  <span>
                    设备
                    <strong>{selectedDevices.length}</strong>
                  </span>

                  <span>
                    离线
                    <strong>
                      {selectedDevices.filter((d) => !d.online).length}
                    </strong>
                  </span>

                  <span>
                    低电量
                    <strong>
                      {selectedDevices.filter((d) => d.battery < 20).length}
                    </strong>
                  </span>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={17}>
              <Table
                size="small"
                pagination={false}
                rowKey="id"
                dataSource={selectedDevices}
                columns={[
                  {
                    title: "设备",
                    dataIndex: "id",
                    render: (v, r) => (
                      <button
                        className="link-button"
                        onClick={() => navigate(`/devices/${v}`)}
                      >
                        <b>{v}</b>
                        <small>{r.name}</small>
                      </button>
                    ),
                  },
                  {
                    title: "状态",
                    dataIndex: "overall",
                    render: (v) => <RiskTag status={v} />,
                  },
                  {
                    title: "BLE",
                    dataIndex: "online",
                    render: (v) => <OnlineBadge online={v} />,
                  },
                  {
                    title: "信号",
                    dataIndex: "rssi",
                    render: (v) => (
                      <Tag>
                        {signalLabel(v)} · {v} dBm
                      </Tag>
                    ),
                  },
                  {
                    title: "最后发现",
                    dataIndex: "lastSeen",
                  },
                ]}
              />
            </Col>
          </Row>
        )}
      </Drawer>
    </>
  );
}
