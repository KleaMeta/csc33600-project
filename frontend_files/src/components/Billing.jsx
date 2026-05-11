import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.js";

const BACKEND_URL = "http://127.0.0.1:8000";

const pageStyle = {
    fontFamily: "'DM Sans', sans-serif",
    background: "#FFF8ED",
    minHeight: "100vh",
};

const container = {
    maxWidth: 800,
    margin: "0 auto",
    padding: "2rem",
};

const card = {
    background: "#fff",
    border: "1px solid #EF9F27",
    borderRadius: 12,
    padding: "1rem",
    marginBottom: "1rem",
};

const title = {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: "1rem",
    color: "#412402",
};

const input = {
    width: "100%",
    padding: "9px 12px",
    border: "0.5px solid #EF9F27",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    background: "#fff",
    color: "#412402",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 10,
};

const button = {
    width: "100%",
    background: "#FF5733",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
};

const secondaryBtn = {
    background: "#FAEEDA",
    border: "1px solid #EF9F27",
    color: "#854F0B",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
};

export default function Billing() {
    const { authUser } = useAuth();

    const [cardOnFile, setCardOnFile] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name_on_card: "",
        cc_number: "",
        exp_month: "",
        exp_year: "",
        cvc: "",
    });

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
            .then(setTransactions)
            .catch(() => setTransactions([]));
    }, [authUser]);

    // ── Save card ──
    const saveCard = async () => {
        setError("");

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
            setError("Card number too short");
            return;
        }

        if (!/^\d{2}$/.test(formData.exp_month)) {
            setError("Invalid month");
            return;
        }

        if (!/^\d{4}$/.test(formData.exp_year)) {
            setError("Invalid year");
            return;
        }

        if (formData.cvc.length < 3) {
            setError("Invalid CVC");
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

            setFormData({
                name_on_card: "",
                cc_number: "",
                exp_month: "",
                exp_year: "",
                cvc: "",
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!authUser) {
        return <div style={container}>Please log in.</div>;
    }

    return (
        <div style={pageStyle}>
            <div style={container}>
                <h1 style={title}>Billing</h1>

                {/* ── CARD SECTION ── */}
                <div style={card}>
                    <h3>Payment Method</h3>

                    {cardOnFile ? (
                        <>
                            <p>
                                {cardOnFile.name_on_card} •••• {String(cardOnFile.cc_number).slice(-4)}
                            </p>
                            <p>
                                Exp: {cardOnFile.exp_month}/{cardOnFile.exp_year}
                            </p>

                            <button
                                onClick={() => setCardOnFile(null)}
                                style={{ marginTop: "10px" }}
                            >
                                Replace Card
                            </button>
                        </>
                    ) : (
                        <p>No card on file</p>
                    )}

                    {/* ── FORM (like ChefForm style) ── */}
                    {showForm && (
                        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                            <input
                                placeholder="Name on card"
                                value={formData.name_on_card}
                                onChange={(e) =>
                                    setFormData({ ...formData, name_on_card: e.target.value })
                                }
                                style={input}
                            />

                            <input
                                placeholder="Card number"
                                value={formData.cc_number}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, ""); // digits only
                                    setFormData({ ...formData, cc_number: val });
                                }}
                                maxLength={19}
                                style={input}
                            />

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
                                style={input}
                            />

                            <input
                                placeholder="YYYY"
                                value={formData.exp_year}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setFormData({ ...formData, exp_year: val });
                                }}
                                maxLength={4}
                                style={input}
                            />

                            <input
                                placeholder="CVC"
                                value={formData.cvc}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setFormData({ ...formData, cvc: val });
                                }}
                                maxLength={4}
                                style={input}
                            />

                            <button onClick={saveCard} disabled={saving} style={button}>
                                {saving ? "Saving..." : "Save Card"}
                            </button>

                            {error && <p style={{ color: "red" }}>{error}</p>}
                        </div>
                    )}
                </div>

                {/* ── TRANSACTIONS ── */}
                <div style={card}>
                    <h3>Transaction History</h3>

                    {transactions.length === 0 ? (
                        <p>No transactions yet</p>
                    ) : (
                        transactions.map((t) => (
                            <div
                                key={t.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "6px 0",
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <span>{t.id}</span>
                                <strong>{t.amount}</strong>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}