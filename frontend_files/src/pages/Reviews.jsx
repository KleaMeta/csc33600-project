import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.js";

const BACKEND_URL = "http://127.0.0.1:8000";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

export default function ReviewsPanel() {
    const { authUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState("");

    const isChef = authUser?.role === "chef";

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

        fetch(`${BACKEND_URL}/api/reviews/me`, {
            headers: {
                "X-User-Role": authUser?.role ?? "",
                "X-User-Id": authUser?.user_id ?? "",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Could not load reviews.");
                return res.json();
            })
            .then((data) => {
                setReviews(Array.isArray(data) ? data : []);
                setError("");
            })
            .catch((err) => {
                setReviews([]);
                setError(err.message);
            });
    }, [authUser]);

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <div
                style={{
                    background: "#FFF8ED",
                    borderBottom: "0.5px solid #FAC775",
                    padding: "2.5rem 2rem",
                }}
            >
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
                        Reviews
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
                        Your reviews
                    </h1>

                    <p style={{ fontSize: 15, color: "#633806", margin: 0, lineHeight: 1.7 }}>
                        {isChef
                            ? "Read customer feedback from your completed bookings."
                            : "Review the feedback you’ve shared after booking a chef."}
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 2rem" }}>
                {!authUser && (
                    <div
                        style={{
                            background: "#FFF8ED",
                            border: "0.5px solid #FAC775",
                            borderRadius: 12,
                            padding: "1rem 1.25rem",
                            marginBottom: "1rem",
                            color: "#633806",
                        }}
                    >
                        Log in to see reviews connected to your account.
                    </div>
                )}

                {error && (
                    <p style={{ color: "#A32D2D", fontSize: 14 }}>
                        {error}
                    </p>
                )}

                {reviews.length === 0 && !error ? (
                    <div
                        style={{
                            background: "#FFF8ED",
                            border: "0.5px solid #FAC775",
                            borderRadius: 12,
                            padding: "2rem",
                            textAlign: "center",
                            color: "#633806",
                        }}
                    >
                        No reviews yet.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.review_id}
                            style={{
                                background: "#FFF8ED",
                                border: "0.5px solid #FAC775",
                                borderRadius: 12,
                                padding: "1.25rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                                <strong style={{ color: "#412402", fontSize: 18 }}>
                                    {"★".repeat(review.num_stars)}
                                    {"☆".repeat(5 - review.num_stars)}
                                </strong>

                                <span style={{ fontSize: 12, color: "#854F0B" }}>
                                    {review.timestamp
                                        ? new Date(review.timestamp).toLocaleDateString()
                                        : ""}
                                </span>
                            </div>

                            <p style={{ fontSize: 13, color: "#854F0B", margin: "0.75rem 0 0.25rem" }}>
                                {isChef
                                    ? `Customer ${review.reviewer_name || "Unknown"} reviewed you`
                                    : `You reviewed Chef ${review.reviewee_name || "Unknown"}`}
                            </p>

                            <p style={{ color: "#633806", lineHeight: 1.6, marginBottom: 0 }}>
                                {review.review_content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
