import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactDOM from "react-dom/client";

const SUPABASE_URL = "https://sbpmkmuxtslmxwsdaral.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicG1rbXV4dHNsbXh3c2RhcmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTczNjAsImV4cCI6MjA5ODEzMzM2MH0.9xWYG8SG5CmP5pVvnyxS79JrEL0g-pku0334GiOEOTs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIES_INCOME = ["ร้านอาหาร", "ตกปลา", "ผลไม้", "อื่นๆ"];
const CATEGORIES_EXPENSE = ["วัตถุดิบ", "ค่าแรง", "ค่าอุปกรณ์ครัว", "ค่าซ่อมบำรุง", "อื่นๆ"];
const SHOP_NAME = "ร้านโคกหนองนาฟิชชิ่งท่าเรือ";

// รหัสประจำตัวพนักงาน -> ชื่อที่จะแสดง
// แก้ไข/เพิ่มรายชื่อพนักงานและรหัสได้ที่นี่
const STAFF_PINS = {
  "1111": "เจ้าของร้าน",
  "1234": "พนักงาน A",
  "5678": "พนักงาน B",
};

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

function App() {
  const [tab, setTab] = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "income", date: todayStr(), amount: "", category: CATEGORIES_INCOME[0], note: "",
  });
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
      return updated;
    });
  };

  // ขั้นแรก: กดบันทึก -> ตรวจสอบฟอร์มแล้วขอรหัสประจำตัว
  const handleSubmit = () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      showToast("กรุณากรอกจำนวนเงินที่ถูกต้อง", "#ef4444");
      return;
    }
    setPinRequest({ purpose: "save" });
  };

  // ขั้นที่สอง: ได้รหัสแล้ว -> บันทึกลง Supabase พร้อมชื่อผู้บันทึก
  const doSave = async ({ name }) => {
    setPinRequest(null);
    setSaving(true);
    const rec = {
      id: genId(),
      type: form.type,
      date: form.date,
      amount: Number(form.amount),
      category: form.category,
      note: form.note,
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
  };

  // สร้างภาพสรุป (เหมือนใบเสร็จ) ด้วย Canvas API ไม่ต้องพึ่งไลบรารีเสริม
  const generateSummaryImage = () => {
    setGeneratingImage(true);
    try {
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
      const PAD = 28;
      const RIGHT_MARGIN = 36; // เผื่อขอบขวาเพิ่ม กันตัวเลขชิดขอบเกินไป
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
      {pinRequest && (
        <PinModal
          title={pinRequest.purpose === "save" ? "กรอกรหัสประจำตัวเพื่อบันทึก" : "กรอกรหัสประจำตัวเพื่อลบรายการ"}
          onSubmit={handlePinSubmit}
          onCancel={() => setPinRequest(null)}
        />
      )}

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
                <label style={labelStyle}>💵 จำนวนเงิน (บาท)</label>
                <input type="number" placeholder="0.00" value={form.amount}
                  onChange={(e) => handleFormChange("amount", e.target.value)}
                  style={{ ...inputStyle, fontSize: 20, fontWeight: 700, color: form.type === "income" ? "#22c55e" : "#ef4444" }} />
              </div>
              <div>
                <label style={labelStyle}>🏷️ ประเภท</label>
                <select value={form.category} onChange={(e) => handleFormChange("category", e.target.value)} style={inputStyle}>
                  {(form.type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>📝 หมายเหตุ (ไม่บังคับ)</label>
                <input type="text" placeholder="เช่น ค่าหมู ค่าผัก..." value={form.note}
                  onChange={(e) => handleFormChange("note", e.target.value)} style={inputStyle} />
              </div>
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