import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

const BACKEND_URL = "http://127.0.0.1:8000";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

function Customer_Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const newErrors = {};
    let hasError = false;

    if (!formData.email) { newErrors.email = "Email is required."; hasError = true; }
    if (!formData.password) { newErrors.password = "Password is required."; hasError = true; }

    setErrors(newErrors);
    if (hasError) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/customer-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = "Login failed.";
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMessage = errorData.detail;
        } catch { }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      login(data);
      navigate("/hire-chef");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FFF8ED", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.4rem" }}>
            Welcome back!
          </p>
          <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 32, color: "#412402", margin: "0 0 0.5rem", fontWeight: 400 }}>
            Customer Login
          </h1>
          <p style={{ fontSize: 14, color: "#633806", margin: 0 }}>
            Your next meal is a login away.
          </p>
        </div>

        <div style={{ background: "#fff", border: "0.5px solid #EF9F27", borderRadius: 16, padding: "2rem" }}>

          {/* Email right here */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#854F0B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="customer@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #EF9F27", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#FFF8ED", color: "#412402", outline: "none", boxSizing: "border-box" }}
              required
            />
            {errors.email && <p style={{ color: "#A32D2D", fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
          </div>

          {/* Password right here */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#854F0B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #EF9F27", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#FFF8ED", color: "#412402", outline: "none", boxSizing: "border-box" }}
              required
            />
            {errors.password && <p style={{ color: "#A32D2D", fontSize: 12, marginTop: 4 }}>{errors.password}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ width: "100%", background: isSubmitting ? "#ccc" : "#F0D813", color: "#412402", border: "none", padding: "12px 0", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            {isSubmitting ? "Logging in..." : "Login as customer"}
          </button>

          {submitError && <p style={{ color: "#A32D2D", fontSize: 13, marginTop: 12, textAlign: "center" }}>{submitError}</p>}
        </div>

      </div>
    </div>
  );
}

export default Customer_Login;