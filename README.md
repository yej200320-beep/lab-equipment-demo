# 实验室设备数字化管理平台 Demo

面向项目方案展示的高保真前端 Demo。业务数据、Maximo、BLE 网关、电子标签和邮件服务均为 Mock；权限修改、预警处理、电子标签更新时间、邮件重发和同步记录会保存在浏览器 LocalStorage 中。

## 环境要求

- Node.js 20 或更高版本
- npm 10 或更高版本

## 安装与启动

```bash
npm install
npm run dev
```

启动后，本机访问：

```text
http://localhost:5173
```

Vite 已默认监听 `0.0.0.0`。同一局域网的电脑或平板可使用开发电脑的局域网 IP 访问，例如：

```text
http://192.168.1.25:5173
```

终端启动信息中的 `Network` 地址就是当前可使用的局域网地址。访问设备与开发电脑应连接同一个局域网，系统防火墙需要允许 Node.js 接收连接。

## 完整性检查

```bash
npm run build
```

## 演示身份

- 王处：Super Admin，全公司数据、用户授权、系统配置
- 李梅：QC Manager，QC 部门数据与预警处理
- 王晨：QC User，默认只读，可由管理员动态增加权限
- 陈工：Engineering User，Engineering 部门数据

## 推荐演示流程

1. 使用 QC Manager 进入总览，查看到期设备并处理预警。
2. 搜索 `EQ-001527`，查看 Room 203 的 BLE Last Seen，并执行 LED 闪烁。
3. 使用 Super Admin 给 QC User 增加 `LED_CONTROL`，切换身份验证权限生效。
4. 在系统管理中执行一次 Maximo 模拟同步。
5. 打开电子标签页面，更新 2.9 英寸电子墨水屏。

如需重复演示，可用 Super Admin 打开“系统管理 → 系统日志”，点击“重置 Demo 数据”。
