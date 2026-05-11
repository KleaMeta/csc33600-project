import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import { useSearchParams } from "react-router-dom";
import RequestsPanel from "../components/Requests.jsx";
import BookingsPanel from "../components/Bookings.jsx";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

export default function Activity({
    submissions,
    bookings,
    handleApprove,
    handleDeny,
    handleCancel,
    requestError,
    bookingError,
}) {
    const { authUser } = useAuth();
    const isChef = authUser?.role === "chef";

    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");

    const [activeTab, setActiveTab] = useState("bookings");

    useEffect(() => {
        if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONT_URL;
            document.head.appendChild(link);
        }
    }, []);

    useEffect(() => {
        if (!authUser) return;

        if (tabFromUrl === "requests" && isChef) {
            setActiveTab("requests");
            return;
        }

        if (tabFromUrl === "bookings") {
            setActiveTab("bookings");
            return;
        }

        const defaultTab =
            isChef && submissions.length > 0 ? "requests" : "bookings";
        setActiveTab(defaultTab);
        setSearchParams({ tab: defaultTab }, { replace: true });
    }, [authUser, isChef, tabFromUrl, setSearchParams]);

    if (!authUser) {
        return (
            <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <div
                    style={{
                        maxWidth: 900,
                        margin: "3rem auto",
                        padding: "0 2rem",
                        color: "#633806",
                    }}
                >
                    Please log in to view your activity.
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <div
                style={{
                    background: "#FFF8ED",
                    borderBottom: "0.5px solid #FAC775",
                    padding: "2.5rem 2rem",
                }}
            >
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <p
                        style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#BA7517",
                            fontWeight: 500,
                            marginBottom: "0.4rem",
                        }}
                    >
                        Activity
                    </p>

                    <h1
                        style={{
                            fontFamily: "'Pacifico', cursive",
                            fontSize: 32,
                            color: "#412402",
                            margin: "0 0 0.5rem",
                            fontWeight: 400,
                        }}
                    >
                        Requests & bookings
                    </h1>

                    <p style={{ fontSize: 15, color: "#633806", margin: 0, lineHeight: 1.7 }}>
                        {isChef
                            ? "Manage incoming requests and confirmed bookings in one place."
                            : "Track your confirmed chef bookings in one place."}
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 2rem" }}>
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        borderBottom: "0.5px solid #FAC775",
                        marginBottom: "1.5rem",
                    }}
                >
                    {isChef && (
                        <button
                            onClick={() => {
                                setActiveTab("requests");
                                setSearchParams({ tab: "requests" });
                            }}
                            style={{
                                border: "none",
                                background: activeTab === "requests" ? "#FAEEDA" : "transparent",
                                color: activeTab === "requests" ? "#412402" : "#854F0B",
                                padding: "0.75rem 1rem",
                                borderBottom:
                                    activeTab === "requests"
                                        ? "2px solid #EF9F27"
                                        : "2px solid transparent",
                                cursor: "pointer",
                                fontWeight: 500,
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            Requests ({submissions.length})
                        </button>
                    )}

                    <button
                        onClick={() => {
                            setActiveTab("bookings");
                            setSearchParams({ tab: "bookings" });
                        }}
                        style={{
                            border: "none",
                            background: activeTab === "bookings" ? "#FAEEDA" : "transparent",
                            color: activeTab === "bookings" ? "#412402" : "#854F0B",
                            padding: "0.75rem 1rem",
                            borderBottom:
                                activeTab === "bookings"
                                    ? "2px solid #EF9F27"
                                    : "2px solid transparent",
                            cursor: "pointer",
                            fontWeight: 500,
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        Bookings ({bookings.length})
                    </button>
                </div>

                <div
                    style={{
                        background: "#FFF8ED",
                        border: "0.5px solid #FAC775",
                        borderRadius: 12,
                        padding: "1.5rem",
                    }}
                >
                    {isChef && activeTab === "requests" && (
                        <RequestsPanel
                            submissions={submissions}
                            handleApprove={handleApprove}
                            handleDeny={handleDeny}
                            requestError={requestError}
                        />
                    )}

                    {activeTab === "bookings" && (
                        <BookingsPanel
                            bookings={bookings}
                            handleCancel={handleCancel}
                            bookingError={bookingError}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
