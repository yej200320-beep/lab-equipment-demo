import {
  AimOutlined,
  BulbOutlined,
  PoweroffOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  message,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EpaperPreview } from "../components/EpaperPreview";
import { OnlineBadge } from "../components/StatusTag";
import { devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";

export default function EpaperPage() {
  const { visibleDepartments, hasPermission, addLog } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = `${location.pathname}${location.search}`;
  const [query, setQuery] = useState("");
  const [msg, ctx] = message.useMessage();
  const view = devices
    .filter(
      (d) =>
        visibleDepartments.includes(d.department) &&
        (!query ||
          `${d.id}${d.name}${d.labelName}${d.tagId}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    )
    .slice(0, 12);

  const sendLedCommand = (
    action: "闪烁" | "常亮" | "关闭",
    device: (typeof devices)[0],
  ) => {
    const running =
      action === "关闭" ? "正在关闭 LED…" : `正在下发 LED ${action}指令…`;
    const success =
      action === "关闭" ? "LED 已关闭" : `LED ${action}指令发送成功`;
    msg.loading({ content: running, key: "led" });
    setTimeout(() => {
      msg.success({ content: success, key: "led" });
      addLog(`LED ${action}`, device.id, `电子标签 ${device.tagId}`);
    }, 800);
  };

  return (
    <>
      {ctx}
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>电子标签</Typography.Title>
        </div>
        <Input
          prefix={<SearchOutlined />}
          allowClear
          placeholder="设备或标签 ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: 280 }}
        />
      </div>
      <Row gutter={[16, 16]}>
        {view.map((d) => (
          <Col xs={24} lg={12} xl={8} key={d.id}>
            <Card hoverable className="epaper-card">
              <EpaperPreview device={d} />
              <Descriptions
                size="small"
                column={2}
                items={[
                  { key: "1", label: "标签 ID", children: d.tagId },
                  {
                    key: "2",
                    label: "状态",
                    children: <OnlineBadge online={d.online} />,
                  },
                  {
                    key: "3",
                    label: "电池",
                    children: (
                      <Tag color={d.battery < 20 ? "red" : "green"}>
                        {d.battery}%
                      </Tag>
                    ),
                  },
                  {
                    key: "4",
                    label: "标签写入",
                    children: d.tagUpdatedAt,
                  },
                  {
                    key: "5",
                    label: "Maximo 接收",
                    children: d.maximoSyncedAt,
                  },
                ]}
              />
              <Space className="epaper-actions" wrap>
                <Button
                  onClick={() =>
                    navigate(`/devices/${d.id}`, {
                      state: { returnTo },
                    })
                  }
                >
                  查看设备
                </Button>
                <Space.Compact>
                  <Button
                    danger
                    icon={<AimOutlined />}
                    disabled={!hasPermission("LED_CONTROL")}
                    onClick={() => sendLedCommand("闪烁", d)}
                  >
                    闪烁
                  </Button>
                  <Button
                    className="led-on-button"
                    icon={<BulbOutlined />}
                    onClick={() => sendLedCommand("常亮", d)}
                  >
                    常亮
                  </Button>
                  <Button
                    className="led-off-button"
                    icon={<PoweroffOutlined />}
                    onClick={() => sendLedCommand("关闭", d)}
                  >
                    关闭
                  </Button>
                </Space.Compact>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
