import { useEffect } from "react";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap";

function BookingTicket({ req, handleCancel }) {
    return (
        <div style={{
            background: "#FAEEDA",
            border: "0.5px solid #EF9F27",
            borderRadius: "12px",
            position: "relative",
            overflow: "visible",
        }}>
            <div style={{
                position: "absolute", top: "1rem", right: "1rem",
                width: 64, height: 64, borderRadius: "50%",
                border: "3px solid #639922",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: "rotate(-12deg)",
            }}>
                <span style={{
                    fontFamily: "'Special Elite', monospace",
                    fontSize: 10, color: "#3B6D11",
                    textAlign: "center", lineHeight: 1.2,
                }}>CONFIRMED</span>
            </div>

            <div style={{ padding: "1rem 1.25rem 0.75rem" }}>
                <div style={{ marginBottom: 10 }}>
                    <div style={labelStyle}>Booking ID</div>
                    <div style={idStyle}>#{req.request_id}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                        <div style={labelStyle}>Date</div>
                        <div style={valueStyle}>{req.date}</div>
                    </div>
                    <div>
                        <div style={labelStyle}>Price</div>
                        <div style={valueStyle}>{req.price}</div>
                    </div>
                </div>
                <div>
                    <div style={labelStyle}>Summary</div>
                    <div style={valueStyle}>{req.summary}</div>
                </div>
            </div>

            <div style={{
                borderTop: "2px dashed #EF9F27",
                position: "relative",
                margin: "0 0",
            }}>
                <span style={notchStyle("left")} />
                <span style={notchStyle("right")} />
            </div>

            <div style={{ padding: "0.75rem 1.25rem 1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    <div>
                        <div style={labelStyle}>Ingredients</div>
                        <div style={{ ...valueStyle, fontSize: 13 }}>
                            {Array.isArray(req.ingredients) ? req.ingredients.join(", ") : req.ingredients}
                        </div>
                    </div>
                    <div>
                        <div style={labelStyle}>Equipment</div>
                        <div style={{ ...valueStyle, fontSize: 13 }}>
                            {Array.isArray(req.equipment) ? req.equipment.join(", ") : req.equipment}
                        </div>
                    </div>
                </div>
                <button onClick={() => handleCancel(req.request_id)} style={cancelBtnStyle}>
                    ✕ Cancel booking
                </button>
            </div>
        </div>
    );
}

function Bookings({ bookings, handleCancel, bookingError }) {
    useEffect(() => {
        if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONT_URL;
            document.head.appendChild(link);
        }
    }, []);

    return (
        <div style={{ padding: "2rem", maxWidth: 680, margin: "0 auto" }}>
            <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: "1.5rem" }}>
                My bookings
            </h1>

            {bookingError && (
                <p style={{ color: "#A32D2D", marginBottom: "1rem" }}>{bookingError}</p>
            )}

            {bookings.length === 0 ? (
                <p style={{ color: "#888" }}>No bookings yet.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {bookings.map((req, index) => (
                        <BookingTicket
                            key={req.request_id ?? index}
                            req={req}
                            handleCancel={handleCancel}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const labelStyle = {
    fontSize: 11,
    color: "#854F0B",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 2,
};

const valueStyle = {
    fontSize: 14,
    color: "#412402",
    fontWeight: 500,
    marginBottom: 10,
};

const idStyle = {
    fontFamily: "'Special Elite', monospace",
    fontSize: 13,
    color: "#BA7517",
};

const cancelBtnStyle = {
    background: "#FCEBEB",
    border: "0.5px solid #E24B4A",
    color: "#791F1F",
    fontSize: 13,
    padding: "6px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
};

const notchStyle = (side) => ({
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#f9f5f0",
    border: "0.5px solid #EF9F27",
    position: "absolute",
    top: -7,
    ...(side === "left" ? { left: -7 } : { right: -7 }),
    display: "inline-block",
});

export default Bookings;