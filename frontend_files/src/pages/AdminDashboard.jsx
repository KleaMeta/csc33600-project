import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/useAuth.js";

const BACKEND_URL = "http://127.0.0.1:8000";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#FFF8ED",
    minHeight: "100vh",
  },
  hero: {
    padding: "2.5rem 2rem",
    borderBottom: "0.5px solid #FAC775",
  },
  heroLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#BA7517",
    fontWeight: 500,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: "'Pacifico', cursive",
    fontSize: 32,
    color: "#412402",
    fontWeight: 400,
    margin: "0 0 4px",
  },
  heroSub: {
    fontSize: 14,
    color: "#633806",
    margin: 0,
  },
  body: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#BA7517",
    fontWeight: 500,
    marginBottom: "0.75rem",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  card: {
    background: "#fff",
    border: "0.5px solid #EF9F27",
    borderRadius: 12,
    padding: "1.25rem",
  },
  metricLbl: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#BA7517",
    fontWeight: 500,
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 24,
    fontWeight: 500,
    color: "#412402",
    margin: "0 0 4px",
  },
  metricSub: {
    fontSize: 12,
    color: "#633806",
    margin: 0,
  },
  chartCard: {
    background: "#fff",
    border: "0.5px solid #EF9F27",
    borderRadius: 12,
    padding: "1.25rem",
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "#412402",
    marginBottom: "0.75rem",
  },
  text: {
    fontSize: 13,
    color: "#633806",
    margin: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: "0.75rem",
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    borderBottom: "0.5px solid #F5D9A8",
    paddingBottom: 6,
  },
};

const money = (value) =>
  "$" +
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AdminDashboard() {
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
  }, []);

  useEffect(() => {
    if (!authUser?.user_id || authUser?.role !== "admin") {
      return;
    }

    setLoading(true);
    fetch(`${BACKEND_URL}/admin/revenue/summary`, {
      headers: {
        "X-User-Role": authUser.role,
        "X-User-Id": authUser.user_id,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.detail || "Could not load developer revenue.");
        }
        return res.json();
      })
      .then((payload) => {
        setData(payload);
        setError("");
      })
      .catch((fetchError) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authUser]);

  const monthlyChart = useMemo(() => {
    if (!data?.monthly_chart) return [];
    return data.monthly_chart.map((row) => ({
      month: row.month,
      commission: Number(row.commission ?? 0),
      sponsorship: Number(row.sponsorship_revenue ?? 0),
      developer: Number(row.developer_revenue ?? 0),
    }));
  }, [data]);

  if (loading) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#BA7517" }}>Loading developer revenue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#A32D2D" }}>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { totals, this_month, mom, top_chefs } = data;

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={styles.heroLabel}>Admin only</p>
          <h1 style={styles.heroTitle}>Developer Revenue</h1>
          <p style={styles.heroSub}>
            Platform earnings from commissions and chef sponsorship fees.
          </p>
        </div>
      </div>

      <div style={styles.body}>
        <div>
          <p style={styles.sectionLabel}>Revenue Summary</p>
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <p style={styles.metricLbl}>Total developer revenue</p>
              <p style={styles.metricVal}>{money(totals.developer_revenue)}</p>
              <p style={styles.metricSub}>Commission + sponsorship</p>
            </div>
            <div style={styles.card}>
              <p style={styles.metricLbl}>Total commissions</p>
              <p style={styles.metricVal}>{money(totals.commission)}</p>
              <p style={styles.metricSub}>Accepted and completed orders</p>
            </div>
            <div style={styles.card}>
              <p style={styles.metricLbl}>Total sponsorship fees</p>
              <p style={styles.metricVal}>{money(totals.sponsorship_revenue)}</p>
              <p style={styles.metricSub}>{totals.sponsorship_count} sponsorship purchases</p>
            </div>
            <div style={styles.card}>
              <p style={styles.metricLbl}>This month developer revenue</p>
              <p style={styles.metricVal}>{money(this_month.developer_revenue)}</p>
              <p style={styles.metricSub}>
                MoM: {mom.developer_revenue >= 0 ? "▲" : "▼"} {Math.abs(mom.developer_revenue)}%
              </p>
            </div>
          </div>
        </div>

        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>Monthly developer revenue breakdown</p>
          {monthlyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyChart}>
                <defs>
                  <linearGradient id="devRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C5A11" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8C5A11" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FAC775" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#854F0B" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => money(value)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "0.5px solid #EF9F27",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="developer" stroke="#8C5A11" fill="url(#devRevenueGrad)" strokeWidth={2} name="Developer revenue" />
                <Area type="monotone" dataKey="commission" stroke="#FF5733" fill="none" strokeWidth={2} name="Commission" />
                <Area type="monotone" dataKey="sponsorship" stroke="#EF9F27" fill="none" strokeWidth={2} name="Sponsorship" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={styles.text}>No monthly data yet.</p>
          )}
        </div>

        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>Top chefs by booking revenue</p>
          {Array.isArray(top_chefs) && top_chefs.length > 0 ? (
            <div style={styles.list}>
              {top_chefs.slice(0, 6).map((chef) => (
                <div key={chef.chef_id} style={styles.listRow}>
                  <span style={styles.text}>{chef.name}</span>
                  <span style={{ ...styles.text, fontWeight: 500 }}>{money(chef.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.text}>No chef performance data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
