import { useMemo, useState } from "react";
import {
  AlertOutlined,
  ApiOutlined,
  BellOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  SwapOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Input,
  Layout,
  Menu,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDemo } from "../store/DemoContext";
import { useWebMcp } from "../hooks/useWebMcp";

const { Header, Sider, Content } = Layout;

export default function AppShell() {
  const { currentUser, users, alerts, switchUser, logout, hasPermission } =
    useDemo();
  const [collapsed, setCollapsed] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  useWebMcp();
  const location = useLocation(),
    navigate = useNavigate();
  const openAlerts = alerts.filter(
    (a) =>
      a.status !== "CLOSED" &&
      (currentUser?.scope === "全公司" ||
        a.department === currentUser?.department),
  );
  const selected = "/" + location.pathname.split("/")[1];
  const menuItems = useMemo(
    () => [
      { key: "/dashboard", icon: <DashboardOutlined />, label: "总览" },
      {
        key: "equipment-group",
        icon: <ExperimentOutlined />,
        label: "设备",
        children: [
          { key: "/devices", label: "设备列表" },
          { key: "/epaper", label: "电子标签", icon: <TagsOutlined /> },
        ],
      },
      ...(hasPermission("LOCATION_VIEW")
        ? [
            {
              key: "location-group",
              icon: <ApiOutlined />,
              label: "位置",
              children: [
                { key: "/locations", label: "房间视图" },
                { key: "/finder", label: "设备查找" },
                { key: "/movement", label: "移动历史" },
              ],
            },
          ]
        : []),
      ...(hasPermission("ALERT_VIEW")
        ? [
            {
              key: "alert-group",
              icon: <AlertOutlined />,
              label: "预警",
              children: [
                { key: "/alerts", label: "预警中心" },
                { key: "/notifications", label: "通知记录" },
              ],
            },
          ]
        : []),
      ...(hasPermission("SYSTEM_CONFIG") || hasPermission("USER_AUTHORIZE")
        ? [
            {
              key: "admin-group",
              icon: <SafetyCertificateOutlined />,
              label: "系统管理",
              children: [
                { key: "/admin/users", label: "用户与权限" },
                { key: "/admin/departments", label: "部门管理" },
                { key: "/admin/gateways", label: "BLE 网关" },
                { key: "/admin/maximo", label: "Maximo 同步" },
                { key: "/admin/settings", label: "通知配置" },
                { key: "/admin/logs", label: "系统日志" },
              ],
            },
          ]
        : []),
    ],
    [hasPermission],
  );
  const titleMap: Record<string, string> = {
    "/dashboard": "总览",
    "/devices": "设备列表",
    "/epaper": "电子标签",
    "/locations": "房间视图",
    "/finder": "设备查找",
    "/movement": "移动历史",
    "/alerts": "预警中心",
    "/notifications": "通知记录",
    "/admin": "系统管理",
  };
  const section =
    Object.keys(titleMap).find((k) => location.pathname.startsWith(k)) ||
    "/dashboard";
  const isDashboard = location.pathname === "/dashboard";
  if (!currentUser) return null;
  return (
    <Layout className="app-shell">
      <Sider
        width={244}
        collapsedWidth={76}
        collapsed={collapsed}
        theme="light"
        className="sidebar"
      >
        <div className="brand">
          <div className="brand-mark">
            <ExperimentOutlined />
          </div>
          {!collapsed && (
            <div>
              <strong>实验室设备</strong>
              <span>数字化管理平台</span>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          defaultOpenKeys={[
            "equipment-group",
            "location-group",
            "alert-group",
            "admin-group",
          ]}
          items={menuItems}
          onClick={({ key }) => key.startsWith("/") && navigate(key)}
        />
        {/* <div className="side-footer">
          <span className="pulse" />
          {!collapsed && (
            <>
              系统运行正常
              <br />
              <small>v1.0 · DEMO 环境</small>
            </>
          )}
        </div> */}
      </Sider>
      <Layout
        className="main-layout"
        style={{ marginLeft: collapsed ? 76 : 244 }}
      >
        <Header className="topbar">
          <Space size={14}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Typography.Text className="top-section">
              {titleMap[section]}
            </Typography.Text>
          </Space>
          {isDashboard ? (
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索设备编号、名称或房间"
              className="global-search"
              onPressEnter={(e) =>
                navigate(
                  `/devices?q=${encodeURIComponent(e.currentTarget.value)}`,
                )
              }
            />
          ) : (
            <span className="topbar-spacer" aria-hidden="true" />
          )}
          <Space size={12}>
            <Tag color="orange">YE JUN</Tag>
            <Tooltip title="系统连接正常">
              <Badge status="success" text="系统状态" />
            </Tooltip>
            <Badge count={openAlerts.length} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => setNoticeOpen(true)}
              />
            </Badge>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "switch",
                    label: "切换演示身份",
                    icon: <SwapOutlined />,
                    children: users
                      .filter((u) => u.status === "启用")
                      .map((u) => ({
                        key: u.id,
                        label: `${u.name} · ${u.role}`,
                        onClick: () => {
                          switchUser(u.id);
                          navigate("/dashboard");
                        },
                      })),
                  },
                  {
                    key: "settings",
                    label: "个人信息",
                    icon: <SettingOutlined />,
                  },
                  { type: "divider" },
                  {
                    key: "logout",
                    label: "退出登录",
                    icon: <LogoutOutlined />,
                    danger: true,
                    onClick: () => {
                      logout();
                      navigate("/login");
                    },
                  },
                ],
              }}
            >
              <button className="user-chip">
                <Avatar size={34}>{currentUser.name.slice(0, 1)}</Avatar>
                <span>
                  <b>{currentUser.name}</b>
                  <small>
                    {currentUser.department} · {currentUser.role}
                  </small>
                </span>
              </button>
            </Dropdown>
          </Space>
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
      <Drawer
        title="待处理预警"
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        width={420}
      >
        <div className="notice-list">
          {openAlerts.slice(0, 8).map((a) => (
            <button
              key={a.id}
              onClick={() => {
                navigate("/alerts");
                setNoticeOpen(false);
              }}
            >
              <Badge status={a.level === "紧急" ? "error" : "warning"} />
              <span>
                <b>{a.type}</b>
                <small>
                  {a.deviceId || "系统"} · {a.createdAt}
                </small>
              </span>
            </button>
          ))}
        </div>
      </Drawer>
    </Layout>
  );
}
