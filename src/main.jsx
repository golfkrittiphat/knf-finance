cat > /mnt/user-data/outputs/main.jsx << 'ENDOFFILE'
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactDOM from "react-dom/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIES_INCOME = ["ร้านอาหาร", "ตกปลา", "ผลไม้", "อื่นๆ"];
const CATEGORIES_EXPENSE = ["วัตถุดิบ", "ค่าแรง", "ค่าเช่า", "ค่าน้ำ/ไฟ", "ค่าแก๊ส", "แพ็กเกจจิ้ง", "ค่าขนส่ง", "ค่าการตลาด", "อื่นๆ"];
const SHOP_NAME = "ร้านโคกหนองนาฟิชชิ่งท่าเรือ";

const formatMoney = (n) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const todayStr = () => new Date().toISOString().slice(0, 10);

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
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

  const handleSubmit = async () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      showToast("กรุณากรอกจำนวนเงินที่ถูกต้อง", "#ef4444");
      return;
    }
    setSaving(true);
    const rec = {
      id: genId(),
      type: form.type,
      date: form.date,
      amount: Number(form.amount),
      category: form.category,
      note: form.note,
      created_at: Date.now(),
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

  const askDelete = (rec) => {
    const label = `${rec.type === "income" ? "รายรับ" : "รายจ่าย"} ฿${formatMoney(rec.amount)} (${rec.category}) วันที่ ${rec.date}`;
    setConfirmDelete({ id: rec.id, label });
  };

  const doDelete = async () => {
    const { error } = await supabase.from("records").delete().eq("id", confirmDelete.id);
    setConfirmDelete(null);
    if (!error) showToast("ลบรายการแล้ว", "#f59e0b");
    else showToast("ลบไม่สำเร็จ", "#ef4444");
  };

  // Stats
  const monthRecords = records.filter((r) => r.date.startsWith(filterMonth));
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
      {confirmDelete && (
        <ConfirmModal
          msg={`ต้องการลบ${confirmDelete.label} ใช่หรือไม่?`}
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
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
            {records.map((r) => (
              <div key={r.id} style={{
                background: "#1e293b", borderRadius: 12, padding: "13px 14px", marginBottom: 8,
                border: `1px solid ${r.type === "income" ? "#166534" : "#7f1d1d"}`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ fontSize: 22 }}>{r.type === "income" ? "💚" : "❤️"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: r.type === "income" ? "#22c55e" : "#ef4444", fontSize: 16 }}>
                      {r.type === "income" ? "+" : "-"}{formatMoney(r.amount)} ฿
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    {r.category}{r.note ? ` · ${r.note}` : ""}
                  </div>
                </div>
                <button onClick={() => askDelete(r)} style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  cursor: "pointer", color: "#ef4444", fontSize: 16,
                  padding: "6px 10px", borderRadius: 8,
                }} title="ลบรายการ">🗑️</button>
              </div>
            ))}
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
ENDOFFILE
