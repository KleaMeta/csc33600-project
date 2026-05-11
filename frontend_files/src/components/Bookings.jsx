import { useEffect } from "react";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap";

function BookingTicket({ req, handleCancel, isChef }) {
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
                    fontSize: 10,
                    color: "#3B6D11",
                    textAlign: "center",
                    lineHeight: 1.2,
                }}>
                    CONFIRMED
                </span>
            </div>

            <div style={{ padding: "1rem 1.25rem 0.75rem" }}>
                <div style={{ marginBottom: 10 }}>
                    <div style={labelStyle}>Booking ID</div>
                    <div style={idStyle}>#{req.request_id}</div>
                </div>

                {/* Show the other party */}
                <div style={{ marginBottom: 10 }}>
                    <div style={labelStyle}>{isChef ? "Customer" : "Chef"}</div>
                    <div style={valueStyle}>
                        {isChef
                            ? (req.customer_id ?? "—")
                            : (req.chef_id ?? "—")}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                        <div style={labelStyle}>Date</div>
                        <div style={valueStyle}>{req.date}</div>
                    </div>
                    <div>
                        <div style={labelStyle}>Price</div>
                        <div style={valueStyle}>${req.price}</div>
                    </div>
                </div>

                <div>
                    <div style={labelStyle}>Summary</div>
                    <div style={valueStyle}>{req.summary}</div>
                </div>
            </div>

            <div style={{ borderTop: "2px dashed #EF9F27", position: "relative" }}>
                <span style={notchStyle("left")} />
                <span style={notchStyle("right")} />
            </div>

            <div style={{ padding: "0.75rem 1.25rem 1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    <div>
                        <div style={labelStyle}>Ingredients</div>
                        <div style={{ ...valueStyle, fontSize: 13 }}>
                            {Array.isArray(req.ingredients) ? req.ingredients.join(", ") : req.ingredients || "None"}
                        </div>
                    </div>
                    <div>
                        <div style={labelStyle}>Equipment</div>
                        <div style={{ ...valueStyle, fontSize: 13 }}>
                            {Array.isArray(req.equipment) ? req.equipment.join(", ") : req.equipment || "None"}
                        </div>
                    </div>
                </div>

                <button onClick={() => handleCancel(req.request_id)} style={cancelBtnStyle}>
                    {isChef ? "Cancel Booking" : "Cancel Booking"}
                </button>
            </div>
        </div>
    );
}

function Bookings({ bookings = [], handleCancel, bookingError, isChef }) {
    useEffect(() => {
        if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONT_URL;
            document.head.appendChild(link);
        }
    }, []);

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <p style={smallHeader}>{isChef ? "Chef dashboard" : "My bookings"}</p>
            <h2 style={title}>{isChef ? "Confirmed bookings" : "Confirmed cookings"}</h2>
            <p style={subtitle}>
                {isChef
                    ? "All your approved and confirmed bookings."
                    : "All your approved bookings."}
            </p>

            {bookingError && <p style={{ color: "#A32D2D", marginBottom: "1rem" }}>{bookingError}</p>}

            {bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0" }}>
                    <i className="ti ti-calendar" style={{ fontSize: 48, color: "#EF9F27" }} aria-hidden="true" />
                    <p style={{ fontSize: 18, fontWeight: 500, color: "#412402", margin: "1rem 0 0.5rem" }}>
                        No reservations on the books...
                    </p>
                    <p style={{ fontSize: 14, color: "#633806", margin: 0 }}>
                        {isChef
                            ? "Approved requests will show up here as confirmed bookings."
                            : "Once a chef approves your request, it'll appear here."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {bookings.map((req) => (
                        <BookingTicket
                            key={req.request_id}
                            req={req}
                            handleCancel={handleCancel}
                            isChef={isChef}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

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
    marginBottom: 10,
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
});

const smallHeader = {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#BA7517",
    fontWeight: 500,
    margin: 0,
};

const title = {
    fontFamily: "'Pacifico', cursive",
    fontSize: 26,
    color: "#412402",
    margin: "0.25rem 0 0.4rem",
    fontWeight: 400,
};

const subtitle = {
    fontSize: 14,
    color: "#633806",
    margin: "0 0 1.5rem",
};

export default Bookings;