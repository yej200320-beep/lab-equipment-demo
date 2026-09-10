import {
  CheckOutlined,
  MailOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../store/DemoContext";
import type { AlertItem, AlertStatus, NotificationRecord } from "../types";

const levelColor: Record<string, string> = {
  紧急: "red",
  高: "volcano",
  中: "gold",
  低: "blue",
};
const statusColor: Record<AlertStatus, string> = {
  OPEN: "red",
  ACKNOWLEDGED: "gold",
  "IN PROGRESS": "blue",
  CLOSED: "green",
};
export default function AlertsPage() {
  const {
    alerts,
    changeAlert,
    visibleDepartments,
    hasPermission,
    notifications,
    resendMail,
  } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = `${location.pathname}${location.search}`;
  const [selected, setSelected] = useState<AlertItem>();
  const [mail, setMail] = useState<NotificationRecord>();
  const [msg, ctx] = message.useMessage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>();
  if (location.pathname === "/notifications")
    return (
      <>
        {ctx}
        <div className="page-heading">
          <div>
            <Typography.Title level={2}>通知记录</Typography.Title>
            <Typography.Text type="secondary">
              查看到期、离线和低电量邮件通知
            </Typography.Text>
          </div>
        </div>
        <Card>
          <Table
            rowKey="id"
            dataSource={notifications.filter(
              (n) =>
                !n.deviceId || devicesVisible(n.deviceId, visibleDepartments),
            )}
            columns={[
              { title: "发送时间", dataIndex: "time", width: 170 },
              { title: "主题", dataIndex: "subject" },
              { title: "收件人", dataIndex: "recipients", width: 210 },
              {
                title: "状态",
                dataIndex: "status",
                width: 100,
                render: (v) => (
                  <Tag color={v === "已发送" ? "green" : "gold"}>{v}</Tag>
                ),
              },
              {
                title: "操作",
                width: 190,
                render: (_, r) => (
                  <Space>
                    <Button type="link" onClick={() => setMail(r)}>
                      查看邮件
                    </Button>
                    <Button
                      type="link"
                      onClick={() => {
                        msg.loading({ content: "正在发送…", key: "mail" });
                        setTimeout(() => {
                          resendMail(r);
                          msg.success({ content: "邮件发送成功", key: "mail" });
                        }, 800);
                      }}
                    >
                      重新发送
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
        <MailModal mail={mail} onClose={() => setMail(undefined)} />
      </>
    );
  const view = alerts
    .filter((a) => visibleDepartments.includes(a.department))
    .filter(
      (a) =>
        !query ||
        `${a.id}${a.deviceId}${a.type}${a.content}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .filter((a) => !status || a.status === status);
  const act = (a: AlertItem, s: AlertStatus) => {
    if (!hasPermission("ALERT_HANDLE"))
      return msg.warning("当前身份没有 ALERT_HANDLE 权限");
    changeAlert(a.id, s);
    msg.success(`预警已更新为 ${s}`);
    setSelected(undefined);
  };
  return (
    <>
      {ctx}
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>预警中心</Typography.Title>
          <Typography.Text type="secondary">
            集中确认、跟踪和关闭设备与系统预警
          </Typography.Text>
        </div>
        <Tag color="orange">
          {view.filter((a) => a.status !== "CLOSED").length} 条待处理
        </Tag>
      </div>
      <Card className="filter-card">
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="设备、类型或内容"
            style={{ width: 320 }}
          />
          <Select
            allowClear
            placeholder="处理状态"
            value={status}
            onChange={setStatus}
            style={{ width: 170 }}
            options={["OPEN", "ACKNOWLEDGED", "IN PROGRESS", "CLOSED"].map(
              (x) => ({ value: x, label: x }),
            )}
          />
        </Space>
      </Card>
      <Card className="table-card">
        <Table
          rowKey="id"
          dataSource={view}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "等级",
              dataIndex: "level",
              width: 75,
              render: (v) => <Tag color={levelColor[v]}>{v}</Tag>,
            },
            {
              title: "预警",
              dataIndex: "id",
              width: 160,
              render: (v, r) => (
                <button className="link-button" onClick={() => setSelected(r)}>
                  <b>{v}</b>
                  <small>{r.type}</small>
                </button>
              ),
            },
            {
              title: "设备",
              dataIndex: "deviceId",
              width: 130,
              render: (v) =>
                v ? (
                  <Button
                    type="link"
                    onClick={() =>
                      navigate(`/devices/${v}`, { state: { returnTo } })
                    }
                  >
                    {v}
                  </Button>
                ) : (
                  "系统"
                ),
            },
            { title: "内容", dataIndex: "content", ellipsis: true },
            { title: "部门", dataIndex: "department", width: 110 },
            { title: "责任人", dataIndex: "owner", width: 90 },
            { title: "创建时间", dataIndex: "createdAt", width: 160 },
            {
              title: "通知",
              dataIndex: "notified",
              width: 80,
              render: (v) => (
                <Tag color={v ? "green" : "default"}>
                  {v ? "已发送" : "未发送"}
                </Tag>
              ),
            },
            {
              title: "状态",
              dataIndex: "status",
              width: 130,
              render: (v) => (
                <Tag color={statusColor[v as AlertStatus]}>{v}</Tag>
              ),
            },
            {
              title: "操作",
              fixed: "right" as const,
              width: 90,
              render: (_, r) => (
                <Button type="link" onClick={() => setSelected(r)}>
                  处理
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title="预警详情与处理"
        open={!!selected}
        onCancel={() => setSelected(undefined)}
        footer={null}
        width={720}
      >
        {selected && (
          <>
            <Alert
              type={selected.level === "紧急" ? "error" : "warning"}
              showIcon
              message={selected.type}
              description={selected.content}
            />
            <Descriptions
              className="section-row"
              bordered
              column={2}
              items={[
                { key: "1", label: "预警编号", children: selected.id },
                {
                  key: "2",
                  label: "设备",
                  children: selected.deviceId || "系统",
                },
                { key: "3", label: "部门", children: selected.department },
                { key: "4", label: "责任人", children: selected.owner },
                { key: "5", label: "创建时间", children: selected.createdAt },
                {
                  key: "6",
                  label: "当前状态",
                  children: (
                    <Tag color={statusColor[selected.status]}>
                      {selected.status}
                    </Tag>
                  ),
                },
              ]}
            />
            <Space className="modal-actions">
              <Button
                icon={<CheckOutlined />}
                disabled={selected.status !== "OPEN"}
                onClick={() => act(selected, "ACKNOWLEDGED")}
              >
                确认已知晓
              </Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                disabled={selected.status === "CLOSED"}
                onClick={() => act(selected, "IN PROGRESS")}
              >
                开始处理
              </Button>
              <Button
                icon={<StopOutlined />}
                danger
                disabled={selected.status === "CLOSED"}
                onClick={() => act(selected, "CLOSED")}
              >
                关闭预警
              </Button>
            </Space>
          </>
        )}
      </Modal>
    </>
  );
}
function devicesVisible(id: string, depts: string[]) {
  const n = Number(id.replace(/\D/g, ""));
  return depts.length === 4 || depts[(n || 0) % depts.length] !== undefined;
}
function MailModal({
  mail,
  onClose,
}: {
  mail?: NotificationRecord;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!mail}
      title="邮件通知预览"
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={720}
    >
      {mail && (
        <Descriptions
          bordered
          column={1}
          items={[
            { key: "1", label: "收件人", children: mail.recipients },
            { key: "2", label: "抄送", children: mail.cc || "—" },
            { key: "3", label: "主题", children: mail.subject },
            { key: "4", label: "发送时间", children: mail.time },
            {
              key: "5",
              label: "发送状态",
              children: <Tag color="green">{mail.status}</Tag>,
            },
            {
              key: "6",
              label: "邮件正文",
              children: <div className="mail-body">{mail.body}</div>,
            },
          ]}
        />
      )}
    </Modal>
  );
}
