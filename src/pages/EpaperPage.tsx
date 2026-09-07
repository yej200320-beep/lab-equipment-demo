import { AimOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { EpaperPreview } from "../components/EpaperPreview";
import { OnlineBadge } from "../components/StatusTag";
import { devices } from "../mock/data";
import { useDemo } from "../store/DemoContext";

export default function EpaperPage() {
  const { visibleDepartments, hasPermission, updateEpaper, epaper, addLog } =
    useDemo();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof devices)[0]>();
  const [loading, setLoading] = useState(false);
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
  const update = () => {
    if (!selected) return;
    setLoading(true);
    msg.loading({ content: "正在下发电子标签更新…", key: "ep", duration: 0 });
    setTimeout(() => {
      updateEpaper(selected.id);
      setLoading(false);
      msg.success({ content: "电子标签更新成功", key: "ep" });
      setSelected(undefined);
    }, 900);
  };
  return (
    <>
      {ctx}
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>电子标签</Typography.Title>
          <Typography.Text type="secondary">
            管理 BLE + 2.9 英寸电子墨水屏标签
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
                    label: "Last Updated",
                    children: epaper[d.id] || d.tagUpdatedAt,
                  },
                ]}
              />
              <Space className="epaper-actions">
                <Button
                  icon={<ReloadOutlined />}
                  disabled={!hasPermission("EPAPER_UPDATE")}
                  onClick={() => setSelected(d)}
                >
                  更新显示
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
                <Button>重新绑定</Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal
        open={!!selected}
        title="确认更新电子墨水屏"
        onCancel={() => setSelected(undefined)}
        onOk={update}
        confirmLoading={loading}
        okText="更新显示"
        width={660}
      >
        {selected && <EpaperPreview device={selected} />}
        <Typography.Paragraph type="secondary" className="modal-copy">
          将把最新设备状态和到期日期下发至电子标签。本操作为 Mock 交互。
        </Typography.Paragraph>
      </Modal>
    </>
  );
}
