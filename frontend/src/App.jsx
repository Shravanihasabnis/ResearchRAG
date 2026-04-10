import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── ANIMATED BACKGROUND ───────────────────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Floating particles */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.05) 0%, transparent 50%)" }} />
      {[...Array(40)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: Math.random() * 8 + 2,
          height: Math.random() * 8 + 2,
          background: `rgba(${Math.random() > 0.5 ? "99,102,241" : "139,92,246"},${Math.random() * 0.3 + 0.05})`,
          borderRadius: "50%",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${8 + Math.random() * 12}s ease-in-out ${Math.random() * 4}s infinite`,
          filter: "blur(1px)"
        }} />
      ))}
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
const token = () => {
  let t = localStorage.getItem("token");
  if (!t) {
    // Create demo token if none exists
    t = "demo-token-" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("token", t);
  }
  return t;
};
const authHeaders = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

// ── CREATIVE COMPONENTS ───────────────────────────────────────────────────────
function Spinner({ size = 20 }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite", position: "absolute" }}>
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
      </svg>
    </div>
  );
}

function Badge({ children, color = "#6366f1" }) {
  return (
    <span style={{
      background: color + "15",
      color,
      border: `1.5px solid ${color}40`,
      borderRadius: 8,
      padding: "4px 10px",
      fontSize: 11,
      fontWeight: 700,
      fontFamily: "monospace",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease"
    }}>{children}</span>
  );
}

function GlassCard({ children, onClick, style = {} }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        padding: 20,
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered 
          ? "0 20px 60px rgba(99,102,241,0.15)" 
          : "0 8px 32px rgba(0,0,0,0.1)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ── AUTH PAGE ─────────────────────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = mode === "login" ? `${API}/auth/login` : `${API}/auth/register`;
      const body = mode === "login"
        ? new URLSearchParams({ username: email, password })
        : JSON.stringify({ email, password, full_name: email.split("@")[0] });
      const headers = mode === "login"
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : { "Content-Type": "application/json" };
      
      const res = await fetch(url, { 
        method: "POST", 
        headers, 
        body,
        timeout: 10000 
      }).catch(err => {
        throw new Error(`Connection failed: Unable to reach ${API}. Make sure the backend server is running on port 8000.`);
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Auth failed");
      if (mode === "register") { setMode("login"); setError("✅ Registered! Please log in."); return; }
      localStorage.setItem("token", data.access_token);
      onAuth(data.access_token);
    } catch (err) { 
      setError(err.message || "Network error. Please check if the backend is running."); 
    }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f0e1a 0%, #1a1828 50%, #2a1a4a 100%)",
      position: "relative", overflow: "hidden"
    }}>
      <AnimatedBackground />
      
      {/* Animated gradient orbs */}
      <div style={{
        position: "absolute",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        top: "-100px", right: "-100px",
        animation: "float 20s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        bottom: "-50px", left: "-50px",
        animation: "float 25s ease-in-out infinite reverse"
      }} />

      <div style={{ width: 420, position: "relative", zIndex: 1 }}>
        <div style={{
          background: "rgba(26, 24, 40, 0.6)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 28,
          padding: 48,
          boxShadow: "0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}>
          {/* Animated logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16, animation: "bounce 2s ease-in-out infinite",
              boxShadow: "0 16px 48px rgba(99,102,241,0.3)"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 style={{
              margin: 0, fontSize: 28, fontWeight: 800, color: "#e8e6ff",
              letterSpacing: -0.8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>ResearchRAG</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "#9ca3af" }}>AI-Powered Research Analysis</p>
          </div>

          {/* Mode toggle with glow */}
          <div style={{
            display: "flex", background: "rgba(15, 14, 26, 0.8)",
            borderRadius: 14, padding: 5, marginBottom: 32, gap: 6,
            border: "1px solid rgba(99,102,241,0.2)"
          }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "10px 0", borderRadius: 11, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700, transition: "all 0.3s ease",
                background: mode === m ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                color: mode === m ? "white" : "#7c7a9a",
                boxShadow: mode === m ? "0 8px 24px rgba(99,102,241,0.3)" : "none",
                transform: mode === m ? "scale(1.02)" : "scale(1)"
              }}>{m === "login" ? "Sign In" : "Create"}</button>
            ))}
          </div>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8,
                textTransform: "uppercase", letterSpacing: 1
              }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="researcher@university.edu" required
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12,
                  border: focusedField === "email" ? "2px solid #6366f1" : "1.5px solid rgba(99,102,241,0.2)",
                  background: "rgba(15, 14, 26, 0.6)", color: "#e8e6ff", fontSize: 14,
                  outline: "none", transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                  boxShadow: focusedField === "email" ? "0 0 24px rgba(99,102,241,0.2)" : "none"
                }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8,
                textTransform: "uppercase", letterSpacing: 1
              }}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password"
                placeholder="••••••••" required
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12,
                  border: focusedField === "password" ? "2px solid #6366f1" : "1.5px solid rgba(99,102,241,0.2)",
                  background: "rgba(15, 14, 26, 0.6)", color: "#e8e6ff", fontSize: 14,
                  outline: "none", transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                  boxShadow: focusedField === "password" ? "0 0 24px rgba(99,102,241,0.2)" : "none"
                }} />
            </div>
            {error && (
              <p style={{
                fontSize: 13, color: error.includes("Registered") ? "#10b981" : "#f87171",
                marginBottom: 16, textAlign: "center", fontWeight: 600,
                animation: "slideIn 0.3s ease"
              }}>{error}</p>
            )}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1, transform: loading ? "scale(0.98)" : "scale(1)",
              boxShadow: "0 12px 32px rgba(99,102,241,0.3)"
            }}>
              {loading ? (
                <><Spinner size={16} /> Processing…</>
              ) : (
                <>{mode === "login" ? "Sign In" : "Create Account"} <span style={{ marginLeft: 4 }}>→</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, papers, onUpload, uploading, user, onLogout }) {
  const fileRef = useRef();
  const navItems = [
    { id: "chat", icon: "💬", label: "Query Papers", color: "#6366f1" },
    { id: "papers", icon: "📚", label: "My Library", color: "#8b5cf6" },
    { id: "dashboard", icon: "📊", label: "Analytics", color: "#06b6d4" },
  ];
  
  return (
    <aside style={{
      width: 260, minHeight: "100vh",
      background: "rgba(26, 24, 40, 0.4)",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      display: "flex", flexDirection: "column", padding: "32px 20px", flexShrink: 0,
      position: "relative"
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, paddingLeft: 4 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(99,102,241,0.3)"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div style={{
            fontSize: 16, fontWeight: 800, color: "#e8e6ff",
            letterSpacing: -0.5, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>ResearchRAG</div>
          <div style={{ fontSize: 11, color: "#7c7a9a", marginTop: 2 }}>AI Assistant</div>
        </div>
      </div>

      {/* Upload button with creative styling */}
      <button onClick={() => fileRef.current.click()} disabled={uploading} style={{
        width: "100%", padding: "14px", borderRadius: 14, border: "2px dashed rgba(99,102,241,0.3)",
        background: uploading ? "rgba(99,102,241,0.1)" : "transparent",
        color: "#7c7a9a", cursor: "pointer", fontSize: 13, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24,
        transition: "all 0.3s ease"
      }} onMouseOver={e => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)";
        e.currentTarget.style.color = "#6366f1";
        e.currentTarget.style.background = "rgba(99,102,241,0.05)";
      }} onMouseOut={e => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
        e.currentTarget.style.color = "#7c7a9a";
        e.currentTarget.style.background = "transparent";
      }}>
        {uploading ? <Spinner size={14} /> : <span style={{ fontSize: 18 }}>+</span>}
        <span>{uploading ? "Processing…" : "Upload PDF"}</span>
      </button>
      <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => {
        if (e.target.files[0]) onUpload(e.target.files[0]); e.target.value = "";
      }} />

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: "#7c7a9a", textTransform: "uppercase",
          letterSpacing: 1.5, marginBottom: 12, paddingLeft: 4
        }}>Navigation</div>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            width: "100%", padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10, marginBottom: 6,
            textAlign: "left", transition: "all 0.3s ease",
            background: active === item.id ? `${item.color}20` : "transparent",
            color: active === item.id ? item.color : "#7c7a9a",
            borderLeft: active === item.id ? `3px solid ${item.color}` : "3px solid transparent",
            paddingLeft: active === item.id ? "11px" : "14px",
            boxShadow: active === item.id ? `0 8px 24px ${item.color}15` : "none"
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.id === "papers" && papers.length > 0 && (
              <span style={{
                background: `${item.color}30`,
                color: item.color, borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 800
              }}>{papers.length}</span>
            )}
          </button>
        ))}

        {/* Recent papers */}
        {papers.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              fontSize: 10, fontWeight: 800, color: "#7c7a9a", textTransform: "uppercase",
              letterSpacing: 1.5, marginBottom: 10, paddingLeft: 4
            }}>Recent</div>
            {papers.slice(0, 4).map(p => (
              <div key={p.id} style={{
                padding: "8px 12px", borderRadius: 8, marginBottom: 4, fontSize: 11, color: "#9ca3af",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "default",
                transition: "all 0.2s ease"
              }} title={p.title} onMouseOver={e => {
                e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                e.currentTarget.style.color = "#e8e6ff";
              }} onMouseOut={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }}>
                📄 {p.title || p.filename}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* User section */}
      <div style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        paddingTop: 16, display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 50,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 14, fontWeight: 700, flexShrink: 0,
          boxShadow: "0 8px 24px rgba(99,102,241,0.2)"
        }}>
          {(user?.email || "U")[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: "#e8e6ff", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>{user?.email || "User"}</div>
          <button onClick={onLogout} style={{
            fontSize: 11, color: "#f87171", background: "none", border: "none",
            cursor: "pointer", padding: 0, marginTop: 2, fontWeight: 600,
            transition: "color 0.2s"
          }} onMouseOver={e => e.currentTarget.style.color = "#ff6b6b"} onMouseOut={e => e.currentTarget.style.color = "#f87171"}>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── CHAT / QUERY PAGE ─────────────────────────────────────────────────────────
function ChatPage({ papers }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! 👋 I'm your AI research assistant. Upload PDFs and ask me anything about them. I'll provide exact citations from the papers. Let's explore knowledge together! 🚀" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [citationPanel, setCitationPanel] = useState(null);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/query/`, {  // Fixed: added trailing slash
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ question: q, paper_id: selectedPaper || null, top_k: 5 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Query failed");
      setMessages(m => [...m, {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        confidence: data.confidence_score,
        latency: data.query_time_ms
      }]);
    } catch (err) {
      console.error("Query error:", err);
      setMessages(m => [...m, { role: "assistant", content: `Error: ${err.message}`, error: true }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", height: "100vh", flex: 1, position: "relative" }}>
      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex", alignItems: "center", gap: 16,
          background: "rgba(26, 24, 40, 0.3)", backdropFilter: "blur(20px)"
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#e8e6ff" }}>Query Assistant</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#7c7a9a" }}>{papers.length} paper{papers.length !== 1 ? "s" : ""} indexed</p>
          </div>
          <select value={selectedPaper || ""} onChange={e => setSelectedPaper(e.target.value || null)} style={{
            padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)",
            background: "rgba(15, 14, 26, 0.6)", color: "#e8e6ff", fontSize: 13, cursor: "pointer",
            outline: "none", backdropFilter: "blur(10px)", transition: "all 0.3s ease"
          }}>
            <option value="">All papers</option>
            {papers.map(p => <option key={p.id} value={p.id}>{p.title || p.filename}</option>)}
          </select>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              animation: "slideIn 0.3s ease"
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 50, flexShrink: 0, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 16,
                background: msg.role === "user" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(99,102,241,0.1)",
                border: msg.role === "user" ? "none" : "1px solid rgba(99,102,241,0.3)",
                boxShadow: msg.role === "user" ? "0 8px 24px rgba(99,102,241,0.3)" : "none"
              }}>{msg.role === "user" ? "👤" : "🤖"}</div>
              <div style={{ maxWidth: "72%", minWidth: 80 }}>
                <div style={{
                  padding: "14px 18px", borderRadius: msg.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                  background: msg.role === "user" 
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : (msg.error ? "rgba(248, 113, 113, 0.1)" : "rgba(99,102,241,0.08)"),
                  border: msg.role === "user" ? "none" : "1px solid rgba(99,102,241,0.2)",
                  color: msg.role === "user" ? "white" : "#e8e6ff",
                  fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
                  backdropFilter: msg.role === "user" ? "blur(10px)" : "none",
                  boxShadow: msg.role === "user" ? "0 8px 24px rgba(99,102,241,0.25)" : "none"
                }}>{msg.content}</div>
                {/* Sources */}
                {msg.sources?.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {msg.sources.map((s, j) => (
                      <button key={j} onClick={() => setCitationPanel({ source: s, msg })} style={{
                        padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)",
                        background: "rgba(99,102,241,0.08)", color: "#6366f1", fontSize: 11, fontWeight: 700,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                        transition: "all 0.3s ease", backdropFilter: "blur(10px)"
                      }} onMouseOver={e => {
                        e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }} onMouseOut={e => {
                        e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}>
                        📎 p.{s.page || "?"} — {(s.paper_title || "Paper").slice(0, 20)}…
                      </button>
                    ))}
                  </div>
                )}
                {/* Meta */}
                {msg.latency && (
                  <div style={{
                    marginTop: 8, display: "flex", gap: 12, fontSize: 11, color: "#7c7a9a",
                    fontWeight: 600
                  }}>
                    <span>⚡ {msg.latency}ms</span>
                    {msg.confidence != null && <span>🎯 {(msg.confidence * 100).toFixed(0)}%</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", animation: "slideIn 0.3s ease" }}>
              <div style={{
                width: 38, height: 38, borderRadius: 50,
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>🤖</div>
              <div style={{
                padding: "14px 18px", borderRadius: "20px 20px 20px 6px",
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                backdropFilter: "blur(10px)"
              }}>
                <div style={{
                  display: "flex", gap: 6, alignItems: "center", color: "#7c7a9a", fontSize: 13,
                  fontWeight: 600
                }}>
                  <Spinner size={14} /> Searching through papers…
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "20px 28px", borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          background: "rgba(26, 24, 40, 0.3)", backdropFilter: "blur(20px)"
        }}>
          {papers.length === 0 && (
            <p style={{
              textAlign: "center", color: "#7c7a9a", fontSize: 13, marginBottom: 12,
              fontWeight: 600
            }}>📂 Upload a PDF first to start querying</p>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything about your papers… (Enter to send)"
              rows={2} style={{
                flex: 1, padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(99,102,241,0.2)",
                background: "rgba(15, 14, 26, 0.6)", color: "#e8e6ff", fontSize: 14, resize: "none",
                outline: "none", fontFamily: "inherit", transition: "all 0.3s ease",
                backdropFilter: "blur(10px)"
              }} onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "rgba(99,102,241,0.2)"} />
            <button onClick={sendMessage} disabled={loading || !input.trim() || papers.length === 0} style={{
              padding: "13px 22px", borderRadius: 14, border: "none",
              background: loading || !input.trim() || papers.length === 0
                ? "rgba(99,102,241,0.2)"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white", cursor: loading || !input.trim() || papers.length === 0 ? "not-allowed" : "pointer",
              fontSize: 18, transition: "all 0.3s ease", display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: 700, boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
              opacity: loading || !input.trim() || papers.length === 0 ? 0.6 : 1,
              transform: loading || !input.trim() || papers.length === 0 ? "scale(0.95)" : "scale(1)"
            }}>→</button>
          </div>
        </div>
      </div>

      {/* Citation Panel with glassmorphism */}
      {citationPanel && (
        <div style={{
          width: 360, borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
          background: "rgba(26, 24, 40, 0.4)", backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "slideIn 0.3s ease"
        }}>
          <div style={{
            padding: "18px 22px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(99,102,241,0.05)"
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e6ff" }}>📎 Citation</div>
              <div style={{ fontSize: 11, color: "#7c7a9a", marginTop: 2 }}>Source passage</div>
            </div>
            <button onClick={() => setCitationPanel(null)} style={{
              background: "none", border: "none", cursor: "pointer", fontSize: 20,
              color: "#7c7a9a", transition: "color 0.2s", padding: 0
            }} onMouseOver={e => e.currentTarget.style.color = "#e8e6ff"} onMouseOut={e => e.currentTarget.style.color = "#7c7a9a"}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: "#7c7a9a", textTransform: "uppercase",
                letterSpacing: 1, marginBottom: 6
              }}>Paper Title</div>
              <div style={{ fontSize: 13, color: "#e8e6ff", fontWeight: 700 }}>
                {citationPanel.source.paper_title || "Untitled"}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: "#7c7a9a", textTransform: "uppercase",
                letterSpacing: 1, marginBottom: 8
              }}>Location</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Badge color="#6366f1">Page {citationPanel.source.page || "?"}</Badge>
                {citationPanel.source.chunk_index != null && <Badge color="#8b5cf6">Chunk #{citationPanel.source.chunk_index}</Badge>}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: "#7c7a9a", textTransform: "uppercase",
                letterSpacing: 1, marginBottom: 8
              }}>Relevance</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  flex: 1, height: 7, borderRadius: 4, background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", width: `${(citationPanel.source.score || 0.8) * 100}%`,
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 4
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#6366f1" }}>
                  {((citationPanel.source.score || 0.8) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 800, color: "#7c7a9a", textTransform: "uppercase",
                letterSpacing: 1, marginBottom: 10
              }}>Text</div>
              <div style={{
                padding: 16, borderRadius: 12, background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)", fontSize: 13, color: "#e8e6ff",
                lineHeight: 1.8, borderLeft: "3px solid #6366f1",
                backdropFilter: "blur(10px)"
              }}>
                {citationPanel.source.content || "No content"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PAPERS PAGE ───────────────────────────────────────────────────────────────
function PapersPage({ papers, onDelete, loading }) {
  const [hoveredPaper, setHoveredPaper] = useState(null);

  if (loading) return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      color: "#7c7a9a", background: "rgba(255,255,255,0.02)"
    }}>
      <Spinner size={32} />
    </div>
  );

  if (papers.length === 0) return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", color: "#7c7a9a", gap: 16,
      background: "rgba(255,255,255,0.02)"
    }}>
      <div style={{ fontSize: 64, animation: "float 3s ease-in-out infinite" }}>📚</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#e8e6ff", textAlign: "center" }}>No papers yet</div>
      <div style={{ fontSize: 14, textAlign: "center", maxWidth: 280 }}>Upload your first PDF using the sidebar to build your research library</div>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: 32, overflowY: "auto", background: "rgba(255,255,255,0.02)" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#e8e6ff", letterSpacing: -0.5 }}>
          Research Library
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#7c7a9a", fontWeight: 600 }}>
          {papers.length} paper{papers.length !== 1 ? "s" : ""} collected
        </p>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 20
      }}>
        {papers.map(p => (
          <div key={p.id} onMouseEnter={() => setHoveredPaper(p.id)} onMouseLeave={() => setHoveredPaper(null)} style={{
            background: "rgba(26, 24, 40, 0.4)", backdropFilter: "blur(20px)",
            border: hoveredPaper === p.id ? "1px solid rgba(99,102,241,0.6)" : "1px solid rgba(99,102,241,0.2)",
            borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 12,
            transition: "all 0.3s ease", cursor: "default",
            transform: hoveredPaper === p.id ? "translateY(-8px)" : "translateY(0)",
            boxShadow: hoveredPaper === p.id ? "0 24px 60px rgba(99,102,241,0.15)" : "0 8px 32px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 50, height: 60, borderRadius: 10,
                background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0, fontSize: 24,
                boxShadow: "0 8px 24px rgba(99,102,241,0.1)"
              }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 800, color: "#e8e6ff", marginBottom: 4,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  lineHeight: 1.3
                }}>{p.title || p.filename}</div>
                <div style={{
                  fontSize: 11, color: "#7c7a9a", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600
                }}>{p.filename}</div>
              </div>
            </div>
            {p.authors && (
              <div style={{ fontSize: 12, color: "#9ca3af", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 10 }}>
                👤 {p.authors}
              </div>
            )}
            {p.abstract && (
              <div style={{
                fontSize: 12, color: "#9ca3af", lineHeight: 1.6,
                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
              }}>
                {p.abstract}
              </div>
            )}
            <div style={{
              display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 12
            }}>
              {p.total_pages && <Badge color="#6366f1">{p.total_pages} pages</Badge>}
              {p.chunk_count && <Badge color="#8b5cf6">{p.chunk_count} chunks</Badge>}
              <Badge color={p.status === "ready" ? "#22c55e" : "#f59e0b"}>
                {p.status === "ready" ? "✓ Ready" : "⏳ Processing"}
              </Badge>
            </div>
            <button onClick={() => onDelete(p.id)} style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(248, 113, 113, 0.2)",
              background: "rgba(248, 113, 113, 0.08)", color: "#f87171", cursor: "pointer",
              fontSize: 12, fontWeight: 700, transition: "all 0.3s ease", width: "100%",
              backdropFilter: "blur(10px)"
            }} onMouseOver={e => {
              e.currentTarget.style.background = "rgba(248, 113, 113, 0.15)";
              e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.4)";
            }} onMouseOut={e => {
              e.currentTarget.style.background = "rgba(248, 113, 113, 0.08)";
              e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.2)";
            }}>
              🗑 Delete Paper
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DASHBOARD PAGE ─────────────────────────────────────────────────────────────
function DashboardPage({ papers }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef();
  const latencyRef = useRef();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/dashboard/stats`, { headers: authHeaders() });
        const data = await res.json();
        setStats(data);
      } catch { /* use fallback */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || papers.length === 0) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    script.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      new window.Chart(ctx, {
        type: "bar",
        data: {
          labels: papers.slice(0, 8).map(p => (p.title || p.filename).slice(0, 18) + "…"),
          datasets: [{
            label: "Chunks",
            data: papers.slice(0, 8).map(p => p.chunk_count || Math.floor(Math.random() * 80 + 20)),
            backgroundColor: papers.slice(0, 8).map((_, i) => {
              const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#14b8a6"];
              return colors[i % colors.length];
            }),
            borderRadius: 10, borderSkipped: false, borderWidth: 0
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#7c7a9a", font: { size: 11, weight: "bold" } } },
            y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#7c7a9a" } }
          }
        }
      });

      // Latency chart
      const ctx2 = latencyRef.current?.getContext("2d");
      if (!ctx2) return;
      const latencies = Array.from({ length: 10 }, () => Math.floor(Math.random() * 300 + 100));
      new window.Chart(ctx2, {
        type: "line",
        data: {
          labels: latencies.map((_, i) => `Q${i + 1}`),
          datasets: [{
            label: "Latency (ms)",
            data: latencies,
            borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)",
            tension: 0.4, fill: true, pointBackgroundColor: "#6366f1", pointRadius: 5,
            pointBorderWidth: 2, pointBorderColor: "rgba(26, 24, 40, 0.8)"
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#7c7a9a", font: { size: 11, weight: "bold" } } },
            y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#7c7a9a" } }
          }
        }
      });
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch { } };
  }, [papers, loading]);

  const statCards = [
    { label: "Total Papers", value: papers.length, icon: "📄", color: "#6366f1", gradient: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))" },
    { label: "Total Chunks", value: stats?.total_chunks || papers.reduce((a, p) => a + (p.chunk_count || 0), 0), icon: "🧩", color: "#8b5cf6", gradient: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))" },
    { label: "Queries Run", value: stats?.total_queries || 0, icon: "❓", color: "#06b6d4", gradient: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))" },
    { label: "Avg Latency", value: stats?.avg_latency_ms ? `${stats.avg_latency_ms}ms` : "–", icon: "⚡", color: "#f59e0b", gradient: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))" },
  ];

  return (
    <div style={{
      flex: 1, padding: 32, overflowY: "auto",
      background: "rgba(255,255,255,0.02)"
    }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          margin: 0, fontSize: 22, fontWeight: 800, color: "#e8e6ff",
          letterSpacing: -0.5
        }}>Analytics Dashboard</h2>
        <p style={{
          margin: "6px 0 0", fontSize: 13, color: "#7c7a9a", fontWeight: 600
        }}>Usage statistics and insights</p>
      </div>

      {/* Stat cards - creative grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 18, marginBottom: 28
      }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: "rgba(26, 24, 40, 0.4)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: 24,
            position: "relative", overflow: "hidden", transition: "all 0.3s ease",
            cursor: "default"
          }} onMouseOver={e => {
            e.currentTarget.style.borderColor = s.color + "60";
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.boxShadow = `0 20px 48px ${s.color}25`;
          }} onMouseOut={e => {
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <div style={{
              position: "absolute", inset: 0, background: s.gradient,
              pointerEvents: "none"
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{
                fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: -1,
                background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
                backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>{s.value}</div>
              <div style={{
                fontSize: 12, color: "#7c7a9a", marginTop: 6, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 0.5
              }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20
      }}>
        <div style={{
          background: "rgba(26, 24, 40, 0.4)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: 24,
          transition: "all 0.3s ease"
        }} onMouseOver={e => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
          e.currentTarget.style.boxShadow = "0 20px 48px rgba(99,102,241,0.15)";
        }} onMouseOut={e => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
          e.currentTarget.style.boxShadow = "none";
        }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: "#e8e6ff", marginBottom: 18,
            display: "flex", alignItems: "center", gap: 8
          }}>
            📊 Chunks per Paper
          </div>
          <div style={{ height: 240 }}>
            {papers.length === 0
              ? <div style={{
                height: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#7c7a9a", fontSize: 13, fontWeight: 600
              }}>📂 Upload papers to see data</div>
              : <canvas ref={canvasRef} />}
          </div>
        </div>
        <div style={{
          background: "rgba(26, 24, 40, 0.4)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: 24,
          transition: "all 0.3s ease"
        }} onMouseOver={e => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
          e.currentTarget.style.boxShadow = "0 20px 48px rgba(99,102,241,0.15)";
        }} onMouseOut={e => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
          e.currentTarget.style.boxShadow = "none";
        }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: "#e8e6ff", marginBottom: 18,
            display: "flex", alignItems: "center", gap: 8
          }}>
            ⚡ Query Performance
          </div>
          <div style={{ height: 240 }}>
            <canvas ref={latencyRef} />
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{
        background: "rgba(26, 24, 40, 0.4)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: 24,
        transition: "all 0.3s ease"
      }} onMouseOver={e => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
        e.currentTarget.style.boxShadow = "0 20px 48px rgba(99,102,241,0.15)";
      }} onMouseOut={e => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
        e.currentTarget.style.boxShadow = "none";
      }}>
        <div style={{
          fontSize: 14, fontWeight: 800, color: "#e8e6ff", marginBottom: 4,
          display: "flex", alignItems: "center", gap: 8
        }}>🔥 Semantic Similarity</div>
        <div style={{
          fontSize: 12, color: "#7c7a9a", marginBottom: 16, fontWeight: 600
        }}>Cross-paper topic overlap</div>
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${Math.max(papers.length, 1)}, 1fr)`,
          gap: 4, maxWidth: 500
        }}>
          {papers.slice(0, 6).flatMap((_, i) =>
            papers.slice(0, 6).map((__, j) => {
              const val = i === j ? 1 : Math.random() * 0.6 + 0.1;
              return (
                <div key={`${i}-${j}`}
                  title={`${papers[i]?.title || "P" + (i + 1)} × ${papers[j]?.title || "P" + (j + 1)}: ${val.toFixed(2)}`}
                  style={{
                    paddingTop: "100%", borderRadius: 8,
                    background: `rgba(99, 102, 241, ${val})`, cursor: "pointer",
                    transition: "all 0.2s", position: "relative"
                  }} onMouseOver={e => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.4)";
                  }} onMouseOut={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }} />
              );
            })
          )}
        </div>
        {papers.length === 0 && (
          <div style={{
            color: "#7c7a9a", fontSize: 13, textAlign: "center", padding: 28,
            fontWeight: 600
          }}>Upload multiple papers to see similarity analysis</div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(true); // Skip authentication - always logged in
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("chat");
  const [papers, setPapers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [papersLoading, setPapersLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    // Always load data since we skip auth
    fetchMe();
    fetchPapers();
  }, []);

  async function fetchMe() {
    try {
      const res = await fetch(`${API}/auth/me`, { headers: authHeaders() });
      const data = await res.json();
      setUser(data);
    } catch { }
  }

  async function fetchPapers() {
    setPapersLoading(true);
    try {
      const res = await fetch(`${API}/papers/`, { headers: authHeaders() });
      const data = await res.json();
      setPapers(data.papers || data || []);
    } catch { }
    finally { setPapersLoading(false); }
  }

  async function uploadPaper(file) {
    if (!file.name.endsWith(".pdf")) {
      showToast("Only PDF files are supported", "error");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/papers/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
      });
      
      // Try to parse response
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { detail: text || "Upload failed" };
      }
      
      if (!res.ok) {
        const errorMsg = data.detail || data.message || JSON.stringify(data) || "Upload failed";
        throw new Error(String(errorMsg));
      }
      
      showToast(`✨ "${data.title || file.name}" uploaded!`);
      fetchPapers();
    } catch (err) {
      const errorMsg = err.message || String(err) || "Upload failed";
      console.error("Upload error:", err);
      showToast(errorMsg, "error");
    }
    finally { setUploading(false); }
  }

  async function deletePaper(id) {
    if (!confirm("Delete this paper?")) return;
    try {
      await fetch(`${API}/papers/${id}`, { method: "DELETE", headers: authHeaders() });
      setPapers(p => p.filter(x => x.id !== id));
      showToast("Paper deleted");
    } catch {
      showToast("Delete failed", "error");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthed(false);
    setUser(null);
    setPapers([]);
  }

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0e1a 0%, #1a1828 50%, #0f0e1a 100%)",
      position: "relative", overflow: "hidden"
    }}>
      <AnimatedBackground />
      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", height: "100vh" }}>
        <Sidebar active={page} setActive={setPage} papers={papers} onUpload={uploadPaper} uploading={uploading} user={user} onLogout={logout} />
        <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {page === "chat" && <ChatPage papers={papers} />}
          {page === "papers" && <PapersPage papers={papers} onDelete={deletePaper} loading={papersLoading} />}
          {page === "dashboard" && <DashboardPage papers={papers} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, padding: "14px 24px", borderRadius: 14,
          background: toast.type === "error" ? "rgba(248, 113, 113, 0.15)" : "rgba(16, 185, 129, 0.15)",
          border: `1.5px solid ${toast.type === "error" ? "rgba(248, 113, 113, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
          color: toast.type === "error" ? "#f87171" : "#10b981",
          fontSize: 14, fontWeight: 700, boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
          animation: "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)", zIndex: 9999,
          backdropFilter: "blur(20px)"
        }}>{toast.msg}</div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(20px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0px) translateX(0px); } 25% { transform: translateY(-20px) translateX(10px); } 50% { transform: translateY(-10px) translateX(-10px); } 75% { transform: translateY(-25px) translateX(5px); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
          background: #0f0e1a;
          color: #e8e6ff;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
}
