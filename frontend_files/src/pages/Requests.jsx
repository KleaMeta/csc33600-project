import { useEffect, useRef } from "react";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap";

function RequestTicket({ req, index, handleApprove, handleDeny }) {
  return (
    <div style={{
      background: "#FAEEDA",
      border: "0.5px solid #EF9F27",
      borderRadius: "12px",
      position: "relative",
      overflow: "visible",
      marginBottom: "0",
    }}>
      <div style={{
        position: "absolute", top: "1rem", right: "1rem",
        width: 64, height: 64, borderRadius: "50%",
        border: "3px solid #BA7517",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: "rotate(-12deg)",
      }}>
        <span style={{
          fontFamily: "'Special Elite', monospace",
          fontSize: 10, color: "#854F0B",
          textAlign: "center", lineHeight: 1.2,
        }}>PENDING<br />REVIEW</span>
      </div>

      <div style={{ padding: "1rem 1.25rem 0.75rem" }}>
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>Request ID</div>
              <div style={idStyle}>#{req.request_id ?? `REQ-${String(index + 1).padStart(5, "0")}`}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>Requested chef</div>
              <div style={valueStyle}>{req.chef_id ?? "Any chef"}</div>
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
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleApprove(index)} style={approveBtnStyle}>
            ✓ Approve
          </button>
          <button onClick={() => handleDeny(index)} style={denyBtnStyle}>
            ✕ Deny
          </button>
        </div>
      </div>
    </div>
  );
}

function Requests({ submissions, handleApprove, handleDeny, requestError }) {
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FFF8ED", minHeight: "100vh" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.4rem" }}>Chef dashboard</p>
        <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 32, color: "#412402", margin: "0 0 0.5rem", fontWeight: 400 }}>Open requests</h1>
        <p style={{ fontSize: 15, color: "#633806", margin: "0 0 2rem" }}>Review and approve incoming customer requests.</p>

        {requestError && (
          <p style={{ color: "#A32D2D", marginBottom: "1rem" }}>{requestError}</p>
        )}

        {submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <i className="ti ti-chef-hat" style={{ fontSize: 48, color: "#EF9F27" }} aria-hidden="true" />
            <p style={{ fontSize: 18, fontWeight: 500, color: "#412402", margin: "1rem 0 0.5rem" }}>
              The ticket rail is empty...
            </p>
            <p style={{ fontSize: 14, color: "#633806", margin: 0 }}>
              When customers submit requests, they'll appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {submissions.map((req, index) => (
              <RequestTicket
                key={req.request_id ?? index}
                req={req}
                index={index}
                handleApprove={handleApprove}
                handleDeny={handleDeny}
              />
            ))}
          </div>
        )}
      </div>
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

const approveBtnStyle = {
  background: "#EAF3DE",
  border: "0.5px solid #639922",
  color: "#27500A",
  fontSize: 13,
  padding: "6px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 500,
};

const denyBtnStyle = {
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
  content: "''",
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

export default Requests;
