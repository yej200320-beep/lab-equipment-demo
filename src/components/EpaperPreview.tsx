import type { Device, LifecycleItem } from "../types";

function statusText(item: LifecycleItem, normalText: "PASS" | "VALID") {
  if (item.days === undefined) return "N/A";
  if (item.days <= 30) return "DUE";
  return normalText;
}

export function EpaperPreview({ device }: { device: Device }) {
  return (
    <div className="epaper epaper-v42">
      <div className="epaper-top">
        <b>{device.id}</b>
        <span>4.2&quot; E-INK</span>
      </div>
      <div className="epaper-device-name">
        {device.labelName} <span>·</span> {device.name}
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
