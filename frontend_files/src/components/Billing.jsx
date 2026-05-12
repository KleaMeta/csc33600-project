import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BACKEND_URL = "http://127.0.0.1:8000";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

const badgeStyle = (status) => ({
    fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 500,
    background: status === "completed" || status === "accepted" ? "#EAF3DE" : "#FAEEDA",
    color: status === "completed" || status === "accepted" ? "#27500A" : "#854F0B",
    border: `0.5px solid ${status === "completed" || status === "accepted" ? "#639922" : "#EF9F27"}`,
});

const s = {
    page: {
        fontFamily: "'DM Sans', sans-serif",
        background: "#FFF8ED",
        minHeight: "100vh",
        paddingTop: "2rem",
        paddingBottom: "2rem",
    },
    container: {
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 1rem",
    },
    title: {
        fontSize: 32,
        fontWeight: 600,
        marginBottom: "2rem",
        color: "#412402",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 600,
        color: "#412402",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    card: {
        background: "#fff",
        border: "0.5px solid #EF9F27",
        borderRadius: 16,
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
    },
    statCard: {
        background: "#FAEEDA",
        borderRadius: 12,
        padding: "1.25rem",
        textAlign: "center",
        border: "0.5px solid #EF9F27",
    },
    statValue: {
        fontSize: 28,
        fontWeight: 700,
        color: "#FF5733",
        marginBottom: "0.25rem",
    },
    statLabel: {
        fontSize: 12,
        color: "#854F0B",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    nextBookingCard: {
        background: "linear-gradient(135deg, #FF5733 0%, #E84620 100%)",
        borderRadius: 16,
        padding: "1.5rem",
        marginBottom: "2rem",
        color: "#fff",
        boxShadow: "0 8px 24px rgba(255, 87, 51, 0.3)",
    },
    chefSpendingItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 0",
        borderBottom: "0.5px solid #EF9F27",
    },
    chefName: {
        fontSize: 16,
        fontWeight: 500,
        color: "#412402",
    },
    chefStats: {
        display: "flex",
        gap: "1rem",
        alignItems: "center",
    },
    chefSpending: {
        fontSize: 16,
        fontWeight: 700,
        color: "#FF5733",
    },
    chefBookings: {
        fontSize: 13,
        color: "#854F0B",
    },
    label: {
        display: "block",
        fontSize: 12,
        fontWeight: 500,
        color: "#854F0B",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        border: "0.5px solid #EF9F27",
        borderRadius: 8,
        fontSize: 14,
        fontFamily: "'DM Sans', sans-serif",
        background: "#fff",
        color: "#412402",
        outline: "none",
        boxSizing: "border-box",
    },
    primaryBtn: {
        width: "100%",
        background: "#FF5733",
        color: "#fff",
        border: "none",
        padding: "12px 24px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        marginTop: "0.5rem",
    },
    primaryBtnDisabled: {
        background: "#ccc",
        cursor: "not-allowed",
    },
    secondaryBtn: {
        background: "#FAEEDA",
        border: "0.5px solid #EF9F27",
        color: "#854F0B",
        padding: "8px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
    },
    divider: {
        border: "none",
        borderTop: "0.5px solid #EF9F27",
        margin: "1.5rem 0",
    },
    error: {
        color: "#A32D2D",
        fontSize: 13,
        marginTop: 8,
        padding: "8px 12px",
        background: "#FFF0F0",
        borderRadius: 6,
        border: "0.5px solid #E07575",
    },
    success: {
        color: "#27500A",
        fontSize: 13,
        marginTop: 8,
        padding: "8px 12px",
        background: "#EAF3DE",
        borderRadius: 6,
        border: "0.5px solid #639922",
    },
    cardPreview: {
        background: "linear-gradient(135deg, #FF5733 0%, #E84620 100%)",
        borderRadius: 12,
        padding: "24px",
        color: "#fff",
        marginBottom: "1.5rem",
        height: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    cardNumber: {
        fontSize: 24,
        fontWeight: 500,
        letterSpacing: "0.2em",
        fontFamily: "monospace",
    },
    cardDetails: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        fontSize: 14,
    },
    transactionRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 0.5fr",
        gap: "1rem",
        padding: "1rem",
        borderBottom: "0.5px solid #EF9F27",
        alignItems: "center",
    },
    transactionRowHover: {
        background: "#FFF8ED",
    },
    transactionAmount: {
        fontWeight: 600,
        color: "#412402",
        fontSize: 15,
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
    },
    badgeSuccess: {
        background: "#D4EDDA",
        color: "#155724",
        border: "0.5px solid #28A745",
    },
    badgePending: {
        background: "#FFF3CD",
        color: "#856404",
        border: "0.5px solid #FFC107",
    },
    fieldRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "1rem",
    },
    pendingRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 0.8fr 0.5fr",
        gap: "1rem",
        padding: "1rem",
        borderBottom: "0.5px solid #EF9F27",
        alignItems: "center",
    },
};

export default function Billing() {
    const { authUser } = useAuth();

    const [cardOnFile, setCardOnFile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [chefSpending, setChefSpending] = useState([]);
    const [nextBooking, setNextBooking] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");
    const [hoveredRow, setHoveredRow] = useState(null);

    const [spendingStats, setSpendingStats] = useState({
        totalSpentThisMonth: 0,
        totalSpentThisYear: 0,
        totalBookings: 0,
        averageSpend: 0,
    });

    const [formData, setFormData] = useState({
        name_on_card: "",
        cc_number: "",
        exp_month: "",
        exp_year: "",
        cvc: "",
    });

    useEffect(() => {
        if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONT_URL;
            document.head.appendChild(link);
        }
    }, []);

    const isChef = authUser?.role === "chef";
    const isCustomer = authUser?.role === "customer";

    useEffect(() => {
        if (!authUser?.user_id) return;

        fetch(`${BACKEND_URL}/payment-info/${authUser.user_id}`, {
            headers: {
                "X-User-Role": authUser.role,
                "X-User-Id": authUser.user_id,
            },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && Object.keys(data).length > 0) setCardOnFile(data);
            })
            .catch(() => { });
    }, [authUser]);

    useEffect(() => {
        if (!authUser?.user_id) return;

        fetch(`${BACKEND_URL}/billing/transactions`, {
            headers: {
                "X-User-Role": authUser.role,
                "X-User-Id": authUser.user_id,
            },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                setTransactions(data);
                calculateSpendingStats(data);
            })
            .catch(() => setTransactions([]));
    }, [authUser]);

    useEffect(() => {
        if (!isCustomer || !authUser?.user_id) return;

        fetch(`${BACKEND_URL}/customers/pending`, {
            headers: {
                "X-User-Role": authUser.role,
                "X-User-Id": authUser.user_id,
            },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then(setPendingRequests)
            .catch(() => setPendingRequests([]));
    }, [authUser, isCustomer]);

    useEffect(() => {
        if (!isCustomer || !authUser?.user_id) return;

        fetch(`${BACKEND_URL}/customers/bookings`, {
            headers: {
                "X-User-Role": authUser.role,
                "X-User-Id": authUser.user_id,
            },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                setBookings(data);
                calculateNextBooking(data);
                calculateChefSpending(data);
            })
            .catch(() => setBookings([]));
    }, [authUser, isCustomer]);

    const calculateSpendingStats = (txns) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthTotal = 0;
        let yearTotal = 0;
        let completedCount = 0;
        let completedTotal = 0;

        txns.forEach(txn => {
            const txnDate = new Date(txn.date);
            const amount = parseFloat(txn.amount) || 0;
            const status = txn.status?.toLowerCase();

            if (status === "accepted" || status === "completed") {
                completedCount++;
                completedTotal += amount;

                if (txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear) {
                    monthTotal += amount;
                }
                if (txnDate.getFullYear() === currentYear) {
                    yearTotal += amount;
                }
            }
        });

        setSpendingStats({
            totalSpentThisMonth: monthTotal,
            totalSpentThisYear: yearTotal,
            totalBookings: completedCount,
            averageSpend: completedCount > 0 ? completedTotal / completedCount : 0,
        });
    };

    const calculateNextBooking = (bookingsList) => {
        const now = new Date();
        const futureBookings = bookingsList.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate > now;
        });

        if (futureBookings.length > 0) {
            const next = futureBookings.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
            setNextBooking(next);
        } else {
            setNextBooking(null);
        }
    };

    const calculateChefSpending = (bookingsList) => {
        const chefMap = new Map();

        bookingsList.forEach(booking => {
            const chefId = booking.chef_id;
            const chefName = booking.chef_name || `Chef ${chefId}`;
            const amount = parseFloat(booking.price) || 0;

            if (chefMap.has(chefId)) {
                const existing = chefMap.get(chefId);
                existing.totalSpent += amount;
                existing.bookingCount++;
            } else {
                chefMap.set(chefId, {
                    chefId,
                    chefName,
                    totalSpent: amount,
                    bookingCount: 1,
                });
            }
        });

        const sortedChefs = Array.from(chefMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);

        setChefSpending(sortedChefs);
    };

    const generateInvoice = (transaction) => {
        const doc = new jsPDF();

        doc.setFontSize(24);
        doc.setTextColor(255, 87, 51);
        doc.text("ChefHire Invoice", 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(65, 36, 2);
        doc.text(`Invoice #: ${transaction.id || "N/A"}`, 20, 40);
        doc.text(`Date: ${formatDate(transaction.date)}`, 20, 50);
        doc.text(`Customer: ${authUser?.name || authUser?.email || "Customer"}`, 20, 60);

        doc.line(20, 70, 190, 70);

        doc.autoTable({
            startY: 80,
            head: [["Detail", "Information"]],
            body: [
                ["Transaction ID", transaction.id || "N/A"],
                ["Date", formatDate(transaction.date)],
                ["Status", transaction.status || "Completed"],
                ["Amount", `$${parseFloat(transaction.amount).toFixed(2)}`],
                ["Payment Method", `**** ${cardOnFile?.cc_number?.slice(-4) || "XXXX"}`],
            ],
            styles: { fontSize: 11, cellPadding: 5 },
            headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255] },
        });

        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(133, 79, 11);
        doc.text("Thank you for using ChefHire!", 20, finalY);
        doc.text("For any questions, please contact support@chefhire.com", 20, finalY + 10);

        doc.save(`invoice_${transaction.id}_${Date.now()}.pdf`);
    };

    const maskCardNumber = (cc_number) => {
        const str = String(cc_number);
        const last4 = str.slice(-4);
        const masked = "•".repeat(Math.min(str.length - 4, 12)) + last4;
        return masked.replace(/(.{4})/g, "$1 ").trim();
    };

    const formatCardNumberWithSpaces = (number) => {
        const digits = number.replace(/\D/g, '');
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    };

    const getTransactionStatus = (transaction) => {
        const status = transaction.status?.toLowerCase();

        if (status === "accepted" || status === "completed") {
            return { label: "Completed", badge: s.badgeSuccess, icon: "✓" };
        } else if (status === "pending") {
            return { label: "Pending", badge: s.badgePending, icon: "⏳" };
        } else {
            return { label: "Cancelled", badge: s.badgePending, icon: "✕" };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return "$0.00";
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    const formatNextBookingDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays < 7) return `in ${diffDays} days`;
        return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    };

    const saveCard = async () => {
        setError("");
        setSaveSuccess(false);

        if (!formData.name_on_card || !formData.cc_number || !formData.exp_month || !formData.exp_year || !formData.cvc) {
            setError("All fields are required.");
            return;
        }

        try {
            setSaving(true);

            const res = await fetch(`${BACKEND_URL}/payment-info`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Role": authUser.role,
                    "X-User-Id": authUser.user_id,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save card");

            const data = await res.json();
            setCardOnFile(data);
            setShowForm(false);
            setSaveSuccess(true);

            setFormData({
                name_on_card: "",
                cc_number: "",
                exp_month: "",
                exp_year: "",
                cvc: "",
            });

            setTimeout(() => setSaveSuccess(false), 4000);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!authUser) {
        return (
            <div style={s.page}>
                <div style={s.container}>
                    <p style={{ color: "#412402", fontSize: 16 }}>Please log in to view billing information.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <div style={s.container}>
                <h1 style={s.title}>Payment History</h1>

                {/* Next Booking Card - Customers only */}
                {isCustomer && nextBooking && (
                    <div style={s.nextBookingCard}>
                        <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>NEXT BOOKING</div>
                        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                            {formatNextBookingDate(nextBooking.date)}
                        </div>
                        <div style={{ fontSize: 16, marginBottom: 4 }}>
                            {nextBooking.chef_name || `Chef ${nextBooking.chef_id}`}
                        </div>
                        <div style={{ fontSize: 14, opacity: 0.9 }}>
                            {formatCurrency(nextBooking.price)} • {nextBooking.summary?.substring(0, 60)}
                        </div>
                    </div>
                )}

                {/* Spending Summary - Customers only */}
                {isCustomer && (
                    <div style={s.card}>
                        <h2 style={s.sectionTitle}>💰 Spending Summary</h2>
                        <div style={s.statsGrid}>
                            <div style={s.statCard}>
                                <div style={s.statValue}>{formatCurrency(spendingStats.totalSpentThisMonth)}</div>
                                <div style={s.statLabel}>Spent This Month</div>
                            </div>
                            <div style={s.statCard}>
                                <div style={s.statValue}>{formatCurrency(spendingStats.totalSpentThisYear)}</div>
                                <div style={s.statLabel}>Spent This Year</div>
                            </div>
                            <div style={s.statCard}>
                                <div style={s.statValue}>{spendingStats.totalBookings}</div>
                                <div style={s.statLabel}>Total Bookings</div>
                            </div>
                            <div style={s.statCard}>
                                <div style={s.statValue}>{formatCurrency(spendingStats.averageSpend)}</div>
                                <div style={s.statLabel}>Average per Booking</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Spending by Chef - Customers only */}
                {isCustomer && chefSpending.length > 0 && (
                    <div style={s.card}>
                        <h2 style={s.sectionTitle}>👨‍🍳 Spending by Chef</h2>
                        {chefSpending.map((chef, idx) => (
                            <div key={chef.chefId || idx} style={s.chefSpendingItem}>
                                <div style={s.chefName}>
                                    {chef.chefName}
                                    {idx === 0 && <span style={{ marginLeft: 8, fontSize: 14 }}>🏆</span>}
                                </div>
                                <div style={s.chefStats}>
                                    <span style={s.chefSpending}>{formatCurrency(chef.totalSpent)}</span>
                                    <span style={s.chefBookings}>{chef.bookingCount} booking{chef.bookingCount !== 1 ? "s" : ""}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upcoming Payments - Customers only */}
                {isCustomer && pendingRequests.length > 0 && (
                    <div style={s.card}>
                        <h2 style={s.sectionTitle}>⏳ Upcoming Payments</h2>
                        {pendingRequests.map((req, idx) => (
                            <div key={req.request_id || idx} style={s.pendingRow}>
                                <div style={{ color: "#633806", fontSize: 13, fontFamily: "monospace" }}>#{req.request_id}</div>
                                <div style={{ color: "#633806", fontSize: 14 }}>{formatDate(req.date)}</div>
                                <div style={s.transactionAmount}>{formatCurrency(req.price)}</div>
                                <div><span style={{ ...s.badge, ...s.badgePending }}>⏳ Pending</span></div>
                            </div>
                        ))}
                        <p style={{ fontSize: 12, color: "#854F0B", marginTop: "1rem", textAlign: "center" }}>
                            These requests will be charged once approved by a chef
                        </p>
                    </div>
                )}

                {/* Payment Method Section */}
                <div style={s.card}>
                    <h2 style={s.sectionTitle}>💳 Payment Method</h2>

                    {cardOnFile && !showForm ? (
                        <>
                            <div style={s.cardPreview}>
                                <div>
                                    <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 16 }}>CARD NUMBER</div>
                                    <div style={s.cardNumber}>{maskCardNumber(cardOnFile.cc_number)}</div>
                                </div>
                                <div style={s.cardDetails}>
                                    <div>
                                        <div style={{ fontSize: 10, opacity: 0.9 }}>CARDHOLDER</div>
                                        <div style={{ fontSize: 14, fontWeight: 500 }}>{cardOnFile.name_on_card?.toUpperCase()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, opacity: 0.9 }}>EXPIRES</div>
                                        <div style={{ fontSize: 14, fontWeight: 500 }}>{cardOnFile.exp_month}/{cardOnFile.exp_year}</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {

                                    setFormData({
                                        name_on_card: cardOnFile.name_on_card || "",
                                        cc_number: cardOnFile.cc_number || "",
                                        exp_month: cardOnFile.exp_month?.toString() || "",
                                        exp_year: cardOnFile.exp_year?.toString() || "",
                                        cvc: "",  // Leave CVC empty for security
                                    });
                                    setShowForm(true);
                                }}
                                style={s.secondaryBtn}
                            >
                                ✏️ Update Card
                            </button>
                        </>
                    ) : !showForm ? (
                        <div style={{ textAlign: "center", padding: "2rem 0" }}>
                            <div style={{ fontSize: 48, marginBottom: "1rem" }}>💳</div>
                            <p style={{ color: "#854F0B", marginBottom: "1rem" }}>No payment method on file</p>
                            <button onClick={() => setShowForm(true)} style={s.primaryBtn}>+ Add Payment Method</button>
                        </div>
                    ) : (
                        <div style={{ marginTop: "1rem" }}>
                            <h3 style={s.sectionTitle}>{cardOnFile ? "Edit Card Details" : "Enter Card Details"}</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {/* Cardholder Name */}
                                <input
                                    placeholder="Cardholder Name"
                                    value={formData.name_on_card}
                                    onChange={(e) => setFormData({ ...formData, name_on_card: e.target.value })}
                                    style={s.input}
                                />

                                {/* Card Number with Automatic Spaces */}
                                <input
                                    placeholder="1234 5678 9012 3456"
                                    value={formatCardNumberWithSpaces(formData.cc_number)}
                                    onChange={(e) => {

                                        const rawValue = e.target.value.replace(/\D/g, '');

                                        const limited = rawValue.slice(0, 16);
                                        setFormData({ ...formData, cc_number: limited });
                                    }}
                                    maxLength={19}
                                    style={s.input}
                                />

                                {/* Expiry and CVC Row */}
                                <div style={s.fieldRow}>
                                    <input
                                        placeholder="MM"
                                        value={formData.exp_month}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 2) val = val.slice(0, 2);
                                            if (parseInt(val) > 12) val = "12";
                                            setFormData({ ...formData, exp_month: val });
                                        }}
                                        maxLength={2}
                                        style={s.input}
                                    />
                                    <input
                                        placeholder="YYYY"
                                        value={formData.exp_year}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 4) val = val.slice(0, 4);
                                            setFormData({ ...formData, exp_year: val });
                                        }}
                                        maxLength={4}
                                        style={s.input}
                                    />
                                    <input
                                        placeholder="CVC"
                                        type="password"
                                        value={formData.cvc}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 4) val = val.slice(0, 4);
                                            setFormData({ ...formData, cvc: val });
                                        }}
                                        maxLength={4}
                                        style={s.input}
                                    />
                                </div>

                                {error && <div style={s.error}>⚠️ {error}</div>}
                                {saveSuccess && <div style={s.success}>✓ Card saved successfully!</div>}

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button onClick={saveCard} disabled={saving} style={{ ...s.primaryBtn, ...(saving ? s.primaryBtnDisabled : {}) }}>
                                        {saving ? "Saving..." : "Save Card"}
                                    </button>
                                    <button onClick={() => { setShowForm(false); setError(""); setSaveSuccess(false); }} style={s.secondaryBtn}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transaction History */}
                <div style={s.card}>
                    <h2 style={s.sectionTitle}>📊 Transaction History</h2>
                    {transactions.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2rem 0" }}>
                            <div style={{ fontSize: 48, marginBottom: "1rem" }}>📭</div>
                            <p style={{ color: "#854F0B" }}>No transactions yet</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ ...s.transactionRow, background: "#FFF8ED", fontWeight: 600 }}>
                                <div>Date</div><div>Status</div><div>Amount</div><div>Invoice</div>
                            </div>
                            {transactions.map((t, idx) => {
                                const statusInfo = getTransactionStatus(t);
                                const isCompleted = statusInfo.label === "Completed";
                                return (
                                    <div
                                        key={t.id || idx}
                                        style={{ ...s.transactionRow, ...(hoveredRow === idx ? s.transactionRowHover : {}) }}
                                        onMouseEnter={() => setHoveredRow(idx)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        <div>{formatDate(t.date)}</div>
                                        <div>
                                            <span style={{ ...s.badge, ...statusInfo.badge }}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </div>
                                        <div style={s.transactionAmount}>{formatCurrency(t.amount)}</div>
                                        <div>
                                            {isCompleted && (
                                                <button onClick={() => generateInvoice(t)} style={s.secondaryBtn}>
                                                    📄 Receipt
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}