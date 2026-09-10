import type { Device, LifecycleItem } from "../types";

const chineseDeviceNames: Record<string, string> = {
  "Portable Analyzer": "配液罐",
  "Analytical Balance": "分析天平",
  "Conductivity Meter": "电导率仪",
  "HPLC System": "高效液相色谱仪",
  "TOC Analyzer": "总有机碳分析仪",
  "Dissolution Tester": "溶出度仪",
  "pH Meter": "pH 计",
  Incubator: "培养箱",
  Centrifuge: "离心机",
  Autoclave: "高压灭菌器",
  Spectrophotometer: "分光光度计",
  "Moisture Analyzer": "水分测定仪",
  "Particle Counter": "粒子计数器",
  "Temperature Logger": "温度记录仪",
  "Gas Chromatograph": "气相色谱仪",
  Microscope: "显微镜",
  "Water Purification Unit": "纯水机",
  "Stability Chamber": "稳定性试验箱",
  Viscometer: "黏度计",
  "Tablet Hardness Tester": "片剂硬度仪",
};

function statusText(item: LifecycleItem, normalText: "PASS" | "VALID") {
  if (item.days === undefined) return "N/A";
  if (item.days <= 30) return "DUE";
  return normalText;
}

export function EpaperPreview({ device }: { device: Device }) {
  const displayName = chineseDeviceNames[device.name] || device.name;
  return (
    <div className="epaper epaper-v42">
      <div className="epaper-top">
        <b>{device.id}</b>
        <span>4.2&quot; E-INK</span>
      </div>
      <div className="epaper-device-name">
        设备名称：<strong>{displayName}</strong>
      </div>
      <div className="epaper-lifecycle-panels">
        <section>
          <div className="epaper-panel-title">
            <b>PM</b>
            <span>{statusText(device.pm, "PASS")}</span>
          </div>
          <time>{device.pm.dueDate || "N/A"}</time>
          <div className="epaper-panel-rule" />
          <ol>
            <li>目视检查</li>
            <li>润滑紧固</li>
            <li>功能测试</li>
            <li>易损件检查</li>
          </ol>
        </section>
        <section>
          <div className="epaper-panel-title">
            <b>Cal</b>
            <span>{statusText(device.cal, "PASS")}</span>
          </div>
          <time>{device.cal.dueDate || "N/A"}</time>
          <div className="epaper-panel-rule" />
          <dl>
            <div>
              <dt>校准对象：</dt>
              <dd>温度 / 压力 / 称重传感器</dd>
            </div>
            <div>
              <dt>标准：</dt>
              <dd>国家计量基准</dd>
            </div>
            <div>
              <dt>允许误差：</dt>
              <dd>±XX%</dd>
            </div>
          </dl>
          <b className="epaper-points-title">要点：</b>
          <ol>
            <li>3点量程比对</li>
            <li>量值溯源</li>
            <li>超差上报 QA</li>
          </ol>
        </section>
        <section>
          <div className="epaper-panel-title">
            <b>Val</b>
            <span>{statusText(device.val, "VALID")}</span>
          </div>
          <time>{device.val.dueDate || "N/A"}</time>
          <div className="epaper-panel-rule" />
          <b className="epaper-points-title">要点：</b>
          <ol>
            <li>PQ 合格</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
