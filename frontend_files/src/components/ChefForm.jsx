import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TagInput from "./TagInput";
import chefImage from "../assets/pexels-sebastian-coman-photography-1598188-3717880.jpg";
import { useAuth } from "../context/useAuth.js";

const BACKEND_URL = "http://127.0.0.1:8000";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

const s = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  heroBand: { background: "#FFF8ED", borderBottom: "0.5px solid #FAC775", padding: "2.5rem 2rem" },
  heroLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.4rem" },
  heroTitle: { fontFamily: "'Pacifico', cursive", fontSize: 32, color: "#412402", margin: "0 0 0.5rem", fontWeight: 400 },
  heroSub: { fontSize: 15, color: "#633806", margin: 0, lineHeight: 1.7 },
  outer: { display: "flex", justifyContent: "center", padding: "3rem 2rem" },
  grid: { display: "grid", gridTemplateColumns: "minmax(0, 36rem) 32rem", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 1100, width: "100%" },
  formWrap: { background: "#FFF8ED", padding: "2.5rem", borderRight: "0.5px solid #EF9F27" },
  divider: { border: "none", borderTop: "0.5px solid #EF9F27", margin: "1rem 0 1.5rem" },
  fieldWrap: { marginBottom: 16 },
  label: { display: "block", fontSize: 12, fontWeight: 500, color: "#854F0B", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { width: "100%", padding: "9px 12px", border: "0.5px solid #EF9F27", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#412402", outline: "none", boxSizing: "border-box" },
  priceWrap: { display: "flex", alignItems: "stretch" },
  pricePrefix: { background: "#FAEEDA", border: "0.5px solid #EF9F27", borderRight: "none", padding: "9px 12px", borderRadius: "8px 0 0 8px", fontSize: 14, color: "#854F0B", fontWeight: 500, display: "flex", alignItems: "center" },
  priceInput: { width: "100%", padding: "9px 12px", border: "0.5px solid #EF9F27", borderLeft: "none", borderRadius: "0 8px 8px 0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#412402", outline: "none" },
  textarea: { width: "100%", padding: "9px 12px", border: "0.5px solid #EF9F27", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#412402", outline: "none", resize: "vertical", boxSizing: "border-box" },
  submitBtn: { width: "100%", background: "#FF5733", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 8 },
  submitBtnDisabled: { width: "100%", background: "#ccc", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "not-allowed", fontFamily: "'DM Sans', sans-serif", marginTop: 8 },
  errorText: { color: "#A32D2D", fontSize: 12, marginTop: 4 },
  imgWrap: { overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  successWrap: { textAlign: "center", padding: "4rem 2rem", background: "#EAF3DE", border: "0.5px solid #639922", borderRadius: 16, maxWidth: 480, margin: "3rem auto" },
  successIcon: { fontSize: 48, color: "#639922", marginBottom: "1rem" },
  successTitle: { fontSize: 22, fontWeight: 500, color: "#27500A", margin: "0 0 0.5rem" },
  successSub: { fontSize: 14, color: "#3B6D11", margin: 0 },
};

function ChefForm({ submissions, setSubmissions }) {
  const { authUser, isCustomer } = useAuth();
  const location = useLocation();
  const selectedChefId = location.state?.chefId ?? "";

  const [chefs, setChefs] = useState([]);
  const [chefLoadError, setChefLoadError] = useState("");
  const [formData, setFormData] = useState({
    price: "",
    date: "",
    ingredients: [],
    equipment: [],
    summary: "",
    chef_id: selectedChefId,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
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

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/chefs`)
      .then(async (res) => {
        if (!res.ok) {
          let detail = "Could not load chefs right now.";
          try {
            const errorData = await res.json();
            if (errorData?.detail) {
              detail = errorData.detail;
            }
          } catch {
            // Keep fallback message if response is non-JSON.
          }
          throw new Error(detail);
        }
        return res.json();
      })
      .then((data) => {
        setChefs(Array.isArray(data) ? data : []);
        setChefLoadError("");
      })
      .catch((error) => {
        setChefs([]);
        setChefLoadError(error.message);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors = {};
    let hasError = false;

    if (!formData.price || isNaN(formData.price)) {
      newErrors.price = "Price must be a number.";
      hasError = true;
    }
    if (!formData.date) {
      newErrors.date = "Date is required.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    if (!isCustomer) {
      setSubmitError("Please log in as a customer before submitting a request.");
      return;
    }

    const requestPayload = {
      ...formData,
      ingredients: [...formData.ingredients],
      equipment: [...formData.equipment],
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`${BACKEND_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": authUser?.role ?? "",
          "X-User-Id": authUser?.user_id ?? "",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        let errorMessage = "Backend rejected the request.";
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMessage = errorData.detail;
        } catch { }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      setSubmissions([
        ...submissions,
        {
          ...requestPayload,
          chef_id: requestPayload.chef_id || null,
          price: `$${parseFloat(requestPayload.price).toFixed(2)}`,
          request_id: responseData.request_id,
          accepted: false,
          status: "pending",
        },
      ]);
      setSubmitted(true);
      setFormData({
        price: "",
        date: "",
        ingredients: [],
        equipment: [],
        summary: "",
        chef_id: "",
      });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.heroBand}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={s.heroLabel}>Hire a chef</p>
            <h1 style={s.heroTitle}>Your ticket is on the rail!</h1>
          </div>
        </div>
        <div style={s.successWrap}>
          <div style={s.successIcon}>
            <i className="ti ti-circle-check" aria-hidden="true" />
          </div>
          <p style={s.successTitle}>Request submitted!</p>
          <p style={s.successSub}>We received your request. A chef will be in touch soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* Hero part of page */}
      <div style={s.heroBand}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={s.heroLabel}>Get started</p>
          <h1 style={s.heroTitle}>Hire a Chef</h1>
          <p style={s.heroSub}>Tell us what you need and we'll find your perfect match.</p>
        </div>
      </div>

      {/* The form and images here */}
      <div style={s.outer}>
        <div style={s.grid}>

          <div style={s.formWrap}>
            <hr style={s.divider} />

            {/* Price */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Price</label>
              <div style={s.priceWrap}>
                <span style={s.pricePrefix}>$</span>
                <input
                  type="number"
                  placeholder="200.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={s.priceInput}
                  required
                />
              </div>
              {errors.price && <p style={s.errorText}>{errors.price}</p>}
            </div>

            {/* Date */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={s.input}
                required
              />
              {errors.date && <p style={s.errorText}>{errors.date}</p>}
            </div>

            {/* Ingredients */}
            <div style={s.fieldWrap}>
              <TagInput
                label="Ingredients"
                field="ingredients"
                formData={formData}
                setFormData={setFormData}
                error={errors.ingredients}
              />
            </div>

            {/* Equipment */}
            <div style={s.fieldWrap}>
              <TagInput
                label="Equipment"
                field="equipment"
                formData={formData}
                setFormData={setFormData}
                error={errors.equipment}
              />
            </div>

            {/* Summary */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Specific chef (optional)</label>
              <select
                value={formData.chef_id}
                onChange={(e) =>
                  setFormData({ ...formData, chef_id: e.target.value })
                }
                style={s.input}
              >
                <option value="">Any available chef</option>
                {chefs.map((chef) => (
                  <option key={chef.chef_id} value={chef.chef_id}>
                    {chef.name}
                  </option>
                ))}
              </select>
              {chefLoadError && <p style={s.errorText}>{chefLoadError}</p>}
            </div>

            <div style={s.fieldWrap}>
              <label style={s.label}>Request summary</label>
              <textarea
                placeholder="State the dishes that you want, eg. Shrimp Alfredo"
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                style={s.textarea}
                required
              />
            </div>

            <button
              onClick={handleSubmit}
              style={isSubmitting ? s.submitBtnDisabled : s.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit request"}
            </button>

            {submitError && <p style={{ ...s.errorText, marginTop: 8 }}>{submitError}</p>}
          </div>

          <div style={s.imgWrap} className="hidden lg:block">
            <img src={chefImage} alt="Chef cooking" style={s.img} />
          </div>

        </div>
      </div>

    </div>
  );
}

export default ChefForm;
