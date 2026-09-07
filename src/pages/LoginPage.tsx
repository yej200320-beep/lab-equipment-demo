import {
  ExperimentOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Tag, Typography } from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { useDemo } from "../store/DemoContext";

const roleCopy: Record<string, string> = {
  "Super Admin": "全公司数据、授权与系统配置",
  "QC Manager": "QC 部门管理与预警处理",
  "QC User": "QC 部门设备与只读功能",
  "Engineering User": "Engineering 部门设备与定位",
};
export default function LoginPage() {
  const { users, login, currentUser } = useDemo();
  const navigate = useNavigate();
  if (currentUser) return <Navigate to="/dashboard" replace />;
  return (
    <div className="login-page">
      <div className="login-orb orb-a" />
      <div className="login-orb orb-b" />
      <section className="login-intro">
        <div className="login-logo">
          <ExperimentOutlined />
        </div>
        <Tag color="cyan">ENTERPRISE EQUIPMENT OPERATIONS</Tag>
        <Typography.Title>
          实验室设备
          <br />
          数字化管理平台
        </Typography.Title>
        <Typography.Paragraph>
          统一管理设备台账、Calibration、PM、Validation、BLE
          定位、电子标签和到期预警。
        </Typography.Paragraph>
        <div className="login-features">
          <span>
            <SafetyCertificateOutlined /> 权限隔离
          </span>
          <span>
            <ExperimentOutlined /> 全生命周期
          </span>
          <span>
            <span className="pulse" /> 状态实时可见
          </span>
        </div>
      </section>
      <Card className="login-card">
        <div className="demo-label">YE JUN</div>
        <Typography.Title level={3}>选择演示身份</Typography.Title>
        {/* <Typography.Paragraph type="secondary">
          无需密码，选择身份即可进入相应权限视图。
        </Typography.Paragraph> */}
        <Row gutter={[12, 12]}>
          {users.map((u) => (
            <Col span={24} key={u.id}>
              <button
                className="identity-card"
                onClick={() => {
                  login(u.id);
                  navigate("/dashboard");
                }}
              >
                <span className={`role-dot role-${u.id}`}>
                  {u.name.slice(0, 1)}
                </span>
                <span>
                  <b>{u.name}</b>
                  <small>
                    {u.role} · {u.department}
                  </small>
                  <em>{roleCopy[u.role]}</em>
                </span>
                <Button type={u.id === "u-admin" ? "primary" : "default"}>
                  进入
                </Button>
              </button>
            </Col>
          ))}
        </Row>
        {/* <p className="login-note">
          本系统为方案演示环境，所有外部连接与业务数据均为模拟。
        </p> */}
      </Card>
    </div>
  );
}
