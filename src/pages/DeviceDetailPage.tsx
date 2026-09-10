import {
  AimOutlined,
  ArrowLeftOutlined,
  CloudDownloadOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { EpaperPreview } from "../components/EpaperPreview";
import { OnlineBadge, RiskTag } from "../components/StatusTag";
import { devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";
import type { LifecycleItem } from "../types";
import { riskMessage, signalLabel, statusMeta } from "../utils/status";

function LifecycleCard({
  title,
  item,
}: {
  title: string;
  item: LifecycleItem;
}) {
  const meta = statusMeta[item.status];
  return (
    <Card className={`life-card life-${item.status.toLowerCase()}`}>
      <div className="life-title">
        <span>{title}</span>
        <RiskTag status={item.status} />
      </div>
      <strong>
        {item.days === undefined
          ? "无有效数据"
          : item.days < 0
            ? `已过期 ${Math.abs(item.days)} 天`
            : `剩余 ${item.days} 天`}
      </strong>
      <small>Due: {item.dueDate || "—"}</small>
      <div className="life-line" style={{ background: meta.color }} />
    </Card>
  );
}
export default function DeviceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo || "/devices";
  const { hasPermission, addLog, notifications, logs } = useDemo();
  const d = devices.find((x) => x.id === id);
  const [ledOpen, setLedOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [msg, ctx] = message.useMessage();
  if (!d)
    return (
      <Alert
        type="error"
        message="未找到设备"
        action={<Button onClick={() => navigate(returnTo)}>返回上一页</Button>}
      />
    );
  const doAsync = (
    text: string,
    success: string,
    action: string,
    done?: () => void,
  ) => {
    setLoading(true);
    msg.loading({ content: text, key: "op", duration: 0 });
    setTimeout(() => {
      setLoading(false);
      msg.success({ content: success, key: "op" });
      addLog(action, d.id, success);
      done?.();
    }, 900);
  };
  const movement = [
    ["2026-09-03 20:16", d.bleRoom, d.gateway],
    ["2026-09-03 18:22", "Room 201", "GW-201-01"],
    ["2026-09-03 15:08", "Room 201", "GW-201-02"],
    ["2026-09-03 09:31", "Room 105", "GW-105-01"],
  ];
  return (
    <>
      {ctx}
      <div className="page-heading">
        <Space align="start">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(returnTo)}
          />
          <div>
            <Space>
              <Typography.Title level={2}>{d.id}</Typography.Title>
              <RiskTag status={d.overall} />
              <OnlineBadge online={d.online} />
            </Space>
            <Typography.Text type="secondary">
              {d.labelName} · {d.name} · {riskMessage(d)}
            </Typography.Text>
          </div>
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              doAsync("正在刷新 BLE 位置…", "位置已刷新", "刷新位置")
            }
          >
            刷新位置
          </Button>
          <Button
            icon={<CloudDownloadOutlined />}
            onClick={() => setTagOpen(true)}
          >
            查看标签同步
          </Button>
          <Button
            type="primary"
            danger
            icon={<AimOutlined />}
            disabled={!hasPermission("LED_CONTROL")}
            title={!hasPermission("LED_CONTROL") ? "缺少 LED_CONTROL 权限" : ""}
            onClick={() => setLedOpen(true)}
          >
            闪烁寻找设备
          </Button>
        </Space>
      </div>
      {d.maximoLocation !== d.bleRoom && (
        <Alert
          showIcon
          icon={<WarningOutlined />}
          type="warning"
          message="位置不一致"
          description={`Maximo 台账位置为 ${d.maximoLocation}，BLE 最近检测位置为 ${d.bleRoom}。建议核对后更新正式台账。`}
          className="detail-alert"
        />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card>
            <Row gutter={[14, 14]}>
              <Col span={8}>
                <LifecycleCard title="Calibration" item={d.cal} />
              </Col>
              <Col span={8}>
                <LifecycleCard title="PM" item={d.pm} />
              </Col>
              <Col span={8}>
                <LifecycleCard title="Validation" item={d.val} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card title="现场状态" className="现场">
            <Descriptions
              column={2}
              size="small"
              items={[
                {
                  key: "r",
                  label: "BLE Last Seen",
                  children: <b>{d.bleRoom}</b>,
                },
                { key: "g", label: "Gateway", children: d.gateway },
                {
                  key: "s",
                  label: "信号",
                  children: (
                    <Tag>
                      {signalLabel(d.rssi)} · {d.rssi} dBm
                    </Tag>
                  ),
                },
                { key: "t", label: "最后发现", children: d.lastSeen },
                {
                  key: "b",
                  label: "标签电量",
                  children: (
                    <Tag color={d.battery < 20 ? "red" : "green"}>
                      {d.battery}%
                    </Tag>
                  ),
                },
                {
                  key: "o",
                  label: "状态",
                  children: <OnlineBadge online={d.online} />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
      <Card title="当前运行状态" className="section-row process-status-card">
        <div className="process-status-grid">
          {[
            ["pH", d.process.ph],
            ["温度", d.process.temperature],
            ["色谱", d.process.chromatography],
            ["转速", d.process.speed],
            ["压力", d.process.pressure],
          ].map(([label, metric]) => {
            const item = metric as (typeof d.process)["ph"];
            return (
              <div className="process-status-item" key={label as string}>
                <span>{label as string}</span>
                <strong>{item.value}</strong>
                <Badge
                  status={
                    item.status === "正常"
                      ? "success"
                      : item.status === "关注"
                        ? "warning"
                        : "default"
                  }
                  text={item.status}
                />
              </div>
            );
          })}
        </div>
      </Card>
      <Card className="section-row">
        <Tabs
          items={[
            {
              key: "overview",
              label: "概览",
              children: (
                <Descriptions
                  bordered
                  column={3}
                  size="middle"
                  items={[
                    { key: "1", label: "Asset ID", children: d.id },
                    { key: "2", label: "Description", children: d.name },
                    { key: "3", label: "Model", children: d.model },
                    {
                      key: "4",
                      label: "Serial Number",
                      children: d.serialNumber,
                    },
                    { key: "5", label: "Asset Tag", children: d.assetTag },
                    { key: "6", label: "Department", children: d.department },
                    { key: "7", label: "Owner", children: d.owner },
                    {
                      key: "8",
                      label: "Maximo Location",
                      children: d.maximoLocation,
                    },
                    {
                      key: "9",
                      label: "BLE Last Seen Room",
                      children: d.bleRoom,
                    },
                    { key: "10", label: "Gateway", children: d.gateway },
                    {
                      key: "11",
                      label: "RSSI",
                      children: `${d.rssi} dBm (${signalLabel(d.rssi)})`,
                    },
                    { key: "12", label: "Last Seen", children: d.lastSeen },
                  ]}
                />
              ),
            },
            {
              key: "maintenance",
              label: "维护记录",
              children: (
                <RecordTable
                  rows={[
                    ["2026-08-16", "月度预防维护", "张工", "完成"],
                    ["2026-07-18", "更换泵密封圈", "陈工", "完成"],
                    ["2026-06-20", "运行状态检查", "陈工", "完成"],
                  ]}
                />
              ),
            },
            {
              key: "cal",
              label: "校准记录",
              children: (
                <RecordTable
                  rows={[
                    ["2026-06-06", "年度校准", "李梅", "合格"],
                    ["2025-06-08", "年度校准", "第三方机构", "合格"],
                  ]}
                />
              ),
            },
            {
              key: "val",
              label: "验证记录",
              children: (
                <RecordTable
                  rows={[
                    ["2026-04-12", "运行确认 OQ", "周敏", "通过"],
                    ["2025-04-15", "性能确认 PQ", "周敏", "通过"],
                  ]}
                />
              ),
            },
            {
              key: "movement",
              label: "位置历史",
              children: (
                <Timeline
                  items={movement.map((x) => ({
                    children: (
                      <div>
                        <b>{x[1]}</b>
                        <small>
                          {x[0]} · {x[2]}
                        </small>
                      </div>
                    ),
                  }))}
                />
              ),
            },
            {
              key: "notice",
              label: "通知记录",
              children: (
                <RecordTable
                  rows={notifications
                    .filter((n) => n.deviceId === d.id)
                    .map((n) => [n.time, n.subject, n.recipients, n.status])}
                />
              ),
            },
            {
              key: "audit",
              label: "审计日志",
              children: (
                <RecordTable
                  rows={logs
                    .filter((l) => l.object === d.id)
                    .map((l) => [l.time, l.action, l.user, l.result])}
                />
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title="确认闪烁寻找设备"
        open={ledOpen}
        onCancel={() => setLedOpen(false)}
        onOk={() =>
          doAsync(
            `正在通过 ${d.gateway} 下发指令…`,
            `LED 闪烁指令发送成功 · ${d.bleRoom}`,
            "LED 查找",
            () => setLedOpen(false),
          )
        }
        okText="发送闪烁指令"
        confirmLoading={loading}
      >
        <Alert
          type="info"
          showIcon
          message={`${d.id} · ${d.name}`}
          description={`最近检测位置：${d.bleRoom}　网关：${d.gateway}`}
        />
        <Divider />
        <Typography.Paragraph>
          电子标签 LED 将闪烁约 60秒。
        </Typography.Paragraph>
      </Modal>
      <Modal
        title="电子标签同步状态"
        open={tagOpen}
        onCancel={() => setTagOpen(false)}
        footer={
          <Button type="primary" onClick={() => setTagOpen(false)}>
            关闭
          </Button>
        }
        width={720}
      >
        <Row gutter={24}>
          <Col span={14}>
            <EpaperPreview device={d} />
          </Col>
          <Col span={10}>
            <Descriptions
              column={1}
              size="small"
              items={[
                { key: "1", label: "标签 ID", children: d.tagId },
                {
                  key: "2",
                  label: "BLE 状态",
                  children: <OnlineBadge online={d.online} />,
                },
                { key: "3", label: "电池", children: `${d.battery}%` },
                {
                  key: "4",
                  label: "标签写入时间",
                  children: d.tagUpdatedAt,
                },
                { key: "5", label: "绑定设备", children: d.id },
                {
                  key: "6",
                  label: "Maximo 接收时间",
                  children: d.maximoSyncedAt,
                },
                {
                  key: "7",
                  label: "同步状态",
                  children: <Badge status="success" text="已接收" />,
                },
              ]}
            />
          </Col>
        </Row>
      </Modal>
    </>
  );
}
function RecordTable({ rows }: { rows: string[][] }) {
  return rows.length ? (
    <div className="record-table">
      {rows.map((r, i) => (
        <div key={i}>
          {r.map((x, j) => (
            <span key={j}>{j === 0 ? <Tag>{x}</Tag> : x}</span>
          ))}
        </div>
      ))}
    </div>
  ) : (
    <Alert type="info" message="暂无相关记录" />
  );
}
