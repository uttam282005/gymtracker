import { useState, useEffect } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WORKOUT_TYPES = ["Rest", "Push", "Pull", "Legs", "Upper Body", "Lower Body", "Full Body", "Cardio", "Core", "Custom"];

const defaultSchedule = {
  Mon: { workout: "Push", custom: "" },
  Tue: { workout: "Pull", custom: "" },
  Wed: { workout: "Legs", custom: "" },
  Thu: { workout: "Rest", custom: "" },
  Fri: { workout: "Push", custom: "" },
  Sat: { workout: "Full Body", custom: "" },
  Sun: { workout: "Rest", custom: "" },
};

function getTodayKey() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function getDayAbbr() {
  const d = new Date();
  return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

const INITIAL_LOG = {};

function MonthlyHistory({ log, schedule, todayKey }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    const n = new Date(); n.setDate(1);
    if (viewYear > n.getFullYear() || (viewYear === n.getFullYear() && viewMonth >= n.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
  const totalDays = lastDay.getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const getKey = (day) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${viewYear}-${mm}-${dd}`;
  };

  // Month stats
  const monthKeys = [];
  for (let d = 1; d <= totalDays; d++) monthKeys.push(getKey(d));
  const mGym = monthKeys.filter(k => log[k]?.gym).length;
  const mProtein = monthKeys.filter(k => log[k]?.protein).length;
  const mCreatine = monthKeys.filter(k => log[k]?.creatine).length;
  const mLogged = monthKeys.filter(k => log[k]).length;

  const selectedKey = selectedDay ? getKey(selectedDay) : null;
  const selectedEntry = selectedKey ? log[selectedKey] : null;
  const selectedDate = selectedDay ? new Date(viewYear, viewMonth, selectedDay) : null;
  const selectedDayAbbr = selectedDate ? DAYS[(selectedDate.getDay() + 6) % 7] : null;
  const selectedSched = selectedDayAbbr ? schedule[selectedDayAbbr] : null;

  return (
    <div>
      {/* Month Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={prevMonth} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", width: 36, height: 36, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, letterSpacing: 2 }}>{monthNames[viewMonth].toUpperCase()}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: -2 }}>{viewYear}</div>
        </div>
        <button onClick={nextMonth} style={{ background: isCurrentMonth ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: isCurrentMonth ? "rgba(255,255,255,0.2)" : "#fff", width: 36, height: 36, cursor: isCurrentMonth ? "default" : "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
      </div>

      {/* Month Stats */}
      <div className="card" style={{ padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        {[
          { label: "GYM", val: mGym, total: mLogged || totalDays, color: "#00ff88", icon: "🏋️" },
          { label: "PROTEIN", val: mProtein, total: mLogged || totalDays, color: "#ff8c00", icon: "🥛" },
          { label: "CREATINE", val: mCreatine, total: mLogged || totalDays, color: "#a78bfa", icon: "⚡" },
        ].map(({ label, val, color, icon }) => (
          <div key={label} style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 18 }}>{icon}</div>
            <div style={{ fontSize: 26, color, lineHeight: 1.1 }}>{val}<span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>/{totalDays}</span></div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{label}</div>
            <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(val / totalDays) * 100}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="card" style={{ padding: "16px" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "4px 0", letterSpacing: 1 }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const k = getKey(day);
            const e = log[k];
            const isToday = k === todayKey;
            const isFuture = new Date(k + "T12:00:00") > new Date(todayKey + "T12:00:00");
            const isSelected = selectedDay === day;
            const gymDone = e?.gym;
            const anyDone = e?.gym || e?.protein || e?.creatine;

            return (
              <div
                key={day}
                onClick={() => !isFuture && setSelectedDay(isSelected ? null : day)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isFuture ? "default" : "pointer",
                  background: isSelected ? "rgba(0,255,136,0.2)" : gymDone ? "rgba(0,255,136,0.1)" : anyDone ? "rgba(255,140,0,0.08)" : isToday ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isSelected ? "rgba(0,255,136,0.6)" : isToday ? "rgba(0,255,136,0.3)" : gymDone ? "rgba(0,255,136,0.2)" : anyDone ? "rgba(255,140,0,0.2)" : "rgba(255,255,255,0.05)"}`,
                  transition: "all 0.15s",
                  position: "relative",
                  opacity: isFuture ? 0.25 : 1,
                }}
              >
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  color: isSelected ? "#00ff88" : isToday ? "#00ff88" : gymDone ? "#fff" : anyDone ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"
                }}>{day}</div>
                {anyDone && (
                  <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {e?.gym && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#00ff88" }} />}
                    {e?.protein && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff8c00" }} />}
                    {e?.creatine && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#a78bfa" }} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", justifyContent: "center" }}>
          {[["#00ff88","Gym"], ["#ff8c00","Protein"], ["#a78bfa","Creatine"]].map(([color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="card" style={{ padding: "16px 20px", marginTop: 12, borderColor: "rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.04)", animation: "slideIn 0.2s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 22, letterSpacing: 1 }}>
                {selectedDate?.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                {selectedDate?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
            <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>

          {selectedSched && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
              Scheduled: <span style={{ color: "#fff" }}>{selectedSched.workout === "Custom" ? selectedSched.custom || "Custom" : selectedSched.workout}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: selectedEntry?.note ? 12 : 0 }}>
            {[
              { key: "gym", icon: "🏋️", label: "GYM", color: "#00ff88" },
              { key: "protein", icon: "🥛", label: "PROTEIN", color: "#ff8c00" },
              { key: "creatine", icon: "⚡", label: "CREATINE", color: "#a78bfa" },
            ].map(({ key, icon, label, color }) => (
              <div key={key} style={{ flex: 1, textAlign: "center", padding: "10px 8px", borderRadius: 10, background: selectedEntry?.[key] ? `${color}15` : "rgba(255,255,255,0.04)", border: `1px solid ${selectedEntry?.[key] ? color + "33" : "rgba(255,255,255,0.06)"}` }}>
                <div style={{ fontSize: 20 }}>{icon}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: selectedEntry?.[key] ? color : "rgba(255,255,255,0.25)", marginTop: 4, letterSpacing: 1 }}>{label}</div>
                <div style={{ fontSize: 14, marginTop: 2, color: selectedEntry?.[key] ? color : "rgba(255,255,255,0.2)" }}>{selectedEntry?.[key] ? "✓" : "—"}</div>
              </div>
            ))}
          </div>

          {selectedEntry?.note && (
            <div style={{ marginTop: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px", borderLeft: "2px solid rgba(0,255,136,0.3)" }}>
              "{selectedEntry.note}"
            </div>
          )}

          {!selectedEntry && (
            <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.25)", padding: "8px 0" }}>No data logged for this day</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GymTracker() {
  const [tab, setTab] = useState("today");
  const [schedule, setSchedule] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gym_schedule")) || defaultSchedule; } catch { return defaultSchedule; }
  });
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gym_log")) || INITIAL_LOG; } catch { return INITIAL_LOG; }
  });
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState(schedule);
  const [toast, setToast] = useState(null);

  const todayKey = getTodayKey();
  const todayDay = getDayAbbr();
  const todayEntry = log[todayKey] || { gym: false, protein: false, creatine: false, note: "" };

  useEffect(() => {
    try { localStorage.setItem("gym_schedule", JSON.stringify(schedule)); } catch {}
  }, [schedule]);

  useEffect(() => {
    try { localStorage.setItem("gym_log", JSON.stringify(log)); } catch {}
  }, [log]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const updateToday = (field, value) => {
    const updated = { ...log, [todayKey]: { ...todayEntry, [field]: value } };
    setLog(updated);
    showToast(field === "gym" ? (value ? "💪 Gym logged!" : "Gym unmarked") : field === "protein" ? (value ? "🥛 Protein logged!" : "Protein unmarked") : (value ? "⚡ Creatine logged!" : "Creatine unmarked"));
  };

  const saveSchedule = () => {
    setSchedule(draftSchedule);
    setEditingSchedule(false);
    showToast("✅ Schedule saved!");
  };

  const last7 = getLast7Days();
  const streak = (() => {
    let count = 0;
    for (let i = last7.length - 1; i >= 0; i--) {
      const e = log[last7[i]];
      if (e && e.gym) count++;
      else break;
    }
    return count;
  })();

  const weekGym = last7.filter(d => log[d]?.gym).length;
  const weekProtein = last7.filter(d => log[d]?.protein).length;
  const weekCreatine = last7.filter(d => log[d]?.creatine).length;

  const todayWorkout = schedule[todayDay]?.workout;
  const todayCustom = schedule[todayDay]?.custom;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
        .glow-green { box-shadow: 0 0 20px rgba(0,255,136,0.3); }
        .glow-orange { box-shadow: 0 0 20px rgba(255,140,0,0.3); }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 10px 20px; border-radius: 8px; transition: all 0.2s; }
        .tab-btn.active { background: rgba(0,255,136,0.15); border: 1px solid rgba(0,255,136,0.4); }
        .toggle-btn { width: 64px; height: 34px; border-radius: 17px; border: none; cursor: pointer; position: relative; transition: all 0.3s; }
        .toggle-btn.on { background: linear-gradient(135deg, #00ff88, #00cc6a); }
        .toggle-btn.off { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); }
        .toggle-dot { position: absolute; top: 3px; width: 28px; height: 28px; border-radius: 50%; background: white; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
        .toggle-btn.on .toggle-dot { left: 32px; }
        .toggle-btn.off .toggle-dot { left: 2px; }
        .select-input { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: #fff; padding: 8px 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; cursor: pointer; }
        .select-input:focus { border-color: rgba(0,255,136,0.5); }
        .select-input option { background: #1a1a2e; }
        .text-input { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: #fff; padding: 8px 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; width: 100%; }
        .text-input:focus { border-color: rgba(0,255,136,0.5); }
        .note-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #fff; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; width: 100%; resize: none; }
        .note-input:focus { border-color: rgba(0,255,136,0.3); }
        .save-btn { background: linear-gradient(135deg, #00ff88, #00cc6a); border: none; border-radius: 10px; color: #0a0a0f; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; padding: 12px 32px; cursor: pointer; transition: all 0.2s; }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,255,136,0.4); }
        .cancel-btn { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #aaa; font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 12px 24px; cursor: pointer; }
        .dot-grid { display: flex; gap: 6px; flex-wrap: wrap; }
        .day-dot { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .workout-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; }
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
      `}</style>

      {/* BG Accents */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,0,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(0,255,136,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 12, padding: "12px 24px", fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#00ff88", zIndex: 999, animation: "slideIn 0.3s ease", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 42, letterSpacing: 2, lineHeight: 1, background: "linear-gradient(135deg, #fff 40%, rgba(0,255,136,0.8))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GRIND<br/>TRACKER</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: 1 }}>STAY CONSISTENT. STAY BUILT.</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36, lineHeight: 1 }}>🔥</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{streak} day streak</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4 }}>
          {[["today", "TODAY"], ["history", "HISTORY"], ["schedule", "SCHEDULE"]].map(([key, label]) => (
            <button key={key} className={`tab-btn ${tab === key ? "active" : ""}`} onClick={() => setTab(key)} style={{ flex: 1, fontSize: 14, letterSpacing: 1, color: tab === key ? "#00ff88" : "rgba(255,255,255,0.4)", fontFamily: "'Bebas Neue', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* TODAY TAB */}
        {tab === "today" && (
          <div>
            {/* Date + Workout */}
            <div className="card" style={{ padding: "20px", marginBottom: 16, background: "linear-gradient(135deg, rgba(0,255,136,0.06), rgba(0,255,136,0.02))", borderColor: "rgba(0,255,136,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 28, marginTop: 2 }}>
                    {todayWorkout === "Rest" ? "REST DAY" : todayWorkout === "Custom" ? (todayCustom || "CUSTOM DAY").toUpperCase() : (todayWorkout || "TRAIN").toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: 40 }}>
                  {todayWorkout === "Rest" ? "😴" : todayWorkout === "Legs" ? "🦵" : todayWorkout === "Push" ? "💪" : todayWorkout === "Pull" ? "🏋️" : todayWorkout === "Cardio" ? "🏃" : todayWorkout === "Core" ? "🧘" : "⚡"}
                </div>
              </div>
            </div>

            {/* Trackers */}
            {[
              { key: "gym", label: "GYM SESSION", sub: todayWorkout === "Rest" ? "Rest day — skip if needed" : `Today: ${todayWorkout === "Custom" ? todayCustom || "Custom" : todayWorkout}`, icon: "🏋️", color: "#00ff88" },
              { key: "protein", label: "PROTEIN POWDER", sub: "Post-workout shake", icon: "🥛", color: "#ff8c00" },
              { key: "creatine", label: "CREATINE", sub: "Daily dose — 5g", icon: "⚡", color: "#a78bfa" },
            ].map(({ key, label, sub, icon, color }) => (
              <div key={key} className="card" style={{ padding: "18px 20px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: todayEntry[key] ? `${color}33` : "rgba(255,255,255,0.08)", background: todayEntry[key] ? `${color}08` : "rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 28 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 18, letterSpacing: 1, color: todayEntry[key] ? color : "#fff" }}>{label}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{sub}</div>
                  </div>
                </div>
                <div>
                  <button className={`toggle-btn ${todayEntry[key] ? "on" : "off"}`} onClick={() => updateToday(key, !todayEntry[key])} style={{ background: todayEntry[key] ? `linear-gradient(135deg, ${color}, ${color}cc)` : undefined }}>
                    <div className="toggle-dot" />
                  </button>
                </div>
              </div>
            ))}

            {/* Note */}
            <div className="card" style={{ padding: "16px 20px", marginTop: 16 }}>
              <div style={{ fontSize: 16, letterSpacing: 1, marginBottom: 10, color: "rgba(255,255,255,0.6)" }}>NOTES</div>
              <textarea className="note-input" rows={3} placeholder="How was today's session? PRs, energy levels..." value={todayEntry.note || ""} onChange={e => updateToday("note", e.target.value)} />
            </div>

            {/* Week Summary */}
            <div className="card" style={{ padding: "18px 20px", marginTop: 16 }}>
              <div style={{ fontSize: 16, letterSpacing: 1, marginBottom: 14, color: "rgba(255,255,255,0.6)" }}>THIS WEEK</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[{ label: "GYM", val: weekGym, color: "#00ff88", icon: "🏋️" }, { label: "PROTEIN", val: weekProtein, color: "#ff8c00", icon: "🥛" }, { label: "CREATINE", val: weekCreatine, color: "#a78bfa", icon: "⚡" }].map(({ label, val, color, icon }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22 }}>{icon}</div>
                    <div style={{ fontSize: 32, color, marginTop: 4 }}>{val}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>/7</span></div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <MonthlyHistory log={log} schedule={schedule} todayKey={todayKey} />
        )}

        {/* SCHEDULE TAB */}
        {tab === "schedule" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>WEEKLY PLAN</div>
              {!editingSchedule && (
                <button onClick={() => { setDraftSchedule(schedule); setEditingSchedule(true); }} style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, color: "#00ff88", fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: "6px 14px", cursor: "pointer" }}>
                  Edit
                </button>
              )}
            </div>

            {DAYS.map((day, i) => {
              const isToday = day === todayDay;
              const entry = editingSchedule ? draftSchedule[day] : schedule[day];
              const wt = entry?.workout;
              const wtColor = wt === "Rest" ? "#666" : wt === "Push" ? "#00ff88" : wt === "Pull" ? "#60a5fa" : wt === "Legs" ? "#f97316" : wt === "Cardio" ? "#f43f5e" : wt === "Core" ? "#a78bfa" : wt === "Upper Body" ? "#22d3ee" : wt === "Lower Body" ? "#fb923c" : wt === "Full Body" ? "#facc15" : "#e2e8f0";
              return (
                <div key={day} className="card" style={{ padding: "14px 18px", marginBottom: 8, borderColor: isToday ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.07)", background: isToday ? "rgba(0,255,136,0.04)" : "rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ minWidth: 36, textAlign: "center" }}>
                        <div style={{ fontSize: 18, letterSpacing: 1, color: isToday ? "#00ff88" : "rgba(255,255,255,0.7)" }}>{day.toUpperCase()}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{FULL_DAYS[i].slice(0, 3)}</div>
                      </div>
                      <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.08)" }} />
                      {editingSchedule ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <select className="select-input" value={draftSchedule[day]?.workout || "Rest"} onChange={e => setDraftSchedule(prev => ({ ...prev, [day]: { ...prev[day], workout: e.target.value } }))}>
                            {WORKOUT_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                          {draftSchedule[day]?.workout === "Custom" && (
                            <input className="text-input" style={{ width: 120 }} placeholder="e.g. Bro Split" value={draftSchedule[day]?.custom || ""} onChange={e => setDraftSchedule(prev => ({ ...prev, [day]: { ...prev[day], custom: e.target.value } }))} />
                          )}
                        </div>
                      ) : (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: wtColor, fontWeight: 600 }}>
                          {wt === "Custom" ? entry?.custom || "Custom" : wt}
                        </span>
                      )}
                    </div>
                    {isToday && !editingSchedule && (
                      <div style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#00ff88", background: "rgba(0,255,136,0.1)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(0,255,136,0.2)" }}>TODAY</div>
                    )}
                  </div>
                </div>
              );
            })}

            {editingSchedule && (
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="save-btn" style={{ flex: 1 }} onClick={saveSchedule}>SAVE SCHEDULE</button>
                <button className="cancel-btn" onClick={() => setEditingSchedule(false)}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
