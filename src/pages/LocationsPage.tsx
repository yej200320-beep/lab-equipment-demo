import {
  AimOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
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
  Input,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OnlineBadge, RiskTag } from "../components/StatusTag";
import { devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";
import { signalLabel } from "../utils/status";

export default function LocationsPage() {
  const { visibleDepartments, hasPermission, addLog } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const [msg, ctx] = message.useMessage();
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [query, setQuery] = useState("EQ-001527");
  const [found, setFound] = useState<(typeof devices)[0]>();
  const view = devices.filter((d) => visibleDepartments.includes(d.department));
  const rooms = [...new Set(view.map((d) => d.bleRoom))];
  if (location.pathname === "/finder")
    return (
      <>
        {ctx}
        <div className="page-heading">
          <div>
            <Typography.Title level={2}>设备查找</Typography.Title>
            <Typography.Text type="secondary">
              根据 BLE 标签最后出现的房间快速定位设备
            </Typography.Text>
          </div>
        </div>
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
            onSearch={() => {
              const hit = view.find((d) =>
                `${d.id}${d.name}`.toLowerCase().includes(query.toLowerCase()),
              );
              setFound(hit);
              if (!hit) msg.warning("未找到当前权限范围内的设备");
            }}
            placeholder="输入设备编号或名称"
          />
        </Card>
        {found && (
          <Card className="finder-result">
            <Row gutter={24} align="middle">
              <Col flex="auto">
                <Space>
                  <div className="finder-pin">
                    <EnvironmentOutlined />
                  </div>
                  <div>
                    <Typography.Text type="secondary">
                      BLE LAST SEEN
                    </Typography.Text>
                    <Typography.Title level={2}>
                      {found.bleRoom}
                    </Typography.Title>
                    <Typography.Text>
                      {found.id} · {found.name}
                    </Typography.Text>
                  </div>
                </Space>
              </Col>
              <Col>
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
                  ]}
                />
              </Col>
              <Col>
                <Space direction="vertical">
                  <Button onClick={() => navigate(`/devices/${found.id}`)}>
                    设备详情
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<AimOutlined />}
                    disabled={!hasPermission("LED_CONTROL")}
                    onClick={() => {
                      msg.loading({
                        content: `正在通过 ${found.gateway} 下发指令…`,
                        key: "led",
                      });
                      setTimeout(() => {
                        msg.success({
                          content: "LED 闪烁指令发送成功",
                          key: "led",
                        });
                        addLog(
                          "LED 查找",
                          found.id,
                          `位置 ${found.bleRoom} / 网关 ${found.gateway}`,
                        );
                      }, 900);
                    }}
                  >
                    闪烁寻找
                  </Button>
                </Space>
              </Col>
            </Row>
            <Alert
              className="section-row"
              showIcon
              type="info"
              message="定位说明"
              description="系统展示 BLE 网关最后检测到该标签的房间和 RSSI 信号强度，不将信号强度换算为精确距离。"
            />
          </Card>
        )}
      </>
    );
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
            以房间和区域为单位查看设备在线与预警状态
          </Typography.Text>
        </div>
        <Tag icon={<WifiOutlined />} color="green">
          12 / 13 网关在线
        </Tag>
      </div>
      <Typography.Title level={5} className="building-title">
        Building A · Laboratory Area
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {rooms.map((room) => {
          const ds = view.filter((d) => d.bleRoom === room),
            off = ds.filter((d) => !d.online).length,
            alert = ds.filter((d) => d.overall !== "GREEN").length;
          return (
            <Col xs={12} lg={8} xl={6} key={room}>
              <Card
                hoverable
                className={`room-card ${selectedRoom === room ? "selected" : ""}`}
                onClick={() => setSelectedRoom(room)}
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
                <Typography.Title level={4}>{room}</Typography.Title>
                <div className="room-stats">
                  <span>
                    <b>{ds.length}</b> Devices
                  </span>
                  <span>
                    <b>{ds.length - off}</b> Online
                  </span>
                  <span className={alert ? "text-danger" : ""}>
                    <b>{alert}</b> Alerts
                  </span>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      {selectedRoom && (
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
                <p>
                  Building A · Floor{" "}
                  {selectedRoom.startsWith("Room 3")
                    ? 3
                    : selectedRoom.startsWith("Room 2")
                      ? 2
                      : 1}
                </p>
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
                  { title: "Last Seen", dataIndex: "lastSeen" },
                ]}
              />
            </Col>
          </Row>
        </Card>
      )}
    </>
  );
}
