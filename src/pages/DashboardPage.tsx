import {
  CheckCircleOutlined,
  CloudSyncOutlined,
  MailOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";
import { statusMeta } from "../utils/status";

export default function DashboardPage() {
  const { alerts, visibleDepartments } = useDemo();
  const navigate = useNavigate();
  const view = devices.filter((d) => visibleDepartments.includes(d.department));
  const count = (s: string) => view.filter((d) => d.overall === s).length;
  const pending = alerts.filter(
    (a) => a.status !== "CLOSED" && visibleDepartments.includes(a.department),
  ).length;
  const focus = [...view]
    .sort((a, b) => (a.cal.days ?? 999) - (b.cal.days ?? 999))
    .slice(0, 5);
  const statusData = (["GREEN", "YELLOW", "RED", "OVERDUE"] as const).map(
    (s) => ({
      value: count(s),
      name: statusMeta[s].label,
      itemStyle: {
        color: {
          GREEN: "#22936f",
          YELLOW: "#d69e2e",
          RED: "#d94b4b",
          OVERDUE: "#7c3aed",
        }[s],
      },
    }),
  );
  const deptData = ["QC", "Production", "Engineering", "Laboratory"]
    .filter((x) => visibleDepartments.includes(x))
    .map((name) => ({
      name,
      value: view.filter((d) => d.department === name).length,
    }));
  return (
    <>
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>运营总览</Typography.Title>
        </div>
        <Space>
          <Tag icon={<CloudSyncOutlined />} color="green">
            Maximo 10 分钟前已同步
          </Tag>
          <Button onClick={() => navigate("/devices")}>查看设备</Button>
        </Space>
      </div>
      <Row gutter={[16, 16]}>
        {[
          ["设备总数", view.length, "台", "primary", "all"],
          ["正常设备", count("GREEN"), "台", "success", "normal"],
          ["7 天内到期", count("RED"), "项", "danger", "red"],
          ["8–14 天到期", count("YELLOW"), "项", "warning", "yellow"],
          ["已过期", count("OVERDUE"), "项", "purple", "overdue"],
          ["待处理预警", pending, "条", "danger", "alerts"],
        ].map(([t, v, s, tone, filter]) => (
          <Col xs={12} xl={4} key={String(t)}>
            <Card
              className={`metric ${tone}`}
              hoverable
              onClick={() =>
                navigate(
                  filter === "alerts" ? "/alerts" : `/devices?quick=${filter}`,
                )
              }
            >
              <Statistic title={t} value={Number(v)} suffix={s} />
              <Progress
                percent={
                  view.length ? Math.round((Number(v) / view.length) * 100) : 0
                }
                showInfo={false}
                size="small"
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} className="section-row">
        <Col xs={24} xl={8}>
          <Card
            title="到期状态分布"
            extra={
              <Button type="link" onClick={() => navigate("/devices")}>
                查看明细
              </Button>
            }
          >
            <ReactECharts
              option={{
                tooltip: { trigger: "item" },
                legend: { bottom: 0, icon: "circle" },
                series: [
                  {
                    type: "pie",
                    radius: ["52%", "74%"],
                    center: ["50%", "43%"],
                    data: statusData,
                  },
                ],
              }}
              style={{ height: 278 }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={7}>
          <Card title="部门设备分布">
            <ReactECharts
              option={{
                grid: { left: 34, right: 16, top: 12, bottom: 32 },
                xAxis: {
                  type: "category",
                  data: deptData.map((x) => x.name),
                  axisLabel: { fontSize: 11 },
                },
                yAxis: {
                  type: "value",
                  splitLine: { lineStyle: { color: "#edf0f2" } },
                },
                series: [
                  {
                    type: "bar",
                    data: deptData.map((x) => x.value),
                    barWidth: 26,
                    itemStyle: { color: "#176b87", borderRadius: [5, 5, 0, 0] },
                  },
                ],
              }}
              style={{ height: 278 }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card
            title="重点关注"
            extra={
              <Button type="link" onClick={() => navigate("/alerts")}>
                全部预警
              </Button>
            }
          >
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={focus}
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
                  render: (v) => (
                    <Tag color={statusMeta[v as keyof typeof statusMeta].color}>
                      {statusMeta[v as keyof typeof statusMeta].label}
                    </Tag>
                  ),
                },
                { title: "位置", dataIndex: "bleRoom" },
                {
                  title: "",
                  render: (_, r) => (
                    <Button
                      size="small"
                      onClick={() => navigate(`/devices/${r.id}`)}
                    >
                      查看
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
      <Card title="系统连接状态" className="section-row">
        <Row gutter={[28, 16]}>
          {[
            [
              <CloudSyncOutlined />,
              "Maximo 同步",
              "正常",
              "最后同步 10 分钟前",
              100,
            ],
            [
              <WifiOutlined />,
              "BLE 网关",
              "12 / 13 在线",
              "1 个网关需要关注",
              92,
            ],
            [<MailOutlined />, "邮件服务", "正常", "当前队列 0", 100],
            [
              <CheckCircleOutlined />,
              "数据完整度",
              "98.6%",
              "2 项数据待确认",
              98.6,
            ],
          ].map(([icon, a, b, c, p], i) => (
            <Col xs={12} lg={6} key={i}>
              <div className="system-card">
                <span className="system-icon">{icon}</span>
                <div>
                  <small>{a}</small>
                  <strong>{b}</strong>
                  <Typography.Text type="secondary">{c}</Typography.Text>
                </div>
                <Progress
                  type="circle"
                  percent={Number(p)}
                  size={42}
                  format={() => ""}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </>
  );
}
