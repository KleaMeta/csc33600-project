import { useEffect } from "react";
import { Link } from "react-router-dom";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

function Login() {
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FFF8ED", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>

        <p style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.5rem" }}>
          Welcome!
        </p>
        <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 36, color: "#412402", margin: "0 0 0.75rem", fontWeight: 400 }}>
          Who are you?
        </h1>
        <p style={{ fontSize: 15, color: "#633806", margin: "0 0 2.5rem", lineHeight: 1.7 }}>
          Select your role to continue.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          <Link to="/customer-login" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fff",
              border: "0.5px solid #EF9F27",
              borderRadius: 16,
              padding: "2rem 1.5rem",
              cursor: "pointer",
            }}>
              <div style={{ fontSize: 40, color: "#EF9F27", marginBottom: "1rem" }}>
                <i className="ti ti-user" aria-hidden="true" />
              </div>
              <p style={{ fontSize: 18, fontWeight: 500, color: "#412402", margin: "0 0 0.5rem" }}>Customer</p>
              <p style={{ fontSize: 13, color: "#633806", margin: 0, lineHeight: 1.6 }}>
                Browse chefs and submit your requests.
              </p>
              <div style={{ marginTop: "1.5rem", background: "#F0D813", color: "#412402", padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
                Login as customer
              </div>
            </div>
          </Link>

          <Link to="/chef-login" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fff",
              border: "0.5px solid #EF9F27",
              borderRadius: 16,
              padding: "2rem 1.5rem",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}>
              <div style={{ fontSize: 40, color: "#EF9F27", marginBottom: "1rem" }}>
                <i className="ti ti-tools-kitchen-2" aria-hidden="true" />
              </div>
              <p style={{ fontSize: 18, fontWeight: 500, color: "#412402", margin: "0 0 0.5rem" }}>Chef</p>
              <p style={{ fontSize: 13, color: "#633806", margin: 0, lineHeight: 1.6 }}>
                Manage requests and connect with customers.
              </p>
              <div style={{ marginTop: "1.5rem", background: "#FF5733", color: "#fff", padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
                Login as chef
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Login;