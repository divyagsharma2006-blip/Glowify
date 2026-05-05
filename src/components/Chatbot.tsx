import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "bot" | "user";
interface Msg { id: number; role: Role; text: string; }
interface Q { key: string; text: string; options: string[]; when?: (a: Rec) => boolean; }
type Rec = Record<string, string>;

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS: Q[] = [
  { key: "gender", text: "First, let me get to know you. What's your gender?", options: ["Male", "Female"] },
  { key: "age", text: "What's your age group?", options: ["Below 13", "13–18", "18–25", "25–35", "35+"] },
  { key: "sleep", text: "How many hours do you sleep on average?", options: ["Less than 5", "5–7", "7–9", "More than 9"] },
  { key: "water", text: "How much water do you drink per day?", options: ["Less than 1L", "1–2L", "2–3L", "More than 3L"] },
  { key: "stress", text: "How would you describe your daily stress level?", options: ["Low", "Medium", "High"] },
  { key: "period", text: "Is your menstrual cycle regular?", options: ["Regular", "Irregular"], when: (a) => a.gender === "Female" },
  { key: "pcos", text: "Have you been diagnosed with PCOS?", options: ["Yes", "No", "Not Sure"], when: (a) => a.gender === "Female" },
  { key: "thyroid", text: "Do you have any thyroid issues?", options: ["Yes – Hypo", "Yes – Hyper", "No"], when: (a) => a.gender === "Female" },
  { key: "hormonal_acne", text: "Do you notice acne timing with your cycle?", options: ["Before period", "During period", "After period", "Not related"], when: (a) => a.gender === "Female" },
  { key: "hair_fall", text: "Are you experiencing hair fall issues?", options: ["Yes", "No", "Sometimes"], when: (a) => a.gender === "Female" },
  { key: "shaving", text: "How often do you shave?", options: ["Daily", "Every 2–3 days", "Weekly", "Rarely"], when: (a) => a.gender === "Male" },
  { key: "beard_acne", text: "Do you experience acne in your beard area?", options: ["Yes", "No", "Sometimes"], when: (a) => a.gender === "Male" },
  { key: "pollution", text: "How much pollution exposure do you face daily?", options: ["Low", "Moderate", "High"], when: (a) => a.gender === "Male" },
  { key: "allergy", text: "Do you have any known skin or product allergies?", options: ["Yes", "No", "Not Sure"], when: (a) => a.gender === "Male" },
];

const getQs = (a: Rec) => QUESTIONS.filter(q => !q.when || q.when(a));

// ─── Typing dots ──────────────────────────────────────────────────────────────
const Dots = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 14px" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "inline-block", animation: "dotBounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

// ─── Blob background ──────────────────────────────────────────────────────────
const Blobs = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <div style={{ position: "absolute", width: 580, height: 480, borderRadius: "60% 40% 55% 45%/50% 60% 40% 50%", background: "radial-gradient(circle at 40% 40%,#5FB3A2,#74C7B8)", opacity: 0.2, top: "-8%", left: "-6%", animation: "blob1 14s ease-in-out infinite" }} />
    <div style={{ position: "absolute", width: 640, height: 540, borderRadius: "45% 55% 40% 60%/60% 45% 55% 40%", background: "radial-gradient(circle at 60% 55%,#6C8EBF,#89A9D4)", opacity: 0.16, bottom: "-10%", right: "-8%", animation: "blob2 18s ease-in-out infinite" }} />
    <div style={{ position: "absolute", width: 400, height: 340, borderRadius: "50% 50% 45% 55%/55% 45% 60% 40%", background: "radial-gradient(circle at 50% 50%,#74C7B8,#A8DDD6)", opacity: 0.13, top: "12%", right: "6%", animation: "blob3 22s ease-in-out infinite" }} />
    {[...Array(8)].map((_, i) => (
      <div key={i} style={{ position: "absolute", width: 6 + (i % 4) * 3, height: 6 + (i % 4) * 3, borderRadius: "50%", background: i % 2 === 0 ? "#5FB3A2" : "#6C8EBF", opacity: 0.08 + (i % 3) * 0.04, left: `${10 + i * 11}%`, top: `${15 + ((i * 27) % 70)}%`, animation: `particle ${8 + (i % 5) * 2}s ease-in-out infinite`, animationDelay: `${i * 0.7}s` }} />
    ))}
  </div>
);

interface ChatbotProps {
  onContinueWithoutScan?: () => void;
  onContinueScan?: () => void;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const Chatbot: React.FC<ChatbotProps> = ({ onContinueWithoutScan, onContinueScan }) => {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Rec>({});
  const [qIdx, setQIdx] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [savingStatus, setSavingStatus] = useState("");
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const booted = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.id) {
        setAuthenticatedUserId(data.user.id);
      }
    };

    loadUser();
  }, []);

  const push = useCallback((role: Role, text: string) => {
    nextId.current++;
    const id = nextId.current;
    setMsgs(p => [...p, { id, role, text }]);
  }, []);

  // Show a question immediately
  const showQ = useCallback((idx: number, ans: Rec) => {
    const qs = getQs(ans);
    setTyping(false);

    if (idx >= qs.length) {
      push("bot", "Thanks! ✨ Your skincare profile is ready. Let's get glowing!");
      setDone(true);
    } else {
      push("bot", qs[idx].text);
      setQIdx(idx);
    }
  }, [push]);

  // Boot once — StrictMode safe
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    setTyping(false);
    push("bot", "Hi! 👋 I'm your Glowify skin assistant. I'll ask a few quick questions to personalize your skincare routine.");
    showQ(0, {});

    return () => {
      // no timers to clean up
    };
  }, [push, showQ]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  // Save to Supabase when quiz is done
  useEffect(() => {
    const saveToSupabase = async () => {
      if (!done || Object.keys(answers).length === 0 || savedRef.current) return;

      if (!authenticatedUserId) {
        setSavingStatus("⚠️ Log in to save your profile.");
        return;
      }

      savedRef.current = true;
      setSavingStatus("💾 Saving your profile...");
      console.log("Attempting to save to Supabase with answers:", answers);

      try {

        // Map all answer keys to exact Supabase column names
        const payload: any = {
          user_id: authenticatedUserId,
          gender: answers.gender || null,
          age_group: answers.age || null,
          sleep_hours: answers.sleep || null,
          water_intake: answers.water || null,
          stress_level: answers.stress || null,
          thyroid: answers.thyroid || null,
          shaving_frequency: answers.shaving || null,
          beard_acne: answers.beard_acne || null,
          sweat_acne: answers.gym_acne || null,
          pollution_exposure: answers.pollution || null,
          skin_allergies: answers.allergy || null,
          hair_fall: answers.hair_fall || null,
          menstrual_cycle: answers.period || null,
          periodacne_timing: answers.hormonal_acne || null,
          pcos_diagnosis: answers.pcos || null,
        };

        console.log("Payload being sent:", payload);

        const updateResult: any = await supabase
          .from("user_profiles")
          .update(payload)
          .eq("user_id", authenticatedUserId);

        let data: any = updateResult.data;
        let error: any = updateResult.error;

        if (!error && (!data || (Array.isArray(data) && data.length === 0))) {
          const insertResult = await supabase
            .from("user_profiles")
            .insert([payload]);
          data = insertResult.data;
          error = insertResult.error;
        }

        if (error) {
          console.error("❌ Supabase save error:", error);
          setSavingStatus(`❌ Error: ${error.message}`);
        } else {
          console.log("✅ Data saved to Supabase successfully!", data);
          setSavingStatus("✅ Profile saved successfully!");
          localStorage.setItem("glowifyUserProfile", JSON.stringify(answers));
        }
      } catch (err: any) {
        console.error("❌ Exception saving to Supabase:", err);
        setSavingStatus(`❌ Error: ${err?.message || "Unknown error"}`);
      }
    };

    saveToSupabase();
  }, [done, answers, authenticatedUserId]);

  const pick = (opt: string) => {
    const qs = getQs(answers);
    const cur = qs[qIdx];
    if (!cur) return;
    push("user", opt);
    const next = { ...answers, [cur.key]: opt };
    setAnswers(next);
    localStorage.setItem("glowifyUserProfile", JSON.stringify(next));
    setQIdx(-1);
    showQ(qIdx + 1, next);
  };

  const curQ = qIdx >= 0 ? getQs(answers)[qIdx] : null;
  const total = getQs({ ...answers, gender: answers.gender ?? "Female" }).length;
  const stepNum = qIdx + 1;
  const pct = total > 0 ? (stepNum / total) * 100 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        html, body, #root { margin:0; padding:0; width:100%; height:100%; }

        @keyframes dotBounce {
          0%,80%,100% { transform:translateY(0); }
          40%          { transform:translateY(-7px); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn {
          0%  { opacity:0; transform:scale(0.85); }
          70% { transform:scale(1.04); }
          100%{ opacity:1; transform:scale(1); }
        }
        @keyframes blob1 {
          0%,100%{ transform:translate(0,0) rotate(0deg) scale(1); }
          33%    { transform:translate(40px,30px) rotate(8deg) scale(1.06); }
          66%    { transform:translate(-20px,50px) rotate(-5deg) scale(0.96); }
        }
        @keyframes blob2 {
          0%,100%{ transform:translate(0,0) rotate(0deg) scale(1); }
          40%    { transform:translate(-50px,-30px) rotate(-10deg) scale(1.08); }
          70%    { transform:translate(30px,-50px) rotate(6deg) scale(0.94); }
        }
        @keyframes blob3 {
          0%,100%{ transform:translate(0,0) scale(1); }
          50%    { transform:translate(-30px,40px) scale(1.1); }
        }
        @keyframes particle {
          0%,100%{ transform:translateY(0) translateX(0); opacity:.1; }
          50%    { transform:translateY(-18px) translateX(8px); opacity:.2; }
        }

        .g-page {
          position: fixed;
          inset: 0;
          overflow: hidden;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg,#EAF4F2 0%,#FAFAF7 55%,#ffffff 100%);
          font-family: 'DM Sans','Segoe UI',sans-serif;
          padding: 0;
          margin: 0;
        }

        .g-card {
          position: relative;
          z-index: 10;
          width: min(520px, calc(100vw - 32px));
          height: min(88vh, 780px);
          min-height: 600px;
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 32px 80px rgba(95,179,162,0.18),
            0 8px 32px rgba(108,142,191,0.13),
            0 0 0 1px rgba(255,255,255,0.6);
        }

        .g-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          background: linear-gradient(95deg,#5FB3A2 0%,#6C8EBF 100%);
        }
        .g-hav {
          width:46px; height:46px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.22); border:2px solid rgba(255,255,255,0.45);
          color:#fff; font-weight:800; font-size:19px; font-family:Georgia,serif;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        }
        .g-htitle { color:#fff; font-weight:700; font-size:16px; line-height:1.25; font-family:Georgia,serif; display:block; }
        .g-hsub   { color:rgba(255,255,255,0.78); font-size:12px; margin-top:2px; font-weight:400; display:block; }
        .g-step   { margin-left:auto; flex-shrink:0; text-align:right; background:rgba(255,255,255,0.15); padding:6px 10px; border-radius:10px; }
        .g-slbl   { color:rgba(255,255,255,0.65); font-size:10px; display:block; letter-spacing:.05em; text-transform:uppercase; }
        .g-snum   { color:#fff; font-weight:700; font-size:15px; line-height:1.1; }

        .g-pbar   { flex-shrink:0; height:3px; background:rgba(255,255,255,0.2); }
        .g-pfill  { height:100%; background:linear-gradient(90deg,rgba(255,255,255,0.9),rgba(255,255,255,0.5)); transition:width .5s ease; }

        .g-chat {
          flex: 1;
          overflow-y: auto;
          padding: 18px 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 0;
          scroll-behavior: smooth;
        }
        .g-chat::-webkit-scrollbar { width:4px; }
        .g-chat::-webkit-scrollbar-track { background:transparent; }
        .g-chat::-webkit-scrollbar-thumb { background:rgba(95,179,162,0.25); border-radius:4px; }

        .g-bot-row  { display:flex; align-items:flex-end; gap:8px; animation:slideUp .32s cubic-bezier(.22,1,.36,1) both; }
        .g-usr-row  { display:flex; justify-content:flex-end; align-items:flex-end; gap:8px; animation:slideUp .32s cubic-bezier(.22,1,.36,1) both; }

        .g-av {
          width:30px; height:30px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:700; color:#fff; margin-bottom:2px;
        }
        .g-bot-av { background:linear-gradient(135deg,#5FB3A2,#6C8EBF); box-shadow:0 2px 8px rgba(95,179,162,.3); }
        .g-usr-av { background:linear-gradient(135deg,#6C8EBF,#89A9D4); box-shadow:0 2px 8px rgba(108,142,191,.25); border:1.5px solid rgba(255,255,255,0.5); }

        .g-bot-bub {
          max-width: 76%;
          padding: 11px 15px;
          border-radius: 18px 18px 18px 4px;
          background: linear-gradient(135deg,#5FB3A2 0%,#6BB8AB 100%);
          color: #fff;
          font-size: 14px;
          line-height: 1.6;
          box-shadow: 0 3px 14px rgba(95,179,162,.22);
        }
        .g-usr-bub {
          max-width: 72%;
          padding: 11px 15px;
          border-radius: 18px 18px 4px 18px;
          background: #ffffff;
          color: #2E2E2E;
          font-size: 14px;
          line-height: 1.6;
          border: 1.5px solid #5FB3A2;
          box-shadow: 0 2px 10px rgba(95,179,162,.1);
        }

        .g-footer {
          flex-shrink: 0;
          padding: 14px 16px 20px;
          border-top: 1px solid rgba(95,179,162,.1);
          background: rgba(255,255,255,0.5);
        }

        .g-opts { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }

        .g-opt {
          padding: 10px 18px;
          border-radius: 12px;
          border: 1.5px solid #5FB3A2;
          background: rgba(255,255,255,0.95);
          color: #2E2E2E;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all .18s ease;
          animation: popIn .28s cubic-bezier(.22,1,.36,1) both;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          box-shadow: 0 2px 8px rgba(95,179,162,.08);
        }
        .g-opt:hover {
          background: linear-gradient(135deg,#5FB3A2,#6C8EBF);
          color: #fff;
          border-color: transparent;
          transform: scale(1.04) translateY(-1px);
          box-shadow: 0 4px 16px rgba(95,179,162,.3);
        }

        .g-end { display:flex; flex-direction:column; gap:10px; animation:fadeIn .5s ease both; }

        .g-btn-p {
          width:100%; padding:14px; border-radius:14px; border:none;
          background: linear-gradient(90deg,#5FB3A2 0%,#6C8EBF 100%);
          color:#fff; font-weight:700; font-size:14px; cursor:pointer;
          box-shadow:0 6px 20px rgba(95,179,162,.35); letter-spacing:.02em;
          font-family:'DM Sans','Segoe UI',sans-serif;
          transition:transform .15s, box-shadow .15s;
        }
        .g-btn-p:hover { transform:scale(1.02) translateY(-1px); box-shadow:0 10px 28px rgba(95,179,162,.45); }

        .g-btn-s {
          width:100%; padding:14px; border-radius:14px;
          border:1.5px solid #5FB3A2; background:#fff;
          color:#5FB3A2; font-weight:600; font-size:14px; cursor:pointer;
          letter-spacing:.02em; font-family:'DM Sans','Segoe UI',sans-serif;
          transition:all .18s ease;
        }
        .g-btn-s:hover { background:linear-gradient(90deg,#5FB3A2,#74C7B8); color:#fff; border-color:transparent; }

        .g-idle { text-align:center; color:#ccc; font-size:12px; padding:4px 0; }
      `}</style>

      {/* Full-screen page — fills entire viewport */}
      <div className="g-page">
        <Blobs />

        {/* Chat card */}
        <div className="g-card">

          {/* Header */}
          <div className="g-header">
            <div className="g-hav">G</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="g-htitle">Glowify AI Skin Assistant</span>
              <span className="g-hsub">Personalized skincare powered by AI</span>
            </div>
            {!done && qIdx >= 0 && (
              <div className="g-step">
                <span className="g-slbl">Step</span>
                <span className="g-snum">{stepNum}/{total}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {!done && qIdx >= 0 && (
            <div className="g-pbar">
              <div className="g-pfill" style={{ width: `${pct}%` }} />
            </div>
          )}

          {/* Messages */}
          <div className="g-chat">
            {msgs.map(m =>
              m.role === "bot" ? (
                <div key={m.id} className="g-bot-row">
                  <div className="g-av g-bot-av">G</div>
                  <div className="g-bot-bub">{m.text}</div>
                </div>
              ) : (
                <div key={m.id} className="g-usr-row">
                  <div className="g-usr-bub">{m.text}</div>
                  <div className="g-av g-usr-av">U</div>
                </div>
              )
            )}

            {typing && (
              <div className="g-bot-row" style={{ animation: "fadeIn .25s ease both" }}>
                <div className="g-av g-bot-av">G</div>
                <div className="g-bot-bub" style={{ padding: 0 }}><Dots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div className="g-footer">
            {!done && curQ && (
              <div className="g-opts">
                {curQ.options.map((opt, i) => (
                  <button
                    key={opt}
                    className="g-opt"
                    onClick={() => pick(opt)}
                    style={{ animationDelay: `${i * 0.055}s` }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {done && (
              <div className="g-end">
                {savingStatus && (
                  <p style={{ textAlign: "center", fontSize: "12px", color: savingStatus.includes("❌") ? "#d32f2f" : "#5FB3A2", margin: "8px 0" }}>
                    {savingStatus}
                  </p>
                )}
                <button className="g-btn-p" onClick={() => onContinueScan?.()}>🔍 Scan Face & Continue</button>
                <button className="g-btn-s" onClick={() => onContinueWithoutScan?.()}>Continue Without Scan</button>
              </div>
            )}

            {!done && !curQ && !typing && (
              <p className="g-idle">Thinking…</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Chatbot;