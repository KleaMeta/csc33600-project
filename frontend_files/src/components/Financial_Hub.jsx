import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BACKEND_URL = "http://127.0.0.1:8000";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

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
    heroLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.4rem" },
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
        transition: "all 0.3s ease",
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
    sponsorshipHistoryCard: {
        background: "#FAEEDA",
        borderRadius: 12,
        padding: "1rem",
        marginTop: "1rem",
        border: "0.5px solid #EF9F27",
    },
    sponsorshipTimeline: {
        position: "relative",
        paddingLeft: "2rem",
        marginTop: "1rem",
    },
    timelineDot: {
        position: "absolute",
        left: -8,
        top: 8,
        width: 12,
        height: 12,
        borderRadius: "50%",
        backgroundColor: "#FF5733",
        border: "2px solid #fff",
        boxShadow: "0 0 0 2px #FF5733",
    },
    timelineLine: {
        position: "absolute",
        left: -2,
        top: 20,
        bottom: 0,
        width: 2,
        backgroundColor: "#EF9F27",
    },
    sponsorshipMetric: {
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        marginRight: "0.5rem",
    },
    metricTotal: {
        background: "#FF5733",
        color: "#fff",
    },
    metricAvg: {
        background: "#639922",
        color: "#fff",
    },
    metricDays: {
        background: "#854F0B",
        color: "#fff",
    },
    filterBar: {
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
    },
    filterChip: {
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 12,
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: "#fff",
        border: "0.5px solid #EF9F27",
        color: "#854F0B",
    },
    filterChipActive: {
        background: "#FF5733",
        color: "#fff",
        border: "0.5px solid #FF5733",
    },
    sponsorshipStats: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
    },
    statBox: {
        background: "#fff",
        borderRadius: 8,
        padding: "0.75rem",
        textAlign: "center",
        border: "0.5px solid #EF9F27",
    },
    statBoxValue: {
        fontSize: 20,
        fontWeight: 700,
        color: "#FF5733",
    },
    statBoxLabel: {
        fontSize: 11,
        color: "#854F0B",
        marginTop: 4,
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
        transition: "all 0.2s ease",
    },
    inputFocus: {
        borderColor: "#FF5733",
        boxShadow: "0 0 0 3px rgba(255, 87, 51, 0.1)",
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
        transition: "all 0.2s ease",
        marginTop: "0.5rem",
    },
    primaryBtnHover: {
        background: "#E84620",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px rgba(255, 87, 51, 0.3)",
    },
    primaryBtnDisabled: {
        background: "#ccc",
        cursor: "not-allowed",
        transform: "none",
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
        transition: "all 0.2s ease",
    },
    secondaryBtnHover: {
        background: "#FBF0E0",
        borderColor: "#FF5733",
        color: "#FF5733",
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
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: "1.5rem",
        height: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 8px 24px rgba(255, 87, 51, 0.3)",
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
        transition: "background 0.2s ease",
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
    badgeFailed: {
        background: "#F8D7DA",
        color: "#721C24",
        border: "0.5px solid #F5C6CB",
    },
    badgeCancelled: {
        background: "#F0F0F0",
        color: "#555555",
        border: "0.5px solid #AAAAAA",
    },
    badgeActive: {
        background: "#D4EDDA",
        color: "#155724",
        border: "0.5px solid #28A745",
    },
    badgeExpired: {
        background: "#F8D7DA",
        color: "#721C24",
        border: "0.5px solid #F5C6CB",
    },
    fieldRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
    },
    pendingRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 0.8fr 0.5fr",
        gap: "1rem",
        padding: "1rem",
        borderBottom: "0.5px solid #EF9F27",
        alignItems: "center",
        transition: "background 0.2s ease",
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
    const [sponsorships, setSponsorships] = useState([]);
    const [activeSponsorship, setActiveSponsorship] = useState(null);
    const [showSponsorshipForm, setShowSponsorshipForm] = useState(false);
    const [sponsorshipAmount, setSponsorshipAmount] = useState("");
    const [sponsorshipDuration, setSponsorshipDuration] = useState("30");
    const [sponsorshipFilter, setSponsorshipFilter] = useState("all");
    const [showSponsorshipStats, setShowSponsorshipStats] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");
    const [hoveredRow, setHoveredRow] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

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

    // ── Load fonts ──
    useEffect(() => {
        if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONT_URL;
            document.head.appendChild(link);
        }
    }, []);

    // ── Load card ──
    useEffect(() => {
        if (!authUser) return;

        fetch(`${BACKEND_URL}/payment-info/${authUser.user_id}`, {
            headers: {
                "X-User-Role": authUser.role,
                "X-User-Id": authUser.user_id,
            },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) setCardOnFile(data);
            })
            .catch(() => { });
    }, [authUser]);

    // ── Load transactions ──
    useEffect(() => {
        if (!authUser) return;

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

    // ── Load pending requests (only for customers) ──
    useEffect(() => {
        if (!authUser || authUser.role !== "customer") return;

        fetch(`${BACKEND_URL}/requests/pending`, {
            headers: {
                "X-User-Role": authUser.role,
                "X-User-Id": authUser.user_id,
            },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then(setPendingRequests)
            .catch(() => setPendingRequests([]));
    }, [authUser]);

    // ── Load bookings (only for customers) ──
    useEffect(() => {
        if (!authUser || authUser.role !== "customer") return;

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
    }, [authUser]);

    // ── Load sponsorship info (only for chefs) ──
    useEffect(() => {
        if (!authUser || authUser.role !== "chef") return;

        fetch(`${BACKEND_URL}/chef/sponsorships`, {
            headers: {
                "X-User-Role": authUser.role,
                "X-User-Id": authUser.user_id,
            },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                setSponsorships(data);
                const now = new Date();
                const active = data.find(s => new Date(s.end_date) > now);
                setActiveSponsorship(active);
            })
            .catch(() => setSponsorships([]));
    }, [authUser]);

    // Calculate sponsorship statistics
    const calculateSponsorshipStats = (sponsorshipsList) => {
        const now = new Date();
        const active = sponsorshipsList.filter(s => new Date(s.end_date) > now);
        const expired = sponsorshipsList.filter(s => new Date(s.end_date) <= now);
        const totalSpent = sponsorshipsList.reduce((sum, s) => sum + parseFloat(s.price), 0);
        const avgSpent = sponsorshipsList.length > 0 ? totalSpent / sponsorshipsList.length : 0;
        const totalDays = sponsorshipsList.reduce((sum, s) => {
            const start = new Date(s.start_date);
            const end = new Date(s.end_date);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);

        return { active: active.length, expired: expired.length, totalSpent, avgSpent, totalDays };
    };

    // Get filtered sponsorships
    const getFilteredSponsorships = () => {
        const now = new Date();
        if (sponsorshipFilter === "active") {
            return sponsorships.filter(s => new Date(s.end_date) > now);
        } else if (sponsorshipFilter === "expired") {
            return sponsorships.filter(s => new Date(s.end_date) <= now);
        }
        return sponsorships;
    };

    // Get days remaining
    const getDaysRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Format duration
    const formatDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (days < 30) return `${days} days`;
        if (days < 365) return `${Math.floor(days / 30)} months`;
        return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
    };

    // Calculate spending statistics
    const calculateSpendingStats = (txns) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthTotal = 0;
        let yearTotal = 0;
        let completedCount = 0;
        let completedTotal = 0;

        txns.forEach(txn => {
            const txnDate = new Date(txn.date || txn.created_at);
            const amount = parseFloat(txn.amount) || 0;
            const status = txn.status?.toLowerCase();

            if (status === "completed" || status === "success" || status === "accepted") {
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

    // Calculate next upcoming booking
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

    // Calculate spending by chef
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

    // Purchase sponsorship
    const purchaseSponsorship = async () => {
        setError("");

        if (!sponsorshipAmount || parseFloat(sponsorshipAmount) <= 0) {
            setError("Please enter a valid sponsorship amount");
            return;
        }

        if (!cardOnFile) {
            setError("Please add a payment method first");
            return;
        }

        try {
            setSaving(true);

            const res = await fetch(`${BACKEND_URL}/chef/sponsorships`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Role": authUser.role,
                    "X-User-Id": authUser.user_id,
                },
                body: JSON.stringify({
                    price: parseFloat(sponsorshipAmount),
                    duration_days: parseInt(sponsorshipDuration),
                    payment_info_id: cardOnFile.payment_id,
                }),
            });

            if (!res.ok) throw new Error("Failed to purchase sponsorship");

            const data = await res.json();
            setSponsorships([data, ...sponsorships]);
            setActiveSponsorship(data);
            setShowSponsorshipForm(false);
            setSponsorshipAmount("");
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 4000);

        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    // Generate invoice PDF
    const generateInvoice = (transaction) => {
        const doc = new jsPDF();

        doc.setFontSize(24);
        doc.setTextColor(255, 87, 51);
        doc.text("ChefHire Invoice", 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(65, 36, 2);
        doc.text(`Invoice #: ${transaction.id || transaction.request_id || "N/A"}`, 20, 40);
        doc.text(`Date: ${formatDate(transaction.date || transaction.created_at)}`, 20, 50);
        doc.text(`Customer: ${authUser?.name || authUser?.email || "Customer"}`, 20, 60);

        doc.line(20, 70, 190, 70);

        doc.autoTable({
            startY: 80,
            head: [["Detail", "Information"]],
            body: [
                ["Transaction ID", transaction.id || transaction.request_id || "N/A"],
                ["Date", formatDate(transaction.date || transaction.created_at)],
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

        doc.save(`invoice_${transaction.id || transaction.request_id}_${Date.now()}.pdf`);
    };

    const maskCardNumber = (cc_number) => {
        const str = String(cc_number);
        const last4 = str.slice(-4);
        const masked = "•".repeat(str.length - 4) + last4;
        return masked.replace(/(.{4})/g, "$1 ").trim();
    };

    const getTransactionStatus = (transaction) => {
        const status = transaction.status?.toLowerCase();

        if (["completed", "success", "accepted"].includes(status)) {
            return { label: "Completed", badge: s.badgeSuccess, icon: "✓" };
        } else if (status === "pending") {
            return { label: "Pending", badge: s.badgePending, icon: "⏳" };
        } else if (["rejected", "cancelled", "canceled"].includes(status)) {
            return { label: "Cancelled", badge: s.badgeCancelled, icon: "✕" };
        } else {
            return { label: "Failed", badge: s.badgeFailed, icon: "✕" };
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

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

    // ── Save card ──
    const saveCard = async () => {
        setError("");
        setSaveSuccess(false);

        if (
            !formData.name_on_card ||
            !formData.cc_number ||
            !formData.exp_month ||
            !formData.exp_year ||
            !formData.cvc
        ) {
            setError("All fields are required.");
            return;
        }

        if (formData.cc_number.length < 12) {
            setError("Card number must be at least 12 digits");
            return;
        }

        if (!/^\d{2}$/.test(formData.exp_month)) {
            setError("Month must be 2 digits (01-12)");
            return;
        }

        if (!/^\d{4}$/.test(formData.exp_year)) {
            setError("Year must be 4 digits (YYYY)");
            return;
        }

        if (formData.cvc.length < 3) {
            setError("CVC must be at least 3 digits");
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
                body: JSON.stringify({
                    ...formData,
                    user_id: authUser.user_id,
                }),
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
                    <p style={{ color: "#412402", fontSize: 16 }}>Please log in.</p>
                </div>
            </div>
        );
    }

    const isChef = authUser.role === "chef";
    const isCustomer = authUser.role === "customer";

    return (
        <>
            <style>
                {`
            input::placeholder {
                color: #999;
                opacity: 1;
            }
        `}
            </style>

            <div style={s.page}>
                <div style={s.container}>
                    <h1 style={s.title}>{isChef ? "Chef Financial Hub" : "Financial Hub"}</h1>

                    {isChef && (
                        <div style={s.card}>
                            <h2 style={s.sectionTitle}>⭐ Chef Sponsorship</h2>

                            {activeSponsorship ? (
                                <div style={{ background: "linear-gradient(135deg, #EAF3DE 0%, #D4EDDA 100%)", borderRadius: 12, padding: "1rem", marginBottom: "1rem", border: "0.5px solid #639922" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                        <strong style={{ color: "#27500A", fontSize: 16 }}>✨ Active Sponsorship</strong>
                                        <span style={{ ...s.badge, ...s.badgeActive }}>Active</span>
                                    </div>
                                    <p style={{ margin: "0.25rem 0" }}>
                                        <strong>Amount:</strong> {formatCurrency(activeSponsorship.price)}
                                    </p>
                                    <p style={{ margin: "0.25rem 0" }}>
                                        <strong>Valid until:</strong> {formatDateTime(activeSponsorship.end_date)}
                                    </p>
                                    <p style={{ margin: "0.25rem 0", fontSize: 13, color: "#3B6D11" }}>
                                        Your profile is boosted in search results!
                                    </p>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                                    <p style={{ color: "#854F0B", marginBottom: "1rem" }}>
                                        No active sponsorship. Boost your visibility in search results!
                                    </p>
                                </div>
                            )}

                            {!showSponsorshipForm ? (
                                <button
                                    onClick={() => setShowSponsorshipForm(true)}
                                    style={s.primaryBtn}
                                    onMouseEnter={(e) => Object.assign(e.target.style, { ...s.primaryBtn, ...s.primaryBtnHover })}
                                    onMouseLeave={(e) => Object.assign(e.target.style, s.primaryBtn)}
                                >
                                    {activeSponsorship ? "Renew Sponsorship" : "Purchase Sponsorship"}
                                </button>
                            ) : (
                                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "0.5px solid #EF9F27" }}>
                                    <h3 style={{ ...s.sectionTitle, marginBottom: "1rem" }}>Sponsorship Details</h3>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={s.label}>Amount (USD)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g., 99.99"
                                            value={sponsorshipAmount}
                                            onChange={(e) => setSponsorshipAmount(e.target.value)}
                                            style={s.input}
                                        />
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={s.label}>Duration (days)</label>
                                        <select
                                            value={sponsorshipDuration}
                                            onChange={(e) => setSponsorshipDuration(e.target.value)}
                                            style={s.input}
                                        >
                                            <option value="30">30 days</option>
                                            <option value="60">60 days</option>
                                            <option value="90">90 days</option>
                                            <option value="180">180 days</option>
                                            <option value="365">1 year</option>
                                        </select>
                                    </div>

                                    {error && <div style={s.error}>⚠️ {error}</div>}
                                    {saveSuccess && <div style={s.success}>✓ Sponsorship purchased successfully!</div>}

                                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                        <button
                                            onClick={purchaseSponsorship}
                                            disabled={saving}
                                            style={{ ...s.primaryBtn, ...(saving ? s.primaryBtnDisabled : {}), marginTop: 0 }}
                                        >
                                            {saving ? "Processing..." : `Pay ${formatCurrency(sponsorshipAmount)}`}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowSponsorshipForm(false);
                                                setError("");
                                            }}
                                            style={s.secondaryBtn}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sponsorships.length > 0 && (
                                <>
                                    <div style={s.divider} />

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                        <h3 style={{ ...s.sectionTitle, fontSize: 16, margin: 0 }}>📜 Sponsorship History</h3>
                                        <button
                                            onClick={() => setShowSponsorshipStats(!showSponsorshipStats)}
                                            style={s.secondaryBtn}
                                            onMouseEnter={(e) => Object.assign(e.target.style, s.secondaryBtnHover)}
                                            onMouseLeave={(e) => Object.assign(e.target.style, s.secondaryBtn)}
                                        >
                                            {showSponsorshipStats ? "Hide Stats 📊" : "Show Stats 📈"}
                                        </button>
                                    </div>

                                    {showSponsorshipStats && (
                                        <div style={s.sponsorshipStats}>
                                            <div style={s.statBox}>
                                                <div style={s.statBoxValue}>{calculateSponsorshipStats(sponsorships).active}</div>
                                                <div style={s.statBoxLabel}>Active</div>
                                            </div>
                                            <div style={s.statBox}>
                                                <div style={s.statBoxValue}>{calculateSponsorshipStats(sponsorships).expired}</div>
                                                <div style={s.statBoxLabel}>Expired</div>
                                            </div>
                                            <div style={s.statBox}>
                                                <div style={s.statBoxValue}>{formatCurrency(calculateSponsorshipStats(sponsorships).totalSpent)}</div>
                                                <div style={s.statBoxLabel}>Total Spent</div>
                                            </div>
                                            <div style={s.statBox}>
                                                <div style={s.statBoxValue}>{formatCurrency(calculateSponsorshipStats(sponsorships).avgSpent)}</div>
                                                <div style={s.statBoxLabel}>Average per Sponsorship</div>
                                            </div>
                                            <div style={s.statBox}>
                                                <div style={s.statBoxValue}>{calculateSponsorshipStats(sponsorships).totalDays}</div>
                                                <div style={s.statBoxLabel}>Total Days Sponsored</div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={s.filterBar}>
                                        <button
                                            onClick={() => setSponsorshipFilter("all")}
                                            style={{
                                                ...s.filterChip,
                                                ...(sponsorshipFilter === "all" ? s.filterChipActive : {})
                                            }}
                                        >
                                            All ({sponsorships.length})
                                        </button>
                                        <button
                                            onClick={() => setSponsorshipFilter("active")}
                                            style={{
                                                ...s.filterChip,
                                                ...(sponsorshipFilter === "active" ? s.filterChipActive : {})
                                            }}
                                        >
                                            Active ({calculateSponsorshipStats(sponsorships).active})
                                        </button>
                                        <button
                                            onClick={() => setSponsorshipFilter("expired")}
                                            style={{
                                                ...s.filterChip,
                                                ...(sponsorshipFilter === "expired" ? s.filterChipActive : {})
                                            }}
                                        >
                                            Expired ({calculateSponsorshipStats(sponsorships).expired})
                                        </button>
                                    </div>

                                    <div style={s.sponsorshipTimeline}>
                                        {getFilteredSponsorships().map((s, idx) => {
                                            const now = new Date();
                                            const isActive = new Date(s.end_date) > now;
                                            const daysRemaining = getDaysRemaining(s.end_date);
                                            const duration = formatDuration(s.start_date, s.end_date);

                                            return (
                                                <div key={s.sponsorship_id || idx} style={{ position: "relative", marginBottom: "1rem" }}>
                                                    <div style={s.timelineDot} />
                                                    {idx < getFilteredSponsorships().length - 1 && <div style={s.timelineLine} />}

                                                    <div style={{
                                                        ...s.sponsorshipHistoryCard,
                                                        background: isActive ? "#EAF3DE" : "#FAEEDA",
                                                        border: isActive ? "0.5px solid #639922" : "0.5px solid #EF9F27",
                                                        marginLeft: "0.5rem",
                                                    }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                                            <div>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                                                                    <span style={{ ...s.badge, ...(isActive ? s.badgeActive : s.badgeExpired) }}>
                                                                        {isActive ? "✅ Active" : "⏰ Expired"}
                                                                    </span>
                                                                    <span style={{ ...s.sponsorshipMetric, ...s.metricTotal }}>
                                                                        💰 {formatCurrency(s.price)}
                                                                    </span>
                                                                    <span style={{ ...s.sponsorshipMetric, ...s.metricAvg }}>
                                                                        📅 {duration}
                                                                    </span>
                                                                    {isActive && (
                                                                        <span style={{ ...s.sponsorshipMetric, ...s.metricDays }}>
                                                                            ⏳ {daysRemaining} days left
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {isActive && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (window.confirm("Are you sure you want to cancel this sponsorship? You will receive a refund for remaining days.")) {
                                                                            try {
                                                                                const res = await fetch(`${BACKEND_URL}/chef/sponsorships/${s.sponsorship_id}`, {
                                                                                    method: "DELETE",
                                                                                    headers: {
                                                                                        "X-User-Role": authUser.role,
                                                                                        "X-User-Id": authUser.user_id,
                                                                                    },
                                                                                });

                                                                                if (res.ok) {
                                                                                    const data = await res.json();
                                                                                    alert(`Sponsorship cancelled! Refund: ${formatCurrency(data.refund_amount)}`);
                                                                                    // Refresh sponsorships
                                                                                    window.location.reload();
                                                                                } else {
                                                                                    alert("Failed to cancel sponsorship");
                                                                                }
                                                                            } catch (err) {
                                                                                alert("Error cancelling sponsorship");
                                                                            }
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        ...s.secondaryBtn,
                                                                        background: "#FCEBEB",
                                                                        border: "0.5px solid #E24B4A",
                                                                        color: "#791F1F",
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = "#F8D7DA";
                                                                        e.target.style.borderColor = "#E24B4A";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = "#FCEBEB";
                                                                        e.target.style.borderColor = "#E24B4A";
                                                                    }}
                                                                >
                                                                    ✕ Cancel
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.75rem" }}>
                                                            <div>
                                                                <div style={{ fontSize: 10, color: "#854F0B", marginBottom: 2 }}>PURCHASED</div>
                                                                <div style={{ fontSize: 13, color: "#412402", fontWeight: 500 }}>
                                                                    {formatDateTime(s.purchase_timestamp)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: 10, color: "#854F0B", marginBottom: 2 }}>VALID FROM</div>
                                                                <div style={{ fontSize: 13, color: "#412402", fontWeight: 500 }}>
                                                                    {formatDate(s.start_date)} → {formatDate(s.end_date)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isActive && (
                                                            <div style={{ marginTop: "0.75rem" }}>
                                                                <div style={{ height: 4, background: "#D4EDDA", borderRadius: 2, overflow: "hidden" }}>
                                                                    <div style={{
                                                                        width: `${((new Date(s.end_date) - new Date()) / (new Date(s.end_date) - new Date(s.start_date))) * 100}%`,
                                                                        height: "100%",
                                                                        background: "#28A745",
                                                                        transition: "width 0.3s ease"
                                                                    }} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {getFilteredSponsorships().length === 0 && (
                                        <div style={{ textAlign: "center", padding: "2rem", color: "#854F0B" }}>
                                            No {sponsorshipFilter} sponsorships found
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

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
                                {nextBooking.summary?.length > 60 ? "..." : ""}
                            </div>
                        </div>
                    )}

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

                    {isCustomer && chefSpending.length > 0 && (
                        <div style={s.card}>
                            <h2 style={s.sectionTitle}>👨‍🍳 Spending by Chef</h2>
                            <div style={{ marginTop: "0.5rem" }}>
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
                        </div>
                    )}

                    {isCustomer && pendingRequests.length > 0 && (
                        <div style={s.card}>
                            <h2 style={s.sectionTitle}>⏳ Upcoming Payments</h2>
                            <div style={{ marginTop: "1rem" }}>
                                <div style={{ ...s.pendingRow, background: "#FFF8ED", fontWeight: 600, color: "#412402", borderBottom: "0.5px solid #EF9F27" }}>
                                    <div>Request ID</div>
                                    <div>Date</div>
                                    <div>Budget</div>
                                    <div>Status</div>
                                </div>
                                {pendingRequests.map((req, idx) => (
                                    <div
                                        key={req.request_id || idx}
                                        style={{
                                            ...s.pendingRow,
                                            ...(hoveredRow === `pending-${idx}` ? s.transactionRowHover : {}),
                                        }}
                                        onMouseEnter={() => setHoveredRow(`pending-${idx}`)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        <div style={{ color: "#633806", fontSize: 13, fontFamily: "monospace" }}>
                                            #{req.request_id}
                                        </div>
                                        <div style={{ color: "#633806", fontSize: 14 }}>
                                            {formatDate(req.date || req.created_at)}
                                        </div>
                                        <div style={s.transactionAmount}>
                                            {formatCurrency(req.price)}
                                        </div>
                                        <div>
                                            <span style={{ ...s.badge, ...s.badgePending }}>
                                                ⏳ Pending Approval
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: 12, color: "#854F0B", marginTop: "1rem", textAlign: "center" }}>
                                These requests will be charged once approved by a chef
                            </p>
                        </div>
                    )}

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
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{cardOnFile.name_on_card.toUpperCase()}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: 10, opacity: 0.9 }}>EXPIRES</div>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>
                                                {cardOnFile.exp_month}/{cardOnFile.exp_year}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                name_on_card: cardOnFile.name_on_card || "",
                                                cc_number: cardOnFile.cc_number || "",
                                                exp_month: cardOnFile.exp_month || "",
                                                exp_year: cardOnFile.exp_year || "",
                                                cvc: cardOnFile.cvc || "",
                                            });
                                            setShowForm(true);
                                        }}
                                        style={{ ...s.secondaryBtn, flex: 1 }}
                                        onMouseEnter={(e) => Object.assign(e.target.style, s.secondaryBtnHover)}
                                        onMouseLeave={(e) => Object.assign(e.target.style, s.secondaryBtn)}
                                    >
                                        ✏️ Update Card
                                    </button>
                                    <button
                                        onClick={() => setCardOnFile(null)}
                                        style={{ ...s.secondaryBtn, flex: 1 }}
                                        onMouseEnter={(e) => Object.assign(e.target.style, s.secondaryBtnHover)}
                                        onMouseLeave={(e) => Object.assign(e.target.style, s.secondaryBtn)}
                                    >
                                        🗑️ Remove
                                    </button>
                                </div>
                            </>
                        ) : !showForm ? (
                            <div style={{ textAlign: "center", padding: "2rem 0" }}>
                                <div style={{ fontSize: 48, marginBottom: "1rem" }}>💳</div>
                                <p style={{ color: "#854F0B", marginBottom: "1rem" }}>No payment method on file</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    style={s.primaryBtn}
                                    onMouseEnter={(e) => Object.assign(e.target.style, { ...s.primaryBtn, ...s.primaryBtnHover })}
                                    onMouseLeave={(e) => Object.assign(e.target.style, s.primaryBtn)}
                                >
                                    + Add Payment Method
                                </button>
                            </div>
                        ) : null}

                        {showForm && (
                            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "0.5px solid #EF9F27" }}>
                                <h3 style={{ ...s.sectionTitle, marginBottom: "1.5rem" }}>Enter Card Details</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div>
                                        <label style={s.label}>Cardholder Name</label>
                                        <input
                                            placeholder="John Doe"
                                            value={formData.name_on_card}
                                            onChange={(e) => setFormData({ ...formData, name_on_card: e.target.value })}
                                            onFocus={() => setFocusedField("name")}
                                            onBlur={() => setFocusedField(null)}
                                            style={{ ...s.input, ...(focusedField === "name" ? s.inputFocus : {}) }}
                                        />
                                    </div>

                                    <div>
                                        <label style={s.label}>Card Number</label>
                                        <input
                                            placeholder="1234 5678 9012 3456"
                                            value={formData.cc_number.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim()}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                setFormData({ ...formData, cc_number: val });
                                            }}
                                            onFocus={() => setFocusedField("cc")}
                                            onBlur={() => setFocusedField(null)}
                                            maxLength={23}
                                            style={{ ...s.input, ...(focusedField === "cc" ? s.inputFocus : {}) }}
                                        />
                                    </div>

                                    <div style={s.fieldRow}>
                                        <div>
                                            <label style={s.label}>Expiration Date</label>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <input
                                                    placeholder="MM"
                                                    value={formData.exp_month}
                                                    onChange={(e) => {
                                                        let val = e.target.value.replace(/\D/g, "");
                                                        if (val.length > 2) return;
                                                        if (parseInt(val) > 12) val = "12";
                                                        setFormData({ ...formData, exp_month: val });
                                                    }}
                                                    maxLength={2}
                                                    style={{ ...s.input, flex: 1 }}
                                                />
                                                <span style={{ alignSelf: "flex-end", marginBottom: 10, color: "#854F0B" }}>/</span>
                                                <input
                                                    placeholder="YYYY"
                                                    value={formData.exp_year}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "");
                                                        setFormData({ ...formData, exp_year: val });
                                                    }}
                                                    maxLength={4}
                                                    style={{ ...s.input, flex: 1 }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={s.label}>Security Code</label>
                                            <input
                                                placeholder="CVC"
                                                value={formData.cvc}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "");
                                                    setFormData({ ...formData, cvc: val });
                                                }}
                                                maxLength={4}
                                                style={s.input}
                                            />
                                        </div>
                                    </div>

                                    {error && <div style={s.error}>⚠️ {error}</div>}
                                    {saveSuccess && <div style={s.success}>✓ Card saved successfully!</div>}

                                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                        <button
                                            onClick={saveCard}
                                            disabled={saving}
                                            style={{ ...s.primaryBtn, ...(saving ? s.primaryBtnDisabled : {}) }}
                                        >
                                            {saving ? "⏳ Saving..." : "✓ Save Card"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowForm(false);
                                                setError("");
                                                setSaveSuccess(false);
                                            }}
                                            style={s.secondaryBtn}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={s.card}>
                        <h2 style={s.sectionTitle}>📊 Transaction History</h2>

                        {transactions.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem 0" }}>
                                <div style={{ fontSize: 48, marginBottom: "1rem" }}>📭</div>
                                <p style={{ color: "#854F0B" }}>No transactions yet</p>
                            </div>
                        ) : (
                            <div style={{ marginTop: "1rem" }}>
                                <div style={{ ...s.transactionRow, background: "#FFF8ED", fontWeight: 600, color: "#412402" }}>
                                    <div>Date</div>
                                    <div>Status</div>
                                    <div>Amount</div>
                                    <div>Invoice</div>
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
                                            <div>{formatDate(t.date || t.created_at)}</div>
                                            <div>
                                                <span style={{ ...s.badge, ...statusInfo.badge }}>
                                                    {statusInfo.icon} {statusInfo.label}
                                                </span>
                                            </div>
                                            <div style={s.transactionAmount}>{formatCurrency(t.amount)}</div>
                                            <div>
                                                {isCompleted && (
                                                    <button
                                                        onClick={() => generateInvoice(t)}
                                                        style={s.secondaryBtn}
                                                        onMouseEnter={(e) => Object.assign(e.target.style, s.secondaryBtnHover)}
                                                        onMouseLeave={(e) => Object.assign(e.target.style, s.secondaryBtn)}
                                                    >
                                                        📄 Receipt
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}