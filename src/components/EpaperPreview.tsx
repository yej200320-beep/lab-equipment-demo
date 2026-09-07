import type { Device } from "../types";

export function EpaperPreview({ device }: { device: Device }) {
  return (
    <div className="epaper">
      <div className="epaper-top">
        <b>{device.id}</b>
        <span>2.9″ E-INK</span>
      </div>
      <h3>{device.name}</h3>
      <div className="epaper-ready">READY</div>
      <div className="epaper-grid">
        <span>CAL</span>
        <b>{device.cal.dueDate || "N/A"}</b>
        <span>PM</span>
        <b>{device.pm.dueDate || "N/A"}</b>
        <span>VAL</span>
        <b>{device.val.dueDate || "N/A"}</b>
      </div>
      <div className="epaper-code">{device.tagId}</div>
    </div>
  );
}
