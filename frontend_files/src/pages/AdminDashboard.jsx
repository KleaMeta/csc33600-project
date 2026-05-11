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
  cardButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  cardHint: {
    fontSize: 11,
    color: "#8C5A11",
    marginTop: 8,
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
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    gap: 8,
  },
  detailCloseBtn: {
    border: "0.5px solid #E7B86E",
    borderRadius: 8,
    padding: "6px 10px",
    background: "#FFF8ED",
    color: "#633806",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
  },
  monthActionBtn: {
    border: "0.5px solid #E7B86E",
    borderRadius: 8,
    padding: "6px 10px",
    background: "#FFF8ED",
    color: "#633806",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "0.75rem",
  },
  tableWrap: {
    overflowX: "auto",
    border: "0.5px solid #F5D9A8",
    borderRadius: 10,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
    color: "#412402",
  },
  th: {
    textAlign: "left",
    padding: "8px 10px",
    borderBottom: "0.5px solid #F5D9A8",
    background: "#FFF3E0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px 10px",
    borderBottom: "0.5px solid #F9E4BE",
    whiteSpace: "nowrap",
    verticalAlign: "top",
  },
};

const money = (value) =>
  "$" +
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MONTHLY_TOOLTIP_ORDER = {
  "Developer revenue": 0,
  Commission: 1,
  Sponsorship: 2,
};

export default function AdminDashboard() {
  const { authUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailView, setDetailView] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [commissionRows, setCommissionRows] = useState([]);
  const [sponsorshipRows, setSponsorshipRows] = useState([]);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

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

  const fetchAdminJson = async (path) => {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      headers: {
        "X-User-Role": authUser.role,
        "X-User-Id": authUser.user_id,
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || "Could not load detail data.");
    }

    return response.json();
  };

  const handleOpenCommissionDetails = async () => {
    setDetailView("commission");
    setDetailLoading(true);
    setDetailError("");
    try {
      const payload = await fetchAdminJson("/admin/revenue/commission-transactions");
      setCommissionRows(Array.isArray(payload.transactions) ? payload.transactions : []);
    } catch (fetchError) {
      setDetailError(fetchError.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenSponsorshipDetails = async () => {
    setDetailView("sponsorship");
    setDetailLoading(true);
    setDetailError("");
    try {
      const payload = await fetchAdminJson("/admin/revenue/sponsorship-transactions");
      setSponsorshipRows(Array.isArray(payload.transactions) ? payload.transactions : []);
    } catch (fetchError) {
      setDetailError(fetchError.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenDeveloperDetails = async () => {
    setDetailView("developer");
    setDetailLoading(true);
    setDetailError("");
    try {
      const [commissionPayload, sponsorshipPayload] = await Promise.all([
        fetchAdminJson("/admin/revenue/commission-transactions"),
        fetchAdminJson("/admin/revenue/sponsorship-transactions"),
      ]);
      setCommissionRows(Array.isArray(commissionPayload.transactions) ? commissionPayload.transactions : []);
      setSponsorshipRows(Array.isArray(sponsorshipPayload.transactions) ? sponsorshipPayload.transactions : []);
    } catch (fetchError) {
      setDetailError(fetchError.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenMonthlyDetails = async () => {
    if (!hoveredMonth?.month_key) {
      return;
    }

    setSelectedMonth(hoveredMonth);
    setDetailView("monthly");
    setDetailLoading(true);
    setDetailError("");
    try {
      const [commissionPayload, sponsorshipPayload] = await Promise.all([
        fetchAdminJson("/admin/revenue/commission-transactions"),
        fetchAdminJson("/admin/revenue/sponsorship-transactions"),
      ]);
      setCommissionRows(Array.isArray(commissionPayload.transactions) ? commissionPayload.transactions : []);
      setSponsorshipRows(Array.isArray(sponsorshipPayload.transactions) ? sponsorshipPayload.transactions : []);
    } catch (fetchError) {
      setDetailError(fetchError.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const monthlyChart = useMemo(() => {
    if (!data?.monthly_chart) return [];
    return data.monthly_chart.map((row) => ({
      month: row.month,
      month_key: row.month_key,
      commission: Number(row.commission ?? 0),
      sponsorship: Number(row.sponsorship_revenue ?? 0),
      developer: Number(row.developer_revenue ?? 0),
    }));
  }, [data]);

  const monthlyDeveloperTotal = useMemo(
    () => monthlyChart.reduce((sum, row) => sum + Number(row.developer ?? 0), 0),
    [monthlyChart],
  );

  const monthlyCommissionRows = useMemo(() => {
    if (!selectedMonth?.month_key) return [];
    return commissionRows.filter((row) => String(row.created_at).startsWith(selectedMonth.month_key));
  }, [commissionRows, selectedMonth]);

  const monthlySponsorshipRows = useMemo(() => {
    if (!selectedMonth?.month_key) return [];
    return sponsorshipRows.filter((row) =>
      String(row.purchase_timestamp).startsWith(selectedMonth.month_key),
    );
  }, [sponsorshipRows, selectedMonth]);

  const handleMonthlyChartMouseMove = (state) => {
    const payload = state?.activePayload?.[0]?.payload;
    if (!payload) {
      return;
    }
    setHoveredMonth({
      month: payload.month,
      month_key: payload.month_key,
    });
  };

  const handleMonthlyChartMouseLeave = () => {
    setHoveredMonth(null);
  };

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
              <button type="button" style={styles.cardButton} onClick={handleOpenDeveloperDetails}>
                <p style={styles.metricLbl}>Total developer revenue</p>
                <p style={styles.metricVal}>{money(totals.developer_revenue)}</p>
                <p style={styles.metricSub}>Commission + sponsorship</p>
                <p style={styles.cardHint}>Click to view all rows</p>
              </button>
            </div>
            <div style={styles.card}>
              <button type="button" style={styles.cardButton} onClick={handleOpenCommissionDetails}>
                <p style={styles.metricLbl}>Total commissions</p>
                <p style={styles.metricVal}>{money(totals.commission)}</p>
                <p style={styles.metricSub}>Accepted and completed orders</p>
                <p style={styles.cardHint}>Click to view transaction list</p>
              </button>
            </div>
            <div style={styles.card}>
              <button type="button" style={styles.cardButton} onClick={handleOpenSponsorshipDetails}>
                <p style={styles.metricLbl}>Total sponsorship fees</p>
                <p style={styles.metricVal}>{money(totals.sponsorship_revenue)}</p>
                <p style={styles.metricSub}>{totals.sponsorship_count} sponsorship purchases</p>
                <p style={styles.cardHint}>Click to view all sponsorship purchases</p>
              </button>
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

        {detailView && (
          <div style={styles.chartCard}>
            <div style={styles.detailHeader}>
              <p style={styles.chartTitle}>
                {detailView === "commission" && "Commission Transactions"}
                {detailView === "sponsorship" && "Sponsorship Transactions"}
                {detailView === "developer" && "Developer Revenue Details"}
                {detailView === "monthly" && `Monthly Transactions (${selectedMonth?.month || ""})`}
              </p>
              <button type="button" style={styles.detailCloseBtn} onClick={() => setDetailView(null)}>
                Close
              </button>
            </div>

            {detailLoading && <p style={styles.text}>Loading detail rows...</p>}
            {!detailLoading && detailError && <p style={{ ...styles.text, color: "#A32D2D" }}>{detailError}</p>}

            {!detailLoading && !detailError && detailView === "commission" && (
              <>
                <p style={styles.text}>{commissionRows.length} commission-backed requests</p>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Request ID</th>
                        <th style={styles.th}>Chef</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Commission</th>
                        <th style={styles.th}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionRows.map((row) => (
                        <tr key={row.request_id}>
                          <td style={styles.td}>{row.request_id}</td>
                          <td style={styles.td}>{row.chef_name || row.chef_id}</td>
                          <td style={styles.td}>{row.customer_name || row.customer_id}</td>
                          <td style={styles.td}>{row.status}</td>
                          <td style={styles.td}>{money(row.price)}</td>
                          <td style={styles.td}>{money(row.commission)}</td>
                          <td style={styles.td}>{row.created_at.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {!detailLoading && !detailError && detailView === "sponsorship" && (
              <>
                <p style={styles.text}>{sponsorshipRows.length} sponsorship transactions</p>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sponsorship ID</th>
                        <th style={styles.th}>Chef</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Purchased</th>
                        <th style={styles.th}>Start</th>
                        <th style={styles.th}>End</th>
                        <th style={styles.th}>Payment ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sponsorshipRows.map((row) => (
                        <tr key={row.sponsorship_id}>
                          <td style={styles.td}>{row.sponsorship_id}</td>
                          <td style={styles.td}>{row.chef_name || row.chef_id}</td>
                          <td style={styles.td}>{money(row.price)}</td>
                          <td style={styles.td}>{row.purchase_timestamp.slice(0, 10)}</td>
                          <td style={styles.td}>{row.start_date.slice(0, 10)}</td>
                          <td style={styles.td}>{row.end_date.slice(0, 10)}</td>
                          <td style={styles.td}>{row.payment_info_used_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {!detailLoading && !detailError && detailView === "developer" && (
              <>
                <p style={styles.text}>
                  {commissionRows.length} commission rows + {sponsorshipRows.length} sponsorship rows
                </p>

                <p style={{ ...styles.text, marginTop: "0.75rem", fontWeight: 500 }}>
                  Commission Transactions
                </p>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Request ID</th>
                        <th style={styles.th}>Chef</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Commission</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionRows.map((row) => (
                        <tr key={`dev-req-${row.request_id}`}>
                          <td style={styles.td}>{row.request_id}</td>
                          <td style={styles.td}>{row.chef_name || row.chef_id}</td>
                          <td style={styles.td}>{money(row.price)}</td>
                          <td style={styles.td}>{money(row.commission)}</td>
                          <td style={styles.td}>{row.created_at.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ ...styles.text, marginTop: "0.75rem", fontWeight: 500 }}>
                  Sponsorship Transactions
                </p>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sponsorship ID</th>
                        <th style={styles.th}>Chef</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sponsorshipRows.map((row) => (
                        <tr key={`dev-sponsor-${row.sponsorship_id}`}>
                          <td style={styles.td}>{row.sponsorship_id}</td>
                          <td style={styles.td}>{row.chef_name || row.chef_id}</td>
                          <td style={styles.td}>{money(row.price)}</td>
                          <td style={styles.td}>{row.purchase_timestamp.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {!detailLoading && !detailError && detailView === "monthly" && (
              <>
                <p style={styles.text}>
                  {selectedMonth?.month}: {monthlyCommissionRows.length} commission rows +{" "}
                  {monthlySponsorshipRows.length} sponsorship rows
                </p>

                <p style={{ ...styles.text, marginTop: "0.75rem", fontWeight: 500 }}>
                  Commission Transactions
                </p>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Request ID</th>
                        <th style={styles.th}>Chef</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Commission</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyCommissionRows.map((row) => (
                        <tr key={`monthly-req-${row.request_id}`}>
                          <td style={styles.td}>{row.request_id}</td>
                          <td style={styles.td}>{row.chef_name || row.chef_id}</td>
                          <td style={styles.td}>{money(row.price)}</td>
                          <td style={styles.td}>{money(row.commission)}</td>
                          <td style={styles.td}>{row.created_at.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ ...styles.text, marginTop: "0.75rem", fontWeight: 500 }}>
                  Sponsorship Transactions
                </p>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sponsorship ID</th>
                        <th style={styles.th}>Chef</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySponsorshipRows.map((row) => (
                        <tr key={`monthly-sponsor-${row.sponsorship_id}`}>
                          <td style={styles.td}>{row.sponsorship_id}</td>
                          <td style={styles.td}>{row.chef_name || row.chef_id}</td>
                          <td style={styles.td}>{money(row.price)}</td>
                          <td style={styles.td}>{row.purchase_timestamp.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>Monthly developer revenue breakdown</p>
          <p style={{ ...styles.text, marginBottom: "0.75rem" }}>
            Total in displayed months: <strong>{money(monthlyDeveloperTotal)}</strong>
          </p>
          {hoveredMonth?.month_key && (
            <button type="button" style={styles.monthActionBtn} onClick={handleOpenMonthlyDetails}>
              View transactions for {hoveredMonth.month}
            </button>
          )}
          {monthlyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={monthlyChart}
                onMouseMove={handleMonthlyChartMouseMove}
                onMouseLeave={handleMonthlyChartMouseLeave}
              >
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
                  itemSorter={(item) => MONTHLY_TOOLTIP_ORDER[item.name] ?? 99}
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
