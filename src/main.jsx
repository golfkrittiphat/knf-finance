import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactDOM from "react-dom/client";

const SUPABASE_URL = "https://sbpmkmuxtslmxwsdaral.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicG1rbXV4dHNsbXh3c2RhcmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTczNjAsImV4cCI6MjA5ODEzMzM2MH0.9xWYG8SG5CmP5pVvnyxS79JrEL0g-pku0334GiOEOTs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIES_INCOME = ["ร้านอาหาร", "ตกปลา", "ผลไม้", "อื่นๆ"];
const CATEGORIES_EXPENSE = ["วัตถุดิบ", "ค่าแรง", "ค่าอุปกรณ์ครัว", "ค่าซ่อมบำรุง", "อื่นๆ"];
const SHOP_NAME = "ร้านโคกหนองนาฟิชชิ่งท่าเรือ";

// รายการเมนูอาหาร + ราคา ของหมวด "ร้านอาหาร"
// *** แก้ไขรายชื่อเมนูและราคาจริงได้ที่นี่ ***
// พิมพ์ชื่อเมนูใหม่ที่ไม่อยู่ในลิสต์นี้ได้เหมือนกัน (ระบบจะให้กรอกราคาเองตอนนั้น)
const MENU_ITEMS = [
  // เมนูตำ
  { name: "ตำไทย", price: 50 },
  { name: "ตำไทยปู", price: 55 },
  { name: "ตำไทยปูไข่เค็ม", price: 60 },
  { name: "ตำปลาร้า", price: 50 },
  { name: "ตำปูปลาร้า", price: 55 },
  { name: "ตำปูปลาร้ากุ้ง (สด/ลวก)", price: 70 },
  { name: "ตำปูปลาร้าหอยดอง", price: 70 },
  { name: "ตำปูปลาร้าหอยแครง", price: 80 },
  { name: "ตำไหลบัวปูปลาร้า", price: 60 },
  { name: "ตำไหลบัวปลาร้ากุ้ง (สด/ลวก)", price: 70 },
  { name: "ตำไหลบัวหมูยอ", price: 60 },
  { name: "ตำหมูยอ", price: 60 },
  { name: "ตำหมูกรอบ", price: 70 },
  { name: "ตำแดง (ปลาร้า/ไม่ปลาร้า)", price: 50 },
  { name: "ตำแดงปู (ปลาร้า/ไม่ปลาร้า)", price: 55 },
  { name: "ตำแดงไทยไข่เค็ม", price: 60 },
  { name: "ตำแดงไทยปูไข่เค็ม", price: 65 },
  { name: "ตำข้าวโพด", price: 50 },
  { name: "ตำข้าวโพดไข่เค็ม", price: 60 },
  { name: "ตำกระท้อนไทยปู", price: 60 },
  { name: "ตำกระท้อนปูปลาร้า", price: 70 },
  { name: "ตำกระท้อนปลาร้าหมูยอ", price: 70 },
  { name: "ตำกระท้อนปูปลาร้ากุ้งสด", price: 80 },

  // เมนูลาบ
  { name: "ลาบหมู", price: 60 },
  { name: "ลาบไก่", price: 60 },
  { name: "ลาบกุ้ง", price: 80 },
  { name: "ลาบปลาทอด", price: 100 },
  { name: "ตับหวาน", price: 70 },

  // เมนูยำ
  { name: "ยำวุ้นเส้นหมูสับ", price: 60 },
  { name: "ยำวุ้นเส้นทะเล/รวมมิตร", price: 70 },
  { name: "ยำรวมมิตร", price: 70 },
  { name: "ยำหมูยอ", price: 60 },
  { name: "ยำหมึกสด", price: 80 },
  { name: "ยำสามกรอบ", price: 70 },
  { name: "ยำไข่เค็ม", price: 50 },
  { name: "ยำหมูกรอบ", price: 70 },
  { name: "ยำไส้ต้น", price: 70 },
  { name: "หมูมะนาว", price: 70 },
  { name: "พล่ากุ้ง (สด/ลวก)", price: 70 },

  // เมนูต้ม
  { name: "ต้มยำรวมมิตร (น้ำข้น/น้ำใส)", price: 100 },
  { name: "ต้มยำทะเล (น้ำข้น/น้ำใส)", price: 100 },
  { name: "ต้มยำกุ้ง (น้ำข้น/น้ำใส)", price: 100 },
  { name: "ต้มยำปลากะพง (น้ำข้น/น้ำใส)", price: 100 },
  { name: "แกงเห็ด (ปลาร้า/ไม่ปลาร้า)", price: 60 },
  { name: "แกงอ่อม (หมู/ไก่)", price: 70 },
  { name: "ต้มจืดเต้าหู้หมูสับ", price: 60 },

  // เมนูอาหารจานเดียว
  { name: "ข้าวผัดหมู, ไก่ (เล็ก)", price: 50 },
  { name: "ข้าวผัดหมู, ไก่ (กลาง)", price: 100 },
  { name: "ข้าวผัดหมู, ไก่ (ใหญ่)", price: 150 },
  { name: "ข้าวผัดทะเล, รวม (เล็ก)", price: 60 },
  { name: "ข้าวผัดทะเล, รวม (กลาง)", price: 120 },
  { name: "ข้าวผัดทะเล, รวม (ใหญ่)", price: 180 },
  { name: "ผัดเครื่องแกงหมู, ไก่", price: 50 },
  { name: "ผัดเครื่องแกงทะเล, รวม", price: 60 },
  { name: "ผัดเครื่องแกงหมูกรอบ", price: 60 },
  { name: "ผัดกะเพราหมู, ไก่", price: 50 },
  { name: "ผัดกะเพราทะเล, รวม", price: 60 },
  { name: "ผัดกะเพราหมูกรอบ", price: 60 },
  { name: "ผัดพริกหมู, ไก่", price: 50 },
  { name: "ผัดพริกทะเล, รวม", price: 60 },
  { name: "ผัดพริกหมูกรอบ", price: 60 },
  { name: "ผัดพริกไทยดำหมู, ไก่", price: 50 },
  { name: "ผัดพริกไทยดำทะเล, รวม", price: 60 },
  { name: "ผัดคะน้าหมูกรอบ", price: 60 },
  { name: "ผัดคื่นฉ่ายปลากะพง", price: 70 },
  { name: "ผัดกะปิสะตอหมู, ไก่", price: 60 },
  { name: "ผัดกะปิสะตอทะเล, รวม", price: 70 },
  { name: "ผัดฉ่า (กุ้ง/หมึก/ทะเล/ปลา)", price: 70 },
  { name: "คั่วกลิ้งหมู, ไก่", price: 50 },
  { name: "ราดหน้าหมู, ไก่", price: 50 },
  { name: "ราดหน้าทะเล, รวม", price: 60 },
  { name: "ผัดซีอิ๊วหมู, ไก่", price: 50 },
  { name: "ผัดซีอิ๊วทะเล, รวม", price: 60 },
  { name: "สุกี้หมู, ไก่ (น้ำ/แห้ง)", price: 50 },
  { name: "สุกี้ทะเล, รวม (น้ำ/แห้ง)", price: 60 },

  // เมนูทอด
  { name: "ไก่ทอด", price: 60 },
  { name: "เอ็นไก่ทอด", price: 80 },
  { name: "กุ้งชุบแป้งทอด", price: 80 },
  { name: "ทอดมันกุ้ง", price: 80 },
  { name: "ไก่ทอดกระเทียม", price: 60 },
  { name: "หมูทอดกระเทียม", price: 60 },
  { name: "ปลาหมึกทอดกระเทียม", price: 70 },
  { name: "ไส้ต้นทอดกระเทียม", price: 70 },
  { name: "ซี่โครงหมูทอดกระเทียม", price: 70 },
  { name: "ปลากะพงทอดกระเทียม", price: 100 },
  { name: "ปลากะพงทอดสามรส", price: 100 },
  { name: "ปลากะพงทอดราดพริก", price: 100 },
  { name: "ปลากะพงทอดลุยสวน", price: 100 },

  // เมนูเครื่องดื่ม
  { name: "น้ำดื่ม (เล็ก)", price: 10 },
  { name: "น้ำดื่ม (ใหญ่)", price: 20 },
  { name: "น้ำอัดลม (เล็ก)", price: 12 },
  { name: "น้ำอัดลม (ใหญ่)", price: 30 },
  { name: "น้ำแข็ง (เล็ก)", price: 10 },
  { name: "น้ำแข็ง (ใหญ่)", price: 20 },

  // อื่นๆ
  { name: "ข้าวเหนียว", price: 10 },
  { name: "ขนมจีน", price: 10 },
  { name: "ข้าว (จาน)", price: 10 },
  { name: "ข้าว (หม้อ)", price: 60 },
  { name: "ไข่ดาว", price: 10 },
  { name: "ไข่เจียว", price: 10 },

  { name: "ไอซ์ สตรอเบอร์รี่ ซันเด", price: 20 },
  { name: "ไอซ์ ช็อกโกแลต คริสปี้", price: 20 },
  { name: "ไอซ์ บิงโกคุกกี้", price: 20 },
  { name: "ไอซ์ สตรอเบอร์รี่", price: 20 },
  { name: "ไอซ์ ฟรุซซี่ เกรป", price: 10 },
  { name: "ไอซ์ ฟรุซซี่ บลูเบอร์รี่ โยเกิร์ต", price: 10 },
  { name: "ไอซ์ โมจิ ช็อกโกแลต", price: 10 },
  { name: "ไอซ์ โมจิ วานิลลา", price: 10 },
  { name: "ไอซ์ ซามังก้า", price: 10 },
  { name: "ไอซ์ ช็อกโก มอลต์", price: 10 },
  
];

// รหัสประจำตัวพนักงาน -> ชื่อที่จะแสดง
// แก้ไข/เพิ่มรายชื่อพนักงานและรหัสได้ที่นี่
const STAFF_PINS = {
  "1203": "กอล์ฟ",
  "121": "น้ำ",
  "313": "กิ๊บ",
};

// โหลดฟอนต์ Sarabun จาก Google Fonts จริงๆ (ครั้งเดียว) เพื่อให้ภาพสรุปหน้าตาเหมือนกันทุกอุปกรณ์
// ถ้าไม่โหลดฟอนต์เอง เบราว์เซอร์แต่ละเครื่อง/แต่ละ OS จะใช้ฟอนต์สำรองคนละตัว
// ทำให้ความกว้างตัวอักษรไทยต่างกัน และอาจทำให้ตัวเลขชนขอบภาพไม่เท่ากันในแต่ละเครื่อง
let _fontLoadPromise = null;
function ensureSarabunLoaded() {
  if (_fontLoadPromise) return _fontLoadPromise;
  _fontLoadPromise = (async () => {
    if (!document.querySelector('link[data-sarabun-font]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap";
      link.setAttribute("data-sarabun-font", "1");
      document.head.appendChild(link);
    }
    try {
      await Promise.all([
        document.fonts.load("400 16px Sarabun"),
        document.fonts.load("700 16px Sarabun"),
        document.fonts.load("800 16px Sarabun"),
      ]);
      await document.fonts.ready;
    } catch (e) {
      // ถ้าโหลดไม่สำเร็จ (เช่น ไม่มีอินเทอร์เน็ต) ก็วาดต่อด้วยฟอนต์สำรอง
    }
  })();
  return _fontLoadPromise;
}

const formatMoney = (n) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// วาดสี่เหลี่ยมมุมโค้งบน canvas
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// วาดแถวข้อมูล: ข้อความฝั่งซ้าย + ตัวเลขฝั่งขวา พร้อมตัดข้อความที่ยาวเกินไป
function drawRow(ctx, leftText, rightText, x1, y, x2, leftColor, rightColor, font, size = 13) {
  const maxLeftWidth = x2 - x1 - 130;
  ctx.font = `400 ${size}px ${font}`;
  let txt = leftText;
  while (ctx.measureText(txt).width > maxLeftWidth && txt.length > 1) {
    txt = txt.slice(0, -1);
  }
  if (txt !== leftText) txt = txt.slice(0, -1) + "…";
  ctx.textAlign = "left";
  ctx.fillStyle = leftColor;
  ctx.fillText(txt, x1, y + 14);
  ctx.textAlign = "right";
  ctx.fillStyle = rightColor;
  ctx.font = `700 ${size}px ${font}`;
  ctx.fillText(rightText, x2, y + 14);
  // รีเซ็ตกลับเป็นชิดซ้ายเสมอ กันไม่ให้ค่าที่ตั้งไว้ตอนวาดตัวเลขฝั่งขวาไปกระทบ fillText ตัวถัดไปที่เรียกนอกฟังก์ชันนี้
  ctx.textAlign = "left";
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998,
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, padding: "28px 24px",
        maxWidth: 320, width: "90%", border: "1px solid #ef4444",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>⚠️</div>
        <div style={{ textAlign: "center", color: "#f1f5f9", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>ยืนยันการลบ</div>
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>{msg}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #334155",
            background: "#0f172a", color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ยกเลิก</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#b91c1c,#ef4444)", color: "#fff",
            fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ลบรายการ</button>
        </div>
      </div>
    </div>
  );
}

// โมดัลขอรหัสประจำตัวก่อนทำรายการ (บันทึก/ลบ)
function PinModal({ title, onSubmit, onCancel }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const handleConfirm = () => {
    const name = STAFF_PINS[pin.trim()];
    if (!name) {
      setErr("รหัสไม่ถูกต้อง กรุณาลองใหม่");
      return;
    }
    onSubmit({ pin: pin.trim(), name });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, padding: "28px 24px",
        maxWidth: 320, width: "90%", border: "1px solid #334155",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>🔐</div>
        <div style={{ textAlign: "center", color: "#f1f5f9", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{title}</div>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          placeholder="กรอกรหัสประจำตัว"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setErr(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
          style={{
            width: "100%", background: "#0f172a", border: `1px solid ${err ? "#ef4444" : "#334155"}`,
            color: "#f1f5f9", padding: "12px 14px", borderRadius: 10, fontSize: 18,
            textAlign: "center", letterSpacing: 4, boxSizing: "border-box", marginBottom: 8,
          }}
        />
        {err && <div style={{ color: "#ef4444", fontSize: 12, textAlign: "center", marginBottom: 10 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #334155",
            background: "#0f172a", color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ยกเลิก</button>
          <button onClick={handleConfirm} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "#fff",
            fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
}

// โมดัลแสดงภาพสรุปที่สร้างแล้ว พร้อมปุ่มดาวน์โหลด
function SummaryImageModal({ image, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      padding: 16,
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, padding: 18,
        maxWidth: 420, width: "100%", border: "1px solid #334155",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)", maxHeight: "92vh",
        display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", textAlign: "center" }}>{image.label}</div>
        <div style={{ overflowY: "auto", overflowX: "hidden", borderRadius: 10, border: "1px solid #334155" }}>
          <img src={image.dataUrl} alt={image.label} style={{ width: "100%", maxWidth: "100%", display: "block" }} />
        </div>
        <div style={{ fontSize: 11, color: "#64748b", textAlign: "center" }}>
          มือถือ: กดค้างที่ภาพเพื่อบันทึก หรือกดปุ่มดาวน์โหลดด้านล่าง
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #334155",
            background: "#0f172a", color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ปิด</button>
          <a
            href={image.dataUrl}
            download={`${image.label.replace(/\s+/g, "_")}.png`}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff",
              fontWeight: 700, cursor: "pointer", fontSize: 15, textAlign: "center",
              textDecoration: "none", display: "inline-block",
            }}
          >⬇️ ดาวน์โหลด</a>
        </div>
      </div>
    </div>
  );
}

// โมดัลเลือกแบบสรุป (วันเดียว/ทั้งเดือน) ก่อนสร้างภาพ
function SummaryPickerModal({ summaryMode, setSummaryMode, summaryDate, setSummaryDate, filterMonth, onGenerate, generating, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      padding: 16,
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, padding: 20,
        maxWidth: 340, width: "100%", border: "1px solid #334155",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9", marginBottom: 16, textAlign: "center" }}>📷 สร้างภาพสรุป</div>
        <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", marginBottom: 12, border: "1px solid #334155" }}>
          {[{ key: "day", label: "วันเดียว" }, { key: "month", label: `ทั้งเดือน (${filterMonth})` }].map((m) => (
            <button key={m.key} onClick={() => setSummaryMode(m.key)} style={{
              flex: 1, padding: "9px 0", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
              background: summaryMode === m.key ? "#0f4c2a" : "#0f172a",
              color: summaryMode === m.key ? "#fff" : "#64748b", transition: "all 0.2s",
            }}>{m.label}</button>
          ))}
        </div>
        {summaryMode === "day" && (
          <input type="date" value={summaryDate} onChange={(e) => setSummaryDate(e.target.value)}
            style={{ background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9", padding: "8px 12px", borderRadius: 8, fontSize: 14, marginBottom: 12, width: "100%", boxSizing: "border-box" }} />
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #334155",
            background: "#0f172a", color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ยกเลิก</button>
          <button onClick={onGenerate} disabled={generating} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "none", cursor: generating ? "not-allowed" : "pointer",
            background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "#fff", fontWeight: 700, fontSize: 14,
            opacity: generating ? 0.7 : 1,
          }}>
            {generating ? "⏳ กำลังสร้าง..." : "🖼️ สร้างภาพ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// โมดัลเพิ่มสินค้าใหม่ในสต็อก
function NewItemModal({ name, setName, unit, setUnit, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      padding: 16,
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, padding: 20,
        maxWidth: 340, width: "100%", border: "1px solid #334155",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9", marginBottom: 16, textAlign: "center" }}>📦 เพิ่มสินค้าในสต็อก</div>
        <label style={labelStyle}>ชื่อสินค้า</label>
        <input type="text" autoFocus placeholder="เช่น ไอติม, น้ำอัดลม" value={name}
          onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
        <label style={labelStyle}>หน่วยนับ (ไม่บังคับ)</label>
        <input type="text" placeholder="เช่น แท่ง, ขวด, ชิ้น" value={unit}
          onChange={(e) => setUnit(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #334155",
            background: "#0f172a", color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ยกเลิก</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff",
            fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>เพิ่มสินค้า</button>
        </div>
      </div>
    </div>
  );
}

// โมดัลกรอกจำนวนตอนเพิ่ม/ลบ/แจกฟรีสต็อก
function StockQtyModal({ request, value, setValue, note, setNote, onConfirm, onCancel }) {
  const isAdd = request.action === "add";
  const isFree = request.action === "free";
  const icon = isAdd ? "📥" : isFree ? "🎁" : "📤";
  const title = isAdd ? "เพิ่มจำนวน" : isFree ? "แจกฟรี" : "ตัดสต็อก (ขายแล้ว)";
  const btnColor = isAdd
    ? "linear-gradient(135deg,#15803d,#22c55e)"
    : isFree
    ? "linear-gradient(135deg,#c2410c,#f97316)"
    : "linear-gradient(135deg,#b91c1c,#ef4444)";
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      padding: 16,
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, padding: 20,
        maxWidth: 320, width: "100%", border: "1px solid #334155",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9", marginBottom: 4, textAlign: "center" }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, textAlign: "center" }}>{request.itemName}</div>
        <input
          type="number"
          autoFocus
          placeholder={`จำนวน (${request.unit})`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !isFree) onConfirm(); }}
          style={{ ...inputStyle, fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: isFree ? 10 : 16 }}
        />
        {isFree && (
          <input
            type="text"
            placeholder="หมายเหตุ เช่น แจกในงานเปิดร้าน"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onConfirm(); }}
            style={{ ...inputStyle, marginBottom: 16 }}
          />
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #334155",
            background: "#0f172a", color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ยกเลิก</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
            background: btnColor,
            color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "income", date: todayStr(), amount: "", category: CATEGORIES_INCOME[0], note: "",
  });
  // รายการเมนูที่กำลังเพิ่มในออเดอร์ (ใช้เมื่อหมวด = ร้านอาหาร)
  // แต่ละแถว: { id, name, price, qty }
  const [orderItems, setOrderItems] = useState([]);
  const [filterMonth, setFilterMonth] = useState(todayStr().slice(0, 7));
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  // pinRequest: { purpose: "save" | "delete", payload }
  const [pinRequest, setPinRequest] = useState(null);
  // ภาพสรุป: เลือกแบบวันเดียว หรือทั้งเดือน (ตามตัวกรองเดือนที่ใช้อยู่)
  const [summaryMode, setSummaryMode] = useState("day");
  const [summaryDate, setSummaryDate] = useState(todayStr());
  const [summaryImage, setSummaryImage] = useState(null); // { dataUrl, label }
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showSummaryPicker, setShowSummaryPicker] = useState(false);
  // สรุปยอดขายตามเมนู (ในหน้าแดชบอร์ด): เลือกดูแบบวันเดียวหรือทั้งเดือน
  const [menuStatsMode, setMenuStatsMode] = useState("month"); // "day" | "month"
  const [menuStatsDate, setMenuStatsDate] = useState(todayStr());

  // ระบบสต็อกของ
  const [stockItems, setStockItems] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [stockView, setStockView] = useState("list"); // "list" | "graph"
  const [selectedStockItemId, setSelectedStockItemId] = useState(null);
  const [stockGraphMonth, setStockGraphMonth] = useState(todayStr().slice(0, 7));
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  // stockQtyRequest: { itemId, itemName, action: "add" | "remove" | "free" }
  const [stockQtyRequest, setStockQtyRequest] = useState(null);
  const [stockQtyValue, setStockQtyValue] = useState("");
  const [stockNote, setStockNote] = useState("");
  const [savingStock, setSavingStock] = useState(false);

  // ตั้งพื้นหลังของหน้าเว็บ (html/body) ให้เป็นสีเดียวกับแอป
  // กันไม่ให้เห็นขอบ/แถบสีขาวตอนเนื้อหาสั้นกว่าจอ หรือตอนเลื่อนหน้าจอเด้ง (overscroll)
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.background;
    const prevBodyBg = document.body.style.background;
    document.documentElement.style.background = "#0f172a";
    document.body.style.background = "#0f172a";
    document.body.style.margin = "0";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    const prevMeta = meta.content;
    meta.content = "#0f172a";
    return () => {
      document.documentElement.style.background = prevHtmlBg;
      document.body.style.background = prevBodyBg;
      meta.content = prevMeta;
    };
  }, []);

  // โหลดฟอนต์ล่วงหน้าตั้งแต่เปิดแอป เพื่อให้ตอนสร้างภาพสรุปครั้งแรกไม่ต้องรอโหลดฟอนต์นาน
  useEffect(() => {
    ensureSarabunLoaded();
  }, []);

  // โหลดข้อมูลจาก Supabase
  useEffect(() => {
    fetchRecords();
    // Real-time subscription
    const channel = supabase
      .channel("records-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "records" }, () => {
        fetchRecords();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // โหลดข้อมูลสต็อกจาก Supabase
  useEffect(() => {
    fetchStockItems();
    fetchStockMovements();
    const channel = supabase
      .channel("stock-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_items" }, () => {
        fetchStockItems();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_movements" }, () => {
        fetchStockMovements();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchStockItems() {
    const { data, error } = await supabase
      .from("stock_items")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setStockItems(data || []);
  }

  async function fetchStockMovements() {
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setStockMovements(data || []);
  }

  async function fetchRecords() {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setRecords(data || []);
    setLoading(false);
  }

  const showToast = (msg, color = "#22c55e") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2400);
  };

  const handleFormChange = (field, value) => {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      if (field === "type") {
        updated.category = value === "income" ? CATEGORIES_INCOME[0] : CATEGORIES_EXPENSE[0];
      }
      if (field === "type" || field === "category") {
        setOrderItems([]); // ล้างรายการเมนูเมื่อเปลี่ยนประเภท/หมวดหมู่
      }
      return updated;
    });
  };

  const isFoodOrder = form.type === "income" && form.category === "ร้านอาหาร";
  const orderTotal = orderItems.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);

  // เพิ่มแถวเมนูใหม่ในออเดอร์
  const addOrderItem = () => {
    setOrderItems((items) => [...items, { id: genId(), name: "", price: "", qty: 1 }]);
  };
  const updateOrderItem = (id, field, value) => {
    setOrderItems((items) => items.map((it) => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === "name") {
        const match = MENU_ITEMS.find((m) => m.name === value);
        if (match) updated.price = match.price;
      }
      return updated;
    }));
  };
  const removeOrderItem = (id) => {
    setOrderItems((items) => items.filter((it) => it.id !== id));
  };

  // ขั้นแรก: กดบันทึก -> ตรวจสอบฟอร์มแล้วขอรหัสประจำตัว
  const handleSubmit = () => {
    if (isFoodOrder) {
      if (orderItems.length === 0) {
        showToast("กรุณาเพิ่มเมนูอย่างน้อย 1 รายการ", "#ef4444");
        return;
      }
      const invalid = orderItems.some((it) => !it.name.trim() || !it.price || Number(it.price) <= 0 || !it.qty || Number(it.qty) <= 0);
      if (invalid) {
        showToast("กรุณากรอกชื่อเมนู ราคา และจำนวนให้ครบทุกแถว", "#ef4444");
        return;
      }
    } else {
      if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
        showToast("กรุณากรอกจำนวนเงินที่ถูกต้อง", "#ef4444");
        return;
      }
    }
    setPinRequest({ purpose: "save" });
  };

  // ขั้นที่สอง: ได้รหัสแล้ว -> บันทึกลง Supabase พร้อมชื่อผู้บันทึก
  const doSave = async ({ name }) => {
    setPinRequest(null);
    setSaving(true);

    let amount, note, items;
    if (isFoodOrder) {
      amount = orderTotal;
      note = orderItems.map((it) => `${it.name.trim()} x${it.qty}`).join(" · ");
      items = JSON.stringify(orderItems.map((it) => ({ name: it.name.trim(), price: Number(it.price), qty: Number(it.qty) })));
    } else {
      amount = Number(form.amount);
      note = form.note;
      items = null;
    }

    const rec = {
      id: genId(),
      type: form.type,
      date: form.date,
      amount,
      category: form.category,
      note,
      items,
      created_at: Date.now(),
      created_by: name,
      deleted: false,
      deleted_by: null,
      deleted_at: null,
    };
    const { error } = await supabase.from("records").insert([rec]);
    setSaving(false);
    if (error) {
      showToast("เกิดข้อผิดพลาด กรุณาลองใหม่", "#ef4444");
    } else {
      setForm((f) => ({ ...f, amount: "", note: "" }));
      setOrderItems([]);
      showToast(form.type === "income" ? "✓ บันทึกรายรับแล้ว" : "✓ บันทึกรายจ่ายแล้ว");
    }
  };

  // ขั้นแรกของการลบ: เลือกรายการที่จะลบ -> ขอรหัสประจำตัว
  const askDelete = (rec) => {
    setPinRequest({ purpose: "delete", payload: rec });
  };

  // ขั้นที่สอง: ได้รหัสแล้ว -> เปิดโมดัลยืนยันการลบ พร้อมชื่อผู้ลบ
  const onPinForDelete = ({ name }) => {
    const rec = pinRequest.payload;
    setPinRequest(null);
    const label = `${rec.type === "income" ? "รายรับ" : "รายจ่าย"} ฿${formatMoney(rec.amount)} (${rec.category}) วันที่ ${rec.date}`;
    setConfirmDelete({ id: rec.id, label, deletedBy: name });
  };

  // ลบแบบ soft delete: ไม่ลบออกจากฐานข้อมูลจริง แต่ทำเครื่องหมายว่าลบแล้ว พร้อมบันทึกว่าใครลบ
  const doDelete = async () => {
    const { error } = await supabase
      .from("records")
      .update({ deleted: true, deleted_by: confirmDelete.deletedBy, deleted_at: Date.now() })
      .eq("id", confirmDelete.id);
    setConfirmDelete(null);
    if (!error) showToast("ลบรายการแล้ว", "#f59e0b");
    else showToast("ลบไม่สำเร็จ", "#ef4444");
  };

  const handlePinSubmit = (result) => {
    if (pinRequest.purpose === "save") doSave(result);
    else if (pinRequest.purpose === "delete") onPinForDelete(result);
    else if (pinRequest.purpose === "stock") doStockMovement(result);
  };

  // คำนวณจำนวนสต็อกล่าสุดของแต่ละสินค้า จากผลรวมการเพิ่ม/ลบ
  const getStockCount = (itemId) => {
    return stockMovements
      .filter((m) => m.item_id === itemId)
      .reduce((sum, m) => sum + (m.type === "add" ? m.quantity : -m.quantity), 0);
  };

  // สร้างสินค้าใหม่ในสต็อก (ไม่ต้องกรอกรหัส แค่ตั้งชื่อ/หน่วย)
  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      showToast("กรุณากรอกชื่อสินค้า", "#ef4444");
      return;
    }
    const item = {
      id: genId(),
      name: newItemName.trim(),
      unit: newItemUnit.trim() || "ชิ้น",
      created_at: Date.now(),
    };
    const { error } = await supabase.from("stock_items").insert([item]);
    if (error) {
      showToast("เพิ่มสินค้าไม่สำเร็จ", "#ef4444");
    } else {
      setShowNewItemModal(false);
      setNewItemName("");
      setNewItemUnit("");
      showToast("✓ เพิ่มสินค้าแล้ว");
    }
  };

  // ขั้นแรก: เลือกเพิ่ม/ลบ/แจกฟรีสต็อก -> เปิดช่องกรอกจำนวน
  const askStockQty = (item, action) => {
    setStockQtyValue("");
    setStockNote("");
    setStockQtyRequest({ itemId: item.id, itemName: item.name, unit: item.unit, action });
  };

  // ขั้นที่สอง: กรอกจำนวนแล้ว -> ปิดหน้ากรอกจำนวน แล้วขอรหัสประจำตัว
  const confirmStockQty = () => {
    const qty = Number(stockQtyValue);
    if (!stockQtyValue || isNaN(qty) || qty <= 0) {
      showToast("กรุณากรอกจำนวนที่ถูกต้อง", "#ef4444");
      return;
    }
    const payload = { ...stockQtyRequest, quantity: qty, note: stockQtyRequest.action === "free" ? stockNote.trim() : "" };
    setStockQtyRequest(null);
    setPinRequest({ purpose: "stock", payload });
  };

  // ขั้นที่สาม: ได้รหัสแล้ว -> บันทึกการเคลื่อนไหวสต็อกพร้อมชื่อผู้ทำรายการ
  const doStockMovement = async ({ name }) => {
    const payload = pinRequest.payload;
    setPinRequest(null);
    setStockQtyRequest(null);
    setSavingStock(true);
    const movement = {
      id: genId(),
      item_id: payload.itemId,
      type: payload.action, // "add" | "remove" | "free"
      quantity: payload.quantity,
      note: payload.note || null,
      date: todayStr(),
      created_by: name,
      created_at: Date.now(),
    };
    const { error } = await supabase.from("stock_movements").insert([movement]);
    setSavingStock(false);
    if (error) {
      showToast("บันทึกสต็อกไม่สำเร็จ", "#ef4444");
    } else {
      const verb = payload.action === "add" ? "เพิ่ม" : payload.action === "free" ? "แจกฟรี" : "ตัดสต็อก";
      showToast(`✓ ${verb} ${payload.itemName} แล้ว ${payload.quantity} ${payload.unit}`);
    }
  };

  // สร้างภาพสรุป (เหมือนใบเสร็จ) ด้วย Canvas API ไม่ต้องพึ่งไลบรารีเสริม
  const generateSummaryImage = async () => {
    setGeneratingImage(true);
    try {
      await ensureSarabunLoaded();

      const isDay = summaryMode === "day";
      const items = (isDay
        ? activeRecords.filter((r) => r.date === summaryDate)
        : activeRecords.filter((r) => r.date.startsWith(filterMonth))
      ).sort((a, b) => (a.date === b.date ? a.created_at - b.created_at : a.date.localeCompare(b.date)));

      const label = isDay ? `วันที่ ${summaryDate}` : `เดือน ${filterMonth}`;

      const incomeItems = items.filter((r) => r.type === "income");
      const expenseItems = items.filter((r) => r.type === "expense");
      const sumIncome = incomeItems.reduce((s, r) => s + r.amount, 0);
      const sumExpense = expenseItems.reduce((s, r) => s + r.amount, 0);
      const net = sumIncome - sumExpense;

      const byCat = (list) => {
        const m = {};
        list.forEach((r) => { m[r.category] = (m[r.category] || 0) + r.amount; });
        return Object.entries(m).sort((a, b) => b[1] - a[1]);
      };
      const incomeCats = byCat(incomeItems);
      const expenseCats = byCat(expenseItems);

      // คำนวณความสูงของภาพล่วงหน้าตามจำนวนเนื้อหา
      const W = 640;
      const PAD = 32;
      const RIGHT_MARGIN = 44; // เผื่อขอบขวาเพิ่ม กันตัวเลขชิดขอบเกินไป (เผื่อความกว้างฟอนต์ต่างกันเล็กน้อยตามเครื่อง)
      const lineH = 26;
      let h = 0;
      h += 100; // header (shop name + label)
      h += 24; // divider gap
      h += 110; // totals block
      h += 20;
      if (incomeCats.length || expenseCats.length) {
        h += 36; // section title
        h += incomeCats.length * lineH;
        h += expenseCats.length ? 30 + expenseCats.length * lineH : 0;
        h += 20;
      }
      h += 36; // items section title
      h += Math.max(items.length, 1) * lineH;
      h += 60; // footer

      const canvas = document.createElement("canvas");
      const scale = 2; // วาดละเอียดขึ้นสำหรับจอ retina
      canvas.width = W * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      const FONT = "'Sarabun','Noto Sans Thai',sans-serif";

      // พื้นหลัง
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, h);

      let y = PAD;

      // Header
      ctx.fillStyle = "#f8fafc";
      ctx.font = `800 20px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillText("🎣 " + SHOP_NAME, PAD, y + 18);
      y += 30;
      ctx.fillStyle = "#94a3b8";
      ctx.font = `600 14px ${FONT}`;
      ctx.fillText(`สรุปข้อมูล${isDay ? "ประจำวัน" : "ประจำเดือน"} — ${label}`, PAD, y + 14);
      y += 36;

      // เส้นแบ่ง
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      y += 24;

      // กล่องสรุปยอด 3 ช่อง
      const boxW = (W - PAD * 2 - 16) / 3;
      const boxes = [
        { label: "รายรับ", value: sumIncome, color: "#22c55e" },
        { label: "รายจ่าย", value: sumExpense, color: "#ef4444" },
        { label: "กำไรสุทธิ", value: net, color: net >= 0 ? "#f97316" : "#ef4444" },
      ];
      boxes.forEach((b, i) => {
        const bx = PAD + i * (boxW + 8);
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#334155";
        roundRect(ctx, bx, y, boxW, 86, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#94a3b8";
        ctx.font = `600 12px ${FONT}`;
        ctx.textAlign = "center";
        ctx.fillText(b.label, bx + boxW / 2, y + 26);
        ctx.fillStyle = b.color;
        ctx.font = `800 15px ${FONT}`;
        ctx.fillText(formatMoney(b.value), bx + boxW / 2, y + 56);
      });
      y += 86 + 24;

      // สรุปตามประเภท
      if (incomeCats.length || expenseCats.length) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#f1f5f9";
        ctx.font = `700 14px ${FONT}`;
        ctx.fillText("สรุปตามประเภท", PAD, y + 14);
        y += 30;

        if (incomeCats.length) {
          ctx.fillStyle = "#22c55e";
          ctx.font = `700 12px ${FONT}`;
          ctx.fillText("รายรับ", PAD, y + 12);
          y += 22;
          incomeCats.forEach(([cat, amt]) => {
            drawRow(ctx, cat, formatMoney(amt) + " ฿", PAD, y, W - RIGHT_MARGIN, "#cbd5e1", "#22c55e", FONT);
            y += lineH;
          });
          y += 8;
        }
        if (expenseCats.length) {
          ctx.fillStyle = "#ef4444";
          ctx.font = `700 12px ${FONT}`;
          ctx.fillText("รายจ่าย", PAD, y + 12);
          y += 22;
          expenseCats.forEach(([cat, amt]) => {
            drawRow(ctx, cat, formatMoney(amt) + " ฿", PAD, y, W - RIGHT_MARGIN, "#cbd5e1", "#ef4444", FONT);
            y += lineH;
          });
        }
        y += 12;
      }

      // เส้นแบ่ง
      ctx.strokeStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      y += 24;

      // รายการย่อยทุกอัน
      ctx.fillStyle = "#f1f5f9";
      ctx.font = `700 14px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillText(`รายการทั้งหมด (${items.length} รายการ)`, PAD, y + 14);
      y += 30;

      if (items.length === 0) {
        ctx.fillStyle = "#64748b";
        ctx.font = `400 13px ${FONT}`;
        ctx.fillText("ไม่มีรายการ", PAD, y + 14);
        y += lineH;
      } else {
        items.forEach((r) => {
          const sign = r.type === "income" ? "+" : "-";
          const color = r.type === "income" ? "#22c55e" : "#ef4444";
          const dateTag = isDay ? "" : `${r.date.slice(5)} · `;
          const leftText = `${dateTag}${r.category}${r.note ? " · " + r.note : ""}`;
          drawRow(ctx, leftText, `${sign}${formatMoney(r.amount)} ฿`, PAD, y, W - RIGHT_MARGIN, "#cbd5e1", color, FONT, 12);
          y += lineH;
        });
      }

      y += 16;
      ctx.strokeStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      y += 20;

      ctx.textAlign = "center";
      ctx.fillStyle = "#64748b";
      ctx.font = `400 11px ${FONT}`;
      const now = new Date();
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      ctx.fillText(`สร้างเมื่อ ${stamp}`, W / 2, y + 12);

      const dataUrl = canvas.toDataURL("image/png");
      setSummaryImage({ dataUrl, label: isDay ? `สรุปวันที่ ${summaryDate}` : `สรุปเดือน ${filterMonth}` });
      setShowSummaryPicker(false);
    } finally {
      setGeneratingImage(false);
    }
  };

  // Stats: ไม่นับรายการที่ถูกลบแล้ว
  const activeRecords = records.filter((r) => !r.deleted);
  const monthRecords = activeRecords.filter((r) => r.date.startsWith(filterMonth));
  const totalIncome = monthRecords.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const totalExpense = monthRecords.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const profit = totalIncome - totalExpense;

  const dailyMap = {};
  monthRecords.forEach((r) => {
    if (!dailyMap[r.date]) dailyMap[r.date] = { income: 0, expense: 0 };
    dailyMap[r.date][r.type] += r.amount;
  });
  const dailyRows = Object.entries(dailyMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, v]) => ({ date, income: v.income, expense: v.expense, profit: v.income - v.expense }));

  const catIncome = {};
  const catExpense = {};
  monthRecords.forEach((r) => {
    if (r.type === "income") catIncome[r.category] = (catIncome[r.category] || 0) + r.amount;
    else catExpense[r.category] = (catExpense[r.category] || 0) + r.amount;
  });
  const maxBar = Math.max(...dailyRows.map((d) => Math.max(d.income, d.expense, 1)), 1);

  // สรุปยอดขายตามเมนู: รวบรวมจากออเดอร์ "ร้านอาหาร" ที่มีรายการ items บันทึกไว้
  const menuStatsRecords = activeRecords.filter((r) =>
    r.type === "income" && r.category === "ร้านอาหาร" && r.items &&
    (menuStatsMode === "day" ? r.date === menuStatsDate : r.date.startsWith(menuStatsDate.slice(0, 7)))
  );
  const menuStatsMap = {};
  menuStatsRecords.forEach((r) => {
    let parsed = [];
    try { parsed = JSON.parse(r.items); } catch (e) { parsed = []; }
    parsed.forEach((it) => {
      if (!menuStatsMap[it.name]) menuStatsMap[it.name] = { qty: 0, total: 0 };
      menuStatsMap[it.name].qty += Number(it.qty) || 0;
      menuStatsMap[it.name].total += (Number(it.qty) || 0) * (Number(it.price) || 0);
    });
  });
  const menuStatsRows = Object.entries(menuStatsMap)
    .map(([name, v]) => ({ name, qty: v.qty, total: v.total }))
    .sort((a, b) => b.qty - a.qty);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🎣</div>
        <div style={{ color: "#94a3b8", fontSize: 16 }}>กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Sarabun','Noto Sans Thai',sans-serif" }}>
      {confirmDelete && (
        <ConfirmModal
          msg={`ต้องการลบ${confirmDelete.label} ใช่หรือไม่?`}
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showSummaryPicker && (
        <SummaryPickerModal
          summaryMode={summaryMode}
          setSummaryMode={setSummaryMode}
          summaryDate={summaryDate}
          setSummaryDate={setSummaryDate}
          filterMonth={filterMonth}
          onGenerate={generateSummaryImage}
          generating={generatingImage}
          onClose={() => setShowSummaryPicker(false)}
        />
      )}

      {summaryImage && (
        <SummaryImageModal image={summaryImage} onClose={() => setSummaryImage(null)} />
      )}

      {showNewItemModal && (
        <NewItemModal
          name={newItemName}
          setName={setNewItemName}
          unit={newItemUnit}
          setUnit={setNewItemUnit}
          onConfirm={handleAddItem}
          onCancel={() => { setShowNewItemModal(false); setNewItemName(""); setNewItemUnit(""); }}
        />
      )}

      {stockQtyRequest && (
        <StockQtyModal
          request={stockQtyRequest}
          value={stockQtyValue}
          setValue={setStockQtyValue}
          note={stockNote}
          setNote={setStockNote}
          onConfirm={confirmStockQty}
          onCancel={() => setStockQtyRequest(null)}
        />
      )}

      {/* PinModal เรนเดอร์ทีหลังสุดเสมอ เพื่อให้ลอยอยู่บนสุดเมื่อต้องขอรหัสต่อจากโมดัลอื่น */}
      {pinRequest && (
        <PinModal
          title={
            pinRequest.purpose === "save" ? "กรอกรหัสประจำตัวเพื่อบันทึก" :
            pinRequest.purpose === "delete" ? "กรอกรหัสประจำตัวเพื่อลบรายการ" :
            "กรอกรหัสประจำตัวเพื่อแก้ไขสต็อก"
          }
          onSubmit={handlePinSubmit}
          onCancel={() => setPinRequest(null)}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: toast.color, color: "#fff", padding: "10px 24px",
          borderRadius: 30, fontWeight: 700, zIndex: 9999, fontSize: 15,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap",
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f4c2a 0%,#1a3a5c 100%)", borderBottom: "1px solid #334155", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🎣</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#f8fafc", lineHeight: 1.2 }}>{SHOP_NAME}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>ระบบบันทึกการเงิน</div>
          </div>
          <div style={{ fontSize: 11, color: saving ? "#f59e0b" : "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: saving ? "#f59e0b" : "#22c55e" }} />
            {saving ? "กำลังบันทึก..." : "🌐 ออนไลน์"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
        {[
          { key: "dashboard", label: "📊 สรุป" },
          { key: "add", label: "➕ บันทึก" },
          { key: "stock", label: "📦 สต็อก" },
          { key: "history", label: "📋 ประวัติ" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "13px 0", border: "none", cursor: "pointer",
            background: tab === t.key ? "#1e293b" : "transparent",
            color: tab === t.key ? "#f97316" : "#94a3b8",
            fontWeight: tab === t.key ? 700 : 400, fontSize: 14,
            borderBottom: tab === t.key ? "2px solid #f97316" : "2px solid transparent",
            transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 80px" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <label style={{ color: "#94a3b8", fontSize: 13 }}>เดือน:</label>
              <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
                style={{ background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 12px", borderRadius: 8, fontSize: 14 }} />
              <button onClick={() => setShowSummaryPicker(true)} title="สร้างภาพสรุป" style={{
                width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
                cursor: "pointer", fontSize: 16, flexShrink: 0,
              }}>📷</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "รายรับ", value: totalIncome, color: "#22c55e", icon: "📈" },
                { label: "รายจ่าย", value: totalExpense, color: "#ef4444", icon: "📉" },
                { label: "กำไรสุทธิ", value: profit, color: profit >= 0 ? "#f97316" : "#ef4444", icon: "💰" },
              ].map((k) => (
                <div key={k.label} style={{ background: "#1e293b", borderRadius: 12, padding: "14px 10px", textAlign: "center", border: "1px solid #334155" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: k.color, wordBreak: "break-all" }}>{formatMoney(k.value)}</div>
                </div>
              ))}
            </div>

            {dailyRows.length > 0 && (
              <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 18, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, color: "#f1f5f9" }}>📅 กำไรรายวัน</div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 100, overflowX: "auto" }}>
                  {[...dailyRows].reverse().map((d) => (
                    <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 28, flex: 1 }}>
                      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 80, marginBottom: 4 }}>
                        <div style={{ width: 10, background: "#22c55e", borderRadius: "3px 3px 0 0", height: `${Math.max(4, (d.income / maxBar) * 76)}px` }} />
                        <div style={{ width: 10, background: "#ef4444", borderRadius: "3px 3px 0 0", height: `${Math.max(4, (d.expense / maxBar) * 76)}px` }} />
                      </div>
                      <div style={{ fontSize: 9, color: "#64748b" }}>{d.date.slice(8)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8" }}>
                    <div style={{ width: 10, height: 10, background: "#22c55e", borderRadius: 2 }} /> รายรับ
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8" }}>
                    <div style={{ width: 10, height: 10, background: "#ef4444", borderRadius: 2 }} /> รายจ่าย
                  </div>
                </div>
              </div>
            )}

            {dailyRows.length > 0 && (
              <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 18, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "#f1f5f9" }}>📋 สรุปรายวัน</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: "#64748b" }}>
                      <th style={{ textAlign: "left", paddingBottom: 8 }}>วันที่</th>
                      <th style={{ textAlign: "right", paddingBottom: 8 }}>รายรับ</th>
                      <th style={{ textAlign: "right", paddingBottom: 8 }}>รายจ่าย</th>
                      <th style={{ textAlign: "right", paddingBottom: 8 }}>กำไร</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRows.map((d) => (
                      <tr key={d.date} style={{ borderTop: "1px solid #0f172a" }}>
                        <td style={{ padding: "7px 0", color: "#cbd5e1" }}>{d.date}</td>
                        <td style={{ padding: "7px 0", textAlign: "right", color: "#22c55e" }}>{formatMoney(d.income)}</td>
                        <td style={{ padding: "7px 0", textAlign: "right", color: "#ef4444" }}>{formatMoney(d.expense)}</td>
                        <td style={{ padding: "7px 0", textAlign: "right", fontWeight: 700, color: d.profit >= 0 ? "#f97316" : "#ef4444" }}>{formatMoney(d.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(Object.keys(catIncome).length > 0 || Object.keys(catExpense).length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "รายรับตามประเภท", data: catIncome, color: "#22c55e" },
                  { label: "รายจ่ายตามประเภท", data: catExpense, color: "#ef4444" },
                ].map((sec) => (
                  <div key={sec.label} style={{ background: "#1e293b", borderRadius: 14, padding: 14, border: "1px solid #334155" }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "#f1f5f9" }}>{sec.label}</div>
                    {Object.entries(sec.data).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                      <div key={cat} style={{ marginBottom: 7 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                          <span style={{ color: "#cbd5e1" }}>{cat}</span>
                          <span style={{ color: sec.color, fontWeight: 700 }}>{formatMoney(amt)}</span>
                        </div>
                        <div style={{ height: 4, background: "#0f172a", borderRadius: 2 }}>
                          <div style={{ height: 4, background: sec.color, borderRadius: 2, width: `${(amt / Math.max(...Object.values(sec.data))) * 100}%`, opacity: 0.8 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {monthRecords.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#475569" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div>ยังไม่มีข้อมูลในเดือนนี้<br />กดแท็บ "บันทึก" เพื่อเพิ่มรายการ</div>
              </div>
            )}

            {/* เส้นแบ่ง + สรุปยอดขายตามเมนู */}
            <div style={{ borderTop: "1px solid #334155", marginTop: 28, paddingTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>🍽️ ยอดขายตามเมนู</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #334155" }}>
                    {[{ key: "day", label: "วันเดียว" }, { key: "month", label: "ทั้งเดือน" }].map((m) => (
                      <button key={m.key} onClick={() => setMenuStatsMode(m.key)} style={{
                        padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                        background: menuStatsMode === m.key ? "#0f4c2a" : "#0f172a",
                        color: menuStatsMode === m.key ? "#fff" : "#64748b",
                      }}>{m.label}</button>
                    ))}
                  </div>
                  {menuStatsMode === "day" ? (
                    <input type="date" value={menuStatsDate} onChange={(e) => setMenuStatsDate(e.target.value)}
                      style={{ background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 10px", borderRadius: 8, fontSize: 13 }} />
                  ) : (
                    <input type="month" value={menuStatsDate.slice(0, 7)} onChange={(e) => setMenuStatsDate(e.target.value + "-01")}
                      style={{ background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 10px", borderRadius: 8, fontSize: 13 }} />
                  )}
                </div>
              </div>

              {menuStatsRows.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#475569", fontSize: 13 }}>
                  ไม่มีรายการขายเมนูอาหารใน{menuStatsMode === "day" ? "วันนี้" : "เดือนนี้"}
                </div>
              ) : (
                <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, border: "1px solid #334155" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: "#64748b" }}>
                        <th style={{ textAlign: "left", paddingBottom: 8 }}>เมนู</th>
                        <th style={{ textAlign: "right", paddingBottom: 8 }}>จำนวนสั่ง</th>
                        <th style={{ textAlign: "right", paddingBottom: 8 }}>ยอดขาย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuStatsRows.map((m) => (
                        <tr key={m.name} style={{ borderTop: "1px solid #0f172a" }}>
                          <td style={{ padding: "8px 0", color: "#cbd5e1" }}>{m.name}</td>
                          <td style={{ padding: "8px 0", textAlign: "right", color: "#f1f5f9", fontWeight: 700 }}>{m.qty}</td>
                          <td style={{ padding: "8px 0", textAlign: "right", color: "#22c55e", fontWeight: 700 }}>{formatMoney(m.total)} ฿</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADD */}
        {tab === "add" && (
          <div style={{ background: "#1e293b", borderRadius: 16, padding: 20, border: "1px solid #334155" }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20, color: "#f1f5f9" }}>➕ บันทึกรายการ</div>
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", marginBottom: 20, border: "1px solid #334155" }}>
              {[{ key: "income", label: "💚 รายรับ" }, { key: "expense", label: "❤️ รายจ่าย" }].map((t) => (
                <button key={t.key} onClick={() => handleFormChange("type", t.key)} style={{
                  flex: 1, padding: "12px 0", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700,
                  background: form.type === t.key ? (t.key === "income" ? "#15803d" : "#b91c1c") : "#0f172a",
                  color: form.type === t.key ? "#fff" : "#64748b", transition: "all 0.2s",
                }}>{t.label}</button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>📅 วันที่</label>
                <input type="date" value={form.date} onChange={(e) => handleFormChange("date", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>🏷️ ประเภท</label>
                <select value={form.category} onChange={(e) => handleFormChange("category", e.target.value)} style={inputStyle}>
                  {(form.type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {isFoodOrder ? (
                <div>
                  <label style={labelStyle}>🍽️ รายการเมนู</label>
                  <datalist id="menu-options">
                    {MENU_ITEMS.map((m) => <option key={m.name} value={m.name} />)}
                  </datalist>
                  {orderItems.map((it) => (
                    <div key={it.id} style={{
                      display: "flex", gap: 6, marginBottom: 8, alignItems: "center",
                      background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: 8,
                    }}>
                      <input
                        type="text"
                        list="menu-options"
                        placeholder="พิมพ์หรือเลือกเมนู"
                        value={it.name}
                        onChange={(e) => updateOrderItem(it.id, "name", e.target.value)}
                        style={{ ...inputStyle, flex: 2, padding: "8px 10px", fontSize: 13 }}
                      />
                      <input
                        type="number"
                        placeholder="ราคา"
                        value={it.price}
                        onChange={(e) => updateOrderItem(it.id, "price", e.target.value)}
                        style={{ ...inputStyle, flex: 1, padding: "8px 10px", fontSize: 13, minWidth: 0 }}
                      />
                      <input
                        type="number"
                        placeholder="จำนวน"
                        value={it.qty}
                        onChange={(e) => updateOrderItem(it.id, "qty", e.target.value)}
                        style={{ ...inputStyle, flex: 1, padding: "8px 10px", fontSize: 13, minWidth: 0 }}
                      />
                      <button onClick={() => removeOrderItem(it.id)} style={{
                        background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                        color: "#ef4444", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 13, flexShrink: 0,
                      }}>✕</button>
                    </div>
                  ))}
                  <button onClick={addOrderItem} style={{
                    width: "100%", padding: "10px 0", borderRadius: 10, border: "1px dashed #3b82f6",
                    background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontWeight: 700, cursor: "pointer", fontSize: 14,
                    marginBottom: 14,
                  }}>➕ เพิ่มเมนู</button>

                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", background: "#0f172a", borderRadius: 10, border: "1px solid #334155",
                  }}>
                    <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>ยอดรวม</span>
                    <span style={{ color: "#22c55e", fontSize: 20, fontWeight: 800 }}>{formatMoney(orderTotal)} ฿</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>💵 จำนวนเงิน (บาท)</label>
                  <input type="number" placeholder="0.00" value={form.amount}
                    onChange={(e) => handleFormChange("amount", e.target.value)}
                    style={{ ...inputStyle, fontSize: 20, fontWeight: 700, color: form.type === "income" ? "#22c55e" : "#ef4444" }} />
                </div>
              )}

              {!isFoodOrder && (
                <div>
                  <label style={labelStyle}>📝 หมายเหตุ (ไม่บังคับ)</label>
                  <input type="text" placeholder="เช่น ค่าหมู ค่าผัก..." value={form.note}
                    onChange={(e) => handleFormChange("note", e.target.value)} style={inputStyle} />
                </div>
              )}

              <button onClick={handleSubmit} disabled={saving} style={{
                marginTop: 6, padding: "14px 0", borderRadius: 12, border: "none", cursor: saving ? "not-allowed" : "pointer",
                background: form.type === "income" ? "linear-gradient(135deg,#15803d,#22c55e)" : "linear-gradient(135deg,#b91c1c,#ef4444)",
                color: "#fff", fontWeight: 800, fontSize: 16, opacity: saving ? 0.7 : 1,
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              }}>
                {saving ? "⏳ กำลังบันทึก..." : (form.type === "income" ? "💚 บันทึกรายรับ" : "❤️ บันทึกรายจ่าย")}
              </button>
            </div>
          </div>
        )}

        {/* STOCK */}
        {tab === "stock" && (
          <div>
            {stockView === "list" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>📦 สต็อกสินค้า</div>
                  <button onClick={() => setShowNewItemModal(true)} style={{
                    padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "#fff",
                    fontWeight: 700, fontSize: 13,
                  }}>➕ เพิ่มสินค้า</button>
                </div>

                {stockItems.length === 0 && (
                  <div style={{ textAlign: "center", padding: "50px 0", color: "#475569" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div>ยังไม่มีสินค้าในสต็อก<br />กดปุ่ม "เพิ่มสินค้า" เพื่อเริ่มต้น</div>
                  </div>
                )}

                {stockItems.map((item) => {
                  const count = getStockCount(item.id);
                  return (
                    <div key={item.id} style={{
                      background: "#1e293b", borderRadius: 12, padding: "14px", marginBottom: 10,
                      border: "1px solid #334155",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <button
                          onClick={() => { setSelectedStockItemId(item.id); setStockView("graph"); }}
                          style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>📈 ดูกราฟรายวัน</div>
                        </button>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: count > 0 ? "#22c55e" : "#ef4444" }}>{count}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{item.unit}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => askStockQty(item, "add")} style={{
                          flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                          background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontWeight: 700, fontSize: 12,
                        }}>📥 เพิ่ม</button>
                        <button onClick={() => askStockQty(item, "remove")} style={{
                          flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                          background: "linear-gradient(135deg,#b91c1c,#ef4444)", color: "#fff", fontWeight: 700, fontSize: 12,
                        }}>📤 ขายแล้ว</button>
                        <button onClick={() => askStockQty(item, "free")} style={{
                          flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                          background: "linear-gradient(135deg,#c2410c,#f97316)", color: "#fff", fontWeight: 700, fontSize: 12,
                        }}>🎁 ฟรี</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {stockView === "graph" && (() => {
              const item = stockItems.find((i) => i.id === selectedStockItemId);
              if (!item) {
                return (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                    <div style={{ marginBottom: 14 }}>ไม่พบสินค้านี้</div>
                    <button onClick={() => setStockView("list")} style={{
                      padding: "9px 18px", borderRadius: 8, border: "1px solid #334155",
                      background: "#1e293b", color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 13,
                    }}>← กลับไปหน้ารายการสินค้า</button>
                  </div>
                );
              }
              const itemMovements = stockMovements
                .filter((m) => m.item_id === item.id && m.date.startsWith(stockGraphMonth))
                .sort((a, b) => a.date.localeCompare(b.date));

              const dayMap = {};
              itemMovements.forEach((m) => {
                if (!dayMap[m.date]) dayMap[m.date] = { add: 0, remove: 0, free: 0 };
                dayMap[m.date][m.type] += m.quantity;
              });
              const dayRows = Object.entries(dayMap).map(([date, v]) => ({ date, add: v.add, remove: v.remove, free: v.free }));
              const maxQty = Math.max(...dayRows.map((d) => Math.max(d.add, d.remove, d.free, 1)), 1);
              const currentCount = getStockCount(item.id);
              const freeNotes = itemMovements.filter((m) => m.type === "free");

              return (
                <div>
                  <button onClick={() => setStockView("list")} style={{
                    background: "none", border: "none", color: "#94a3b8", cursor: "pointer",
                    fontSize: 13, marginBottom: 14, padding: 0,
                  }}>← กลับไปหน้ารายการสินค้า</button>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 17, color: "#f1f5f9" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>สต็อกล่าสุด: <span style={{ color: currentCount > 0 ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{currentCount} {item.unit}</span></div>
                    </div>
                    <input type="month" value={stockGraphMonth} onChange={(e) => setStockGraphMonth(e.target.value)}
                      style={{ background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 10px", borderRadius: 8, fontSize: 13 }} />
                  </div>

                  {dayRows.length > 0 ? (
                    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 18, border: "1px solid #334155" }}>
                      <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, color: "#f1f5f9" }}>📅 การเคลื่อนไหวรายวัน</div>
                      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 100, overflowX: "auto" }}>
                        {dayRows.map((d) => (
                          <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 36, flex: 1 }}>
                            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 80, marginBottom: 4 }}>
                              <div style={{ width: 8, background: "#22c55e", borderRadius: "3px 3px 0 0", height: `${Math.max(4, (d.add / maxQty) * 76)}px` }} />
                              <div style={{ width: 8, background: "#ef4444", borderRadius: "3px 3px 0 0", height: `${Math.max(4, (d.remove / maxQty) * 76)}px` }} />
                              <div style={{ width: 8, background: "#f97316", borderRadius: "3px 3px 0 0", height: `${Math.max(4, (d.free / maxQty) * 76)}px` }} />
                            </div>
                            <div style={{ fontSize: 9, color: "#64748b" }}>{d.date.slice(8)}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8" }}>
                          <div style={{ width: 10, height: 10, background: "#22c55e", borderRadius: 2 }} /> เพิ่มเข้า
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8" }}>
                          <div style={{ width: 10, height: 10, background: "#ef4444", borderRadius: 2 }} /> ตัดออก (ขาย)
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8" }}>
                          <div style={{ width: 10, height: 10, background: "#f97316", borderRadius: 2 }} /> แจกฟรี
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                      <div>ไม่มีการเคลื่อนไหวในเดือนนี้</div>
                    </div>
                  )}

                  {dayRows.length > 0 && (
                    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 18, border: "1px solid #334155" }}>
                      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "#f1f5f9" }}>📋 สรุปรายวัน</div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ color: "#64748b" }}>
                            <th style={{ textAlign: "left", paddingBottom: 8 }}>วันที่</th>
                            <th style={{ textAlign: "right", paddingBottom: 8 }}>เพิ่ม</th>
                            <th style={{ textAlign: "right", paddingBottom: 8 }}>ขาย</th>
                            <th style={{ textAlign: "right", paddingBottom: 8 }}>ฟรี</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...dayRows].reverse().map((d) => (
                            <tr key={d.date} style={{ borderTop: "1px solid #0f172a" }}>
                              <td style={{ padding: "7px 0", color: "#cbd5e1" }}>{d.date}</td>
                              <td style={{ padding: "7px 0", textAlign: "right", color: "#22c55e" }}>+{d.add}</td>
                              <td style={{ padding: "7px 0", textAlign: "right", color: "#ef4444" }}>-{d.remove}</td>
                              <td style={{ padding: "7px 0", textAlign: "right", color: "#f97316" }}>{d.free > 0 ? `-${d.free}` : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {freeNotes.length > 0 && (
                    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, border: "1px solid #334155" }}>
                      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: "#f1f5f9" }}>🎁 รายการแจกฟรี</div>
                      {[...freeNotes].sort((a, b) => b.created_at - a.created_at).map((m) => (
                        <div key={m.id} style={{ padding: "8px 0", borderTop: "1px solid #0f172a", fontSize: 13 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#f97316", fontWeight: 700 }}>-{m.quantity} {item.unit}</span>
                            <span style={{ color: "#64748b", fontSize: 11 }}>{m.date} · {m.created_by}</span>
                          </div>
                          {m.note && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{m.note}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#f1f5f9" }}>📋 ประวัติทั้งหมด ({records.length} รายการ)</div>
            {records.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#475569" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div>ยังไม่มีรายการ</div>
              </div>
            )}
            {records.map((r) => {
              const isDeleted = !!r.deleted;
              return (
                <div key={r.id} style={{
                  background: "#1e293b", borderRadius: 12, padding: "13px 14px", marginBottom: 8,
                  border: `1px solid ${isDeleted ? "#334155" : (r.type === "income" ? "#166534" : "#7f1d1d")}`,
                  display: "flex", alignItems: "center", gap: 12,
                  opacity: isDeleted ? 0.6 : 1,
                }}>
                  <div style={{ fontSize: 22 }}>{isDeleted ? "🗑️" : (r.type === "income" ? "💚" : "❤️")}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        fontWeight: 700, fontSize: 16,
                        color: isDeleted ? "#64748b" : (r.type === "income" ? "#22c55e" : "#ef4444"),
                        textDecoration: isDeleted ? "line-through" : "none",
                      }}>
                        {r.type === "income" ? "+" : "-"}{formatMoney(r.amount)} ฿
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{r.date}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      {r.category}{r.note ? ` · ${r.note}` : ""}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
                      {r.created_by ? `บันทึกโดย ${r.created_by}` : ""}
                      {isDeleted ? ` · ลบไปแล้ว${r.deleted_by ? ` โดย ${r.deleted_by}` : ""}` : ""}
                    </div>
                  </div>
                  {!isDeleted && (
                    <button onClick={() => askDelete(r)} style={{
                      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                      cursor: "pointer", color: "#ef4444", fontSize: 16,
                      padding: "6px 10px", borderRadius: 8,
                    }} title="ลบรายการ">🗑️</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#0f172a", border: "1px solid #334155",
  color: "#f1f5f9", padding: "11px 14px", borderRadius: 10, fontSize: 15,
  boxSizing: "border-box",
};
const labelStyle = {
  display: "block", marginBottom: 6, fontSize: 13, color: "#94a3b8", fontWeight: 600,
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);