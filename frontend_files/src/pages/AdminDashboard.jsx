import { useEffect, useState } from "react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from "recharts";

const BACKEND_URL = "http://127.0.0.1:8000";
const ADMIN_SECRET = "cheffy2026";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

const s = {
    page: { fontFamily: "'DM Sans', sans-serif", background: "#FFF8ED", minHeight: "100vh" },
    hero: { padding: "2.5rem 2rem", borderBottom: "0.5px solid #FAC775" },
    heroLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: 4 },
    heroTitle: { fontFamily: "'Pacifico', cursive", fontSize: 32, color: "#412402", fontWeight: 400, margin: "0 0 4px" },
    heroSub: { fontSize: 14, color: "#633806", margin: 0 },
    body: { maxWidth: 1200, margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
    sectionLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#BA7517", fontWeight: 500, marginBottom: "0.75rem" },
    metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 },
    metric: { background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 12, padding: "1.25rem" },
    metricLbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#BA7517", fontWeight: 500, marginBottom: 6 },
    metricVal: { fontSize: 24, fontWeight: 500, color: "#412402", margin: "0 0 4px" },
    metricSub: { fontSize: 12, color: "#633806", margin: 0 },
    chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" },
    chartCard: { background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 12, padding: "1.25rem" },
    chartTitle: { fontSize: 13, fontWeight: 500, color: "#412402", marginBottom: "0.75rem" },
    perfGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" },
    perfCard: { background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 12, padding: "1.25rem" },
    chefRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid #FAC775" },
    avatar: { width: 32, height: 32, borderRadius: "50%", background: "#FAEEDA", border: "0.5px solid #EF9F27", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#854F0B", flexShrink: 0 },
    barBg: { flex: 1, height: 6, background: "#FFF8ED", borderRadius: 3, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 3, background: "#FF5733" },
    badge: (up) => ({
        fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 20, display: "inline-block", marginTop: 4,
        background: up ? "#EAF3DE" : "#FCEBEB",
        color: up ? "#27500A" : "#791F1F",
    }),
};

const fmt = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 8, padding: "8px 12px" }}>
            <p style={{ fontSize: 12, color: "#BA7517", margin: "0 0 4px", fontWeight: 500 }}>{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ fontSize: 13, color: "#412402", margin: 0 }}>
                    {p.name}: {p.name.toLowerCase().includes("booking") ? p.value : fmt(p.value)}
                </p>
            ))}
        </div>
    );
};

function PasswordGate({ onUnlock }) {
    const [val, setVal] = useState("");
    const [err, setErr] = useState(false);

    const check = () => {
        if (val === ADMIN_SECRET) { onUnlock(); }
        else { setErr(true); }
    };

    return (
        <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", maxWidth: 360, width: "100%", padding: "2rem" }}>
                <i className="ti ti-lock" style={{ fontSize: 40, color: "#BA7517" }} aria-hidden="true" />
                <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 28, color: "#412402", fontWeight: 400, margin: "1rem 0 0.5rem" }}>
                    Revenue dashboard
                </h1>
                <p style={{ fontSize: 14, color: "#633806", marginBottom: "1.5rem" }}>
                    Enter the access code to continue.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        type="password"
                        placeholder="Access code"
                        value={val}
                        onChange={(e) => { setVal(e.target.value); setErr(false); }}
                        onKeyDown={(e) => e.key === "Enter" && check()}
                        style={{ flex: 1, padding: "9px 12px", border: `0.5px solid ${err ? "#E24B4A" : "#EF9F27"}`, borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#412402", outline: "none" }}
                    />
                    <button
                        onClick={check}
                        style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#FF5733", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                    >
                        Enter
                    </button>
                </div>
                {err && <p style={{ color: "#A32D2D", fontSize: 12, marginTop: 8 }}>Incorrect code.</p>}
            </div>
        </div>
    );
}

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${BACKEND_URL}/admin/revenue/summary`, {
            headers: { "X-Admin-Secret": ADMIN_SECRET },
        })
            .then(async (r) => {
                if (!r.ok) {
                    const text = await r.text();
                    throw new Error(`HTTP ${r.status}: ${text}`);
                }
                return r.json();
            })
            .then((d) => { setData(d); setLoading(false); })
            .catch((e) => { setError(e.message); setLoading(false); });
    }, []);

    if (loading) return (
        <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#BA7517" }}>Loading dashboard...</p>
        </div>
    );

    if (error) return (
        <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#A32D2D" }}>{error}</p>
        </div>
    );

    if (!data) return null;

    const { totals, this_month, last_month, mom, monthly_chart, last_period_chart, top_chefs, by_status } = data;

    const maxRev = Math.max(...top_chefs.map((c) => c.revenue), 1);

    const combinedChart = monthly_chart.map((m, i) => ({
        month: m.month,
        "Current revenue": m.revenue,
        "Last period": last_period_chart[i]?.revenue ?? 0,
        "Gross margin": m.commission,
        "Bookings": m.bookings,
        "Completed": m.completed,
        "Pending": m.active,
    }));

    const statusColors = { accepted: "#EF9F27", completed: "#FF5733", pending: "#FAC775" };

    return (
        <div style={s.page}>
            <div style={s.hero}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <p style={s.heroLabel}>Platform admin</p>
                    <h1 style={s.heroTitle}>Revenue dashboard</h1>
                    <p style={s.heroSub}>Platform-wide revenue, commission, and team performance.</p>
                </div>
            </div>

            <div style={s.body}>

                {/* ── Metric cards ── */}
                <div>
                    <p style={s.sectionLabel}>Platform overview</p>
                    <div style={s.metricsGrid}>
                        <div style={s.metric}>
                            <p style={s.metricLbl}>Total revenue</p>
                            <p style={s.metricVal}>{fmt(totals.revenue)}</p>
                            <p style={s.metricSub}>All time</p>
                        </div>
                        <div style={s.metric}>
                            <p style={s.metricLbl}>Total commission</p>
                            <p style={s.metricVal}>{fmt(totals.commission)}</p>
                            <p style={s.metricSub}>15% platform cut</p>
                        </div>
                        <div style={s.metric}>
                            <p style={s.metricLbl}>This month</p>
                            <p style={s.metricVal}>{fmt(this_month.revenue)}</p>
                            <span style={s.badge(mom.revenue >= 0)}>
                                {mom.revenue >= 0 ? "▲" : "▼"} {Math.abs(mom.revenue)}% MoM
                            </span>
                        </div>
                        <div style={s.metric}>
                            <p style={s.metricLbl}>Commission this month</p>
                            <p style={s.metricVal}>{fmt(this_month.commission)}</p>
                            <span style={s.badge(mom.commission >= 0)}>
                                {mom.commission >= 0 ? "▲" : "▼"} {Math.abs(mom.commission)}% MoM
                            </span>
                        </div>
                        <div style={s.metric}>
                            <p style={s.metricLbl}>Total bookings</p>
                            <p style={s.metricVal}>{totals.bookings}</p>
                            <p style={s.metricSub}>{totals.pending} pending</p>
                        </div>
                        <div style={s.metric}>
                            <p style={s.metricLbl}>Active chefs</p>
                            <p style={s.metricVal}>{totals.active_chefs}</p>
                            <p style={s.metricSub}>of {totals.total_chefs} registered</p>
                        </div>
                    </div>
                </div>

                {/* ── Revenue charts ── */}
                {combinedChart.length > 0 && (
                    <>
                        <div style={s.chartsGrid}>
                            <div style={s.chartCard}>
                                <p style={s.chartTitle}>Comparative revenue — current vs last period</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={combinedChart}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#FAC775" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} tickFormatter={(v) => "$" + v.toLocaleString()} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="Current revenue" fill="#FF5733" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Last period" fill="#FAC775" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={s.chartCard}>
                                <p style={s.chartTitle}>Profit growth — commission earned</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={combinedChart}>
                                        <defs>
                                            <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF9F27" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#EF9F27" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#FAC775" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} tickFormatter={(v) => "$" + v.toLocaleString()} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="Gross margin" stroke="#FF5733" strokeWidth={2} fill="url(#commGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div style={s.chartsGrid}>
                            <div style={s.chartCard}>
                                <p style={s.chartTitle}>Bookings volume — completed vs pending</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={combinedChart}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#FAC775" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="Completed" fill="#378ADD" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Pending" fill="#B5D4F4" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={s.chartCard}>
                                <p style={s.chartTitle}>Revenue by booking status</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                                    {by_status.map((s_) => {
                                        const total = by_status.reduce((a, b) => a + b.revenue, 0);
                                        const pct = total > 0 ? Math.round((s_.revenue / total) * 100) : 0;
                                        return (
                                            <div key={s_.status}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                                    <span style={{ color: "#854F0B", textTransform: "capitalize" }}>{s_.status}</span>
                                                    <span style={{ fontWeight: 500, color: "#412402" }}>{fmt(s_.revenue)} ({pct}%)</span>
                                                </div>
                                                <div style={{ height: 8, background: "#FFF8ED", borderRadius: 4, overflow: "hidden" }}>
                                                    <div style={{ width: `${pct}%`, height: "100%", background: statusColors[s_.status] ?? "#EF9F27", borderRadius: 4 }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Team performance ── */}
                <div style={s.perfGrid}>
                    <div style={s.perfCard}>
                        <p style={s.sectionLabel}>Top performing chefs</p>
                        {top_chefs.length === 0 ? (
                            <p style={{ fontSize: 13, color: "#633806" }}>No data yet.</p>
                        ) : (
                            top_chefs.map((chef, i) => (
                                <div key={chef.chef_id} style={{ ...s.chefRow, ...(i === top_chefs.length - 1 ? { borderBottom: "none" } : {}) }}>
                                    <div style={s.avatar}>{chef.name.slice(0, 2).toUpperCase()}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 500, color: "#412402", margin: "0 0 1px" }}>{chef.name}</p>
                                        <p style={{ fontSize: 11, color: "#633806", margin: 0 }}>
                                            {chef.bookings} bookings {chef.avg_rating ? `· ★ ${chef.avg_rating}` : ""}
                                        </p>
                                    </div>
                                    <div style={s.barBg}>
                                        <div style={{ ...s.barFill, width: `${Math.round((chef.revenue / maxRev) * 100)}%` }} />
                                    </div>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: "#412402", minWidth: 72, textAlign: "right" }}>
                                        {fmt(chef.revenue)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={s.perfCard}>
                        <p style={s.sectionLabel}>Monthly targets</p>
                        {[
                            { label: "Revenue target", actual: this_month.revenue, target: last_month.revenue * 1.1 },
                            { label: "Commission target", actual: this_month.commission, target: last_month.commission * 1.1 },
                            { label: "Bookings target", actual: this_month.bookings, target: last_month.bookings * 1.1, count: true },
                        ].map((t) => {
                            const pct = t.target > 0 ? Math.min(Math.round((t.actual / t.target) * 100), 100) : 0;
                            const col = pct >= 90 ? "#639922" : pct >= 70 ? "#BA7517" : "#A32D2D";
                            return (
                                <div key={t.label} style={{ marginBottom: 16 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: "#854F0B" }}>{t.label}</span>
                                        <span style={{ fontWeight: 500, color: col }}>{pct}%</span>
                                    </div>
                                    <div style={{ height: 8, background: "#FFF8ED", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 4 }} />
                                    </div>
                                    <p style={{ fontSize: 11, color: "#633806", marginTop: 3 }}>
                                        {t.count ? `${t.actual} / ${Math.round(t.target)}` : `${fmt(t.actual)} / ${fmt(t.target)}`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [unlocked, setUnlocked] = useState(false);

    useEffect(() => {
        if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONT_URL;
            document.head.appendChild(link);
        }
    }, []);

    return unlocked ? <Dashboard /> : <PasswordGate onUnlock={() => setUnlocked(true)} />;
}
