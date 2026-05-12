import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const BACKEND_URL = "http://127.0.0.1:8000";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

const s = {
    page: { fontFamily: "'DM Sans', sans-serif", background: "#FFF8ED", minHeight: "100vh" },
    hero: { padding: "2.5rem 2rem", borderBottom: "0.5px solid #FAC775" },
    heroLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: 4 },
    heroTitle: { fontFamily: "'Pacifico', cursive", fontSize: 32, color: "#412402", fontWeight: 400, margin: "0 0 4px" },
    heroSub: { fontSize: 14, color: "#633806", margin: 0 },
    body: { maxWidth: 1100, margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
    metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 },
    metricCard: { background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 12, padding: "1.25rem" },
    metricLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#BA7517", fontWeight: 500, marginBottom: 6 },
    metricValue: { fontSize: 26, fontWeight: 500, color: "#412402", margin: "0 0 4px" },
    metricSub: { fontSize: 12, color: "#633806", margin: 0 },
    chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" },
    chartCard: { background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 12, padding: "1.25rem" },
    chartTitle: { fontSize: 13, fontWeight: 500, color: "#412402", marginBottom: "1rem" },
    tableCard: { background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 12, padding: "1.25rem" },
    tableLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#BA7517", fontWeight: 500, marginBottom: "0.75rem" },
    txRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 0", borderBottom: "0.5px solid #FAC775" },
    txIcon: { width: 32, height: 32, borderRadius: "50%", background: "#FAEEDA", border: "0.5px solid #EF9F27", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#BA7517", flexShrink: 0 },
    txDesc: { fontSize: 13, fontWeight: 500, color: "#412402", margin: "0 0 2px" },
    txDate: { fontSize: 11, color: "#633806", margin: 0 },
    uplabel: { fontSize: 12, color: "#27500A", fontWeight: 500 },
    downlabel: { fontSize: 12, color: "#A32D2D", fontWeight: 500 },
};

const badgeStyle = (status) => ({
    fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 500,
    background: status === "completed" ? "#EAF3DE" : "#FAEEDA",
    color: status === "completed" ? "#27500A" : "#854F0B",
    border: `0.5px solid ${status === "completed" ? "#639922" : "#EF9F27"}`,
});

const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 8, padding: "8px 12px" }}>
            <p style={{ fontSize: 12, color: "#BA7517", margin: "0 0 4px", fontWeight: 500 }}>{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ fontSize: 13, color: "#412402", margin: 0 }}>
                    {p.name === "revenue" ? `$${p.value.toFixed(2)}` : `${p.value} bookings`}
                </p>
            ))}
        </div>
    );
};

export default function Revenue() {
    const { authUser } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONT_URL;
            document.head.appendChild(link);
        }

        fetch(`${BACKEND_URL}/revenue/summary`, {
            headers: {
                "X-User-Id": authUser?.user_id ?? "",
                "X-User-Role": authUser?.role ?? "",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Could not load revenue data.");
                return res.json();
            })
            .then((d) => { setData(d); setLoading(false); })
            .catch((e) => { setError(e.message); setLoading(false); });
    }, []);

    if (loading) {
        return (
            <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#BA7517", fontSize: 15 }}>Loading revenue data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#A32D2D", fontSize: 15 }}>{error}</p>
            </div>
        );
    }

    const momPositive = data.month_over_month >= 0;

    return (
        <div style={s.page}>

            {/* Hero right here */}
            <div style={s.hero}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <p style={s.heroLabel}>Chef dashboard</p>
                    <h1 style={s.heroTitle}>Revenue</h1>
                    <p style={s.heroSub}>Track your earnings, bookings, and performance.</p>
                </div>
            </div>

            <div style={s.body}>
                {/* The Metrics */}
                <div style={s.metricsGrid}>
                    <div style={s.metricCard}>
                        <p style={s.metricLabel}>Total revenue</p>
                        <p style={s.metricValue}>${data.total_revenue.toFixed(2)}</p>
                        <p style={s.metricSub}>All time</p>
                    </div>
                    <div style={s.metricCard}>
                        <p style={s.metricLabel}>This month</p>
                        <p style={s.metricValue}>${data.this_month.toFixed(2)}</p>
                        <p style={momPositive ? s.uplabel : s.downlabel}>
                            {momPositive ? "▲" : "▼"} {Math.abs(data.month_over_month)}% vs last month
                        </p>
                    </div>
                    <div style={s.metricCard}>
                        <p style={s.metricLabel}>Last month</p>
                        <p style={s.metricValue}>${data.last_month.toFixed(2)}</p>
                        <p style={s.metricSub}>Previous period</p>
                    </div>
                    <div style={s.metricCard}>
                        <p style={s.metricLabel}>Total bookings</p>
                        <p style={s.metricValue}>{data.total_bookings}</p>
                        <p style={s.metricSub}>{data.pending_bookings} pending</p>
                    </div>
                </div>

                {/* Charts */}
                {data.monthly_chart.length > 0 && (
                    <div style={s.chartsGrid}>

                        <div style={s.chartCard}>
                            <p style={s.chartTitle}>Revenue over time</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={data.monthly_chart}>
                                    <defs>
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF9F27" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#EF9F27" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#FAC775" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                                    <Tooltip content={customTooltip} />
                                    <Area type="monotone" dataKey="revenue" stroke="#FF5733" strokeWidth={2} fill="url(#revenueGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={s.chartCard}>
                            <p style={s.chartTitle}>Bookings per month</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data.monthly_chart}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#FAC775" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={customTooltip} />
                                    <Bar dataKey="bookings" fill="#F0D813" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                )}

                {/* Recent bookings */}
                {data.recent_bookings.length > 0 && (
                    <div style={s.tableCard}>
                        <p style={s.tableLabel}>Recent bookings</p>
                        {data.recent_bookings.map((booking, i) => (
                            <div
                                key={booking.request_id}
                                style={{ ...s.txRow, ...(i === data.recent_bookings.length - 1 ? { borderBottom: "none" } : {}) }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={s.txIcon}>
                                        <i className="ti ti-tools-kitchen-2" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p style={s.txDesc}>#{booking.request_id} — {booking.summary}</p>
                                        <p style={s.txDate}>{new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={badgeStyle(booking.status)}>
                                        {booking.status === "completed" ? "Completed" : "Active"}
                                    </span>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: "#27500A", margin: 0 }}>
                                        +${booking.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {data.total_bookings === 0 && (
                    <div style={{ textAlign: "center", padding: "3rem 0" }}>
                        <i className="ti ti-chart-bar" style={{ fontSize: 48, color: "#EF9F27" }} aria-hidden="true" />
                        <p style={{ fontSize: 18, fontWeight: 500, color: "#412402", margin: "1rem 0 0.5rem" }}>
                            No revenue yet
                        </p>
                        <p style={{ fontSize: 14, color: "#633806", margin: 0 }}>
                            Once you accept bookings, your earnings will appear here.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
