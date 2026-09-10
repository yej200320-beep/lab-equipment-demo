import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LifecycleTag, OnlineBadge, RiskTag } from "../components/StatusTag";
import { departments, devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";
import type { Device, ProcessMetric } from "../types";

function ProcessMetricCell({ metric }: { metric: ProcessMetric }) {
  const color =
    metric.status === "正常"
      ? "green"
      : metric.status === "关注"
        ? "orange"
        : "default";
  return (
    <div className="process-metric-cell">
      <span>{metric.value}</span>
      <Tag color={color}>{metric.status}</Tag>
    </div>
  );
}

export default function DevicesPage() {
  const { visibleDepartments } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = `${location.pathname}${location.search}`;
  const [params] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [dept, setDept] = useState<string>();
  const [room, setRoom] = useState<string>();
  const [online, setOnline] = useState<string>();
  const [quick, setQuick] = useState(params.get("quick") || "all");
  const source = useMemo(
    () =>
      devices
        .filter((d) => visibleDepartments.includes(d.department))
        .filter(
          (d) =>
            !keyword ||
            `${d.id}${d.name}${d.labelName}${d.bleRoom}${d.owner}`
              .toLowerCase()
              .includes(keyword.toLowerCase()),
        )
        .filter((d) => !dept || d.department === dept)
        .filter((d) => !room || d.bleRoom === room)
        .filter((d) => !online || String(d.online) === online)
        .filter(
          (d) =>
            quick === "all" ||
            (quick === "overdue" && d.overall === "OVERDUE") ||
            (quick === "red" && d.overall === "RED") ||
            (quick === "yellow" && d.overall === "YELLOW") ||
            (quick === "normal" && d.overall === "GREEN") ||
            (quick === "offline" && !d.online) ||
            (quick === "low" && d.battery < 20),
        ),
    [visibleDepartments, keyword, dept, room, online, quick],
  );
  const columns = [
    {
      title: "状态",
      dataIndex: "overall",
      width: 84,
      filters: [
        { text: "已过期", value: "OVERDUE" },
        { text: "7天内", value: "RED" },
        { text: "8–14天", value: "YELLOW" },
        { text: "正常", value: "GREEN" },
      ],
      onFilter: (v: unknown, r: Device) => r.overall === v,
      render: (v: Device["overall"]) => <RiskTag status={v} />,
    },
    {
      title: "设备",
      dataIndex: "id",
      width: 170,
      sorter: (a: Device, b: Device) => a.id.localeCompare(b.id),
      render: (v: string, r: Device) => (
        <button
          className="link-button"
          onClick={() => navigate(`/devices/${v}`, { state: { returnTo } })}
        >
          <b>{v}</b>
          <small>
            {r.labelName} · {r.name}
          </small>
        </button>
      ),
    },
    { title: "部门", dataIndex: "department", width: 110 },
    { title: "当前位置", dataIndex: "bleRoom", width: 110 },
    {
      title: "Calibration",
      dataIndex: "cal",
      width: 125,
      sorter: (a: Device, b: Device) =>
        (a.cal.days ?? 999) - (b.cal.days ?? 999),
      render: (v: Device["cal"]) => <LifecycleTag item={v} />,
    },
    {
      title: "PM",
      dataIndex: "pm",
      width: 125,
      render: (v: Device["pm"]) => <LifecycleTag item={v} />,
    },
    {
      title: "Validation",
      dataIndex: "val",
      width: 125,
      render: (v: Device["val"]) => <LifecycleTag item={v} />,
    },
    {
      title: "pH",
      width: 94,
      render: (_: unknown, r: Device) => (
        <ProcessMetricCell metric={r.process.ph} />
      ),
    },
    {
      title: "温度",
      width: 104,
      render: (_: unknown, r: Device) => (
        <ProcessMetricCell metric={r.process.temperature} />
      ),
    },
    {
      title: "色谱状态",
      width: 112,
      render: (_: unknown, r: Device) => (
        <ProcessMetricCell metric={r.process.chromatography} />
      ),
    },
    {
      title: "转速",
      width: 112,
      render: (_: unknown, r: Device) => (
        <ProcessMetricCell metric={r.process.speed} />
      ),
    },
    {
      title: "压力",
      width: 108,
      render: (_: unknown, r: Device) => (
        <ProcessMetricCell metric={r.process.pressure} />
      ),
    },
    {
      title: "BLE",
      dataIndex: "online",
      width: 90,
      render: (v: boolean) => <OnlineBadge online={v} />,
    },
    {
      title: "电量",
      dataIndex: "battery",
      width: 80,
      sorter: (a: Device, b: Device) => a.battery - b.battery,
      render: (v: number) => (
        <Tag color={v < 20 ? "red" : v < 40 ? "gold" : "green"}>{v}%</Tag>
      ),
    },
    {
      title: "操作",
      fixed: "right" as const,
      width: 80,
      render: (_: unknown, r: Device) => (
        <Button
          type="link"
          onClick={() => navigate(`/devices/${r.id}`, { state: { returnTo } })}
        >
          详情
        </Button>
      ),
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>设备列表</Typography.Title>
          <Typography.Text type="secondary">
            集中查看设备台账、生命周期状态与 BLE 状态
          </Typography.Text>
        </div>
        <Typography.Text type="secondary">
          共 {source.length} 台设备
        </Typography.Text>
      </div>
      <Card className="filter-card">
        <Row gutter={[12, 12]}>
          <Col flex="360px">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="设备编号、名称、责任人"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="部门"
              value={dept}
              onChange={setDept}
              options={departments
                .filter((x) => visibleDepartments.includes(x.name))
                .map((x) => ({ value: x.name, label: x.name }))}
              style={{ width: 145 }}
            />
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="房间"
              value={room}
              onChange={setRoom}
              options={[...new Set(devices.map((d) => d.bleRoom))].map((x) => ({
                value: x,
                label: x,
              }))}
              style={{ width: 145 }}
            />
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="BLE 状态"
              value={online}
              onChange={setOnline}
              options={[
                { value: "true", label: "在线" },
                { value: "false", label: "离线" },
              ]}
              style={{ width: 135 }}
            />
          </Col>
          <Col>
            <Button
              onClick={() => {
                setKeyword("");
                setDept(undefined);
                setRoom(undefined);
                setOnline(undefined);
                setQuick("all");
              }}
            >
              重置
            </Button>
          </Col>
        </Row>
        <Space wrap className="quick-filters">
          {[
            ["all", "全部"],
            ["overdue", "已过期"],
            ["red", "7天内"],
            ["yellow", "8-14天"],
            ["normal", "正常"],
            ["offline", "离线"],
            ["low", "低电量"],
          ].map(([k, l]) => (
            <Button
              key={k}
              type={quick === k ? "primary" : "default"}
              size="small"
              onClick={() => setQuick(k)}
            >
              {l}
            </Button>
          ))}
        </Space>
      </Card>
      <Card className="table-card">
        <Table
          rowKey="id"
          dataSource={source}
          columns={columns}
          size="middle"
          scroll={{ x: 1840 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </Card>
    </>
  );
}
