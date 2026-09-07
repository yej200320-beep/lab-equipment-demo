import { AimOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Alert,
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
import { useNavigate } from "react-router-dom";
import { EpaperPreview } from "../components/EpaperPreview";
import { OnlineBadge } from "../components/StatusTag";
import { devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";

export default function EpaperPage() {
  const { visibleDepartments, hasPermission, addLog } = useDemo();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [msg, ctx] = message.useMessage();
  const view = devices
    .filter(
      (d) =>
        visibleDepartments.includes(d.department) &&
        (!query ||
          `${d.id}${d.name}${d.tagId}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    )
    .slice(0, 12);
  return (
    <>
      {ctx}
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>电子标签</Typography.Title>
          <Typography.Text type="secondary">
            查看 Maximo 下游数据在 BLE + 2.9 英寸电子墨水屏上的同步状态
          </Typography.Text>
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
      {/* <Alert
        showIcon
        type="info"
        className="detail-alert"
        message="电子标签内容由上游 Maximo 数据驱动"
        description="本平台负责接收、展示并监测同步结果，不提供人工修改或向 Maximo 写回入口。"
      /> */}
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
              <Space className="epaper-actions">
                <Button onClick={() => navigate(`/devices/${d.id}`)}>
                  查看设备
                </Button>
                <Button
                  icon={<AimOutlined />}
                  danger
                  disabled={!hasPermission("LED_CONTROL")}
                  onClick={() => {
                    msg.loading({ content: "正在下发 LED 指令…", key: "led" });
                    setTimeout(() => {
                      msg.success({
                        content: "LED 闪烁指令发送成功",
                        key: "led",
                      });
                      addLog("LED 查找", d.id, `电子标签 ${d.tagId}`);
                    }, 800);
                  }}
                >
                  LED 闪烁
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
