import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TagInput from "./TagInput";
import chefImage from "../assets/pexels-sebastian-coman-photography-1598188-3717880.jpg";
import { useAuth } from "../context/useAuth.js";

const BACKEND_URL = "http://127.0.0.1:8000";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

const s = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  heroBand: {
    background: "#FFF8ED",
    borderBottom: "0.5px solid #FAC775",
    padding: "2.5rem 2rem"
  },
  heroTitle: {
    fontFamily: "'Pacifico', cursive",
    fontSize: 32,
    color: "#412402",
    margin: "0 0 0.5rem",
    fontWeight: 400
  },
  heroSub: {
    fontSize: 15,
    color: "#633806",
    margin: 0,
    lineHeight: 1.7
  },
  outer: {
    display: "flex",
    justifyContent: "center",
    padding: "3rem 2rem"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 36rem) 32rem",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    maxWidth: 1100,
    width: "100%"
  },
  formWrap: {
    background: "#FFF8ED",
    padding: "2.5rem",
    borderRight: "0.5px solid #EF9F27"
  },
  fieldWrap: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "#854F0B",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "0.5px solid #EF9F27",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    background: "#fff",
    color: "#412402",
    outline: "none",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "9px 12px",
    border: "0.5px solid #EF9F27",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    background: "#fff",
    color: "#412402",
    outline: "none",
    boxSizing: "border-box"
  },
  priceWrap: {
    display: "flex",
    alignItems: "stretch"
  },
  pricePrefix: {
    background: "#FAEEDA",
    border: "0.5px solid #EF9F27",
    borderRight: "none",
    padding: "9px 12px",
    borderRadius: "8px 0 0 8px",
    fontSize: 14,
    color: "#854F0B",
    fontWeight: 500,
    display: "flex",
    alignItems: "center"
  },
  priceInput: {
    width: "100%",
    padding: "9px 12px",
    border: "0.5px solid #EF9F27",
    borderLeft: "none",
    borderRadius: "0 8px 8px 0",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    background: "#fff",
    color: "#412402",
    outline: "none"
  },
  textarea: {
    width: "100%",
    padding: "9px 12px",
    border: "0.5px solid #EF9F27",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    background: "#fff",
    color: "#412402",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box"
  },
  submitBtn: {
    width: "100%",
    background: "#FF5733",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 8
  },
  submitBtnDisabled: {
    width: "100%",
    background: "#ccc",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    cursor: "not-allowed",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 8
  },
  imgWrap: { overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  successWrap: {
    textAlign: "center",
    padding: "4rem 2rem",
    background: "#EAF3DE",
    border: "0.5px solid #639922",
    borderRadius: 16,
    maxWidth: 480,
    margin: "3rem auto"
  },
  successIcon: { fontSize: 48, color: "#639922", marginBottom: "1rem" },
  successTitle: { fontSize: 22, fontWeight: 500, color: "#27500A", margin: "0 0 0.5rem" },
  successSub: { fontSize: 14, color: "#3B6D11", margin: 0 },
  paymentBox: {
    padding: 20,
    background: "#fff",
    borderRadius: 12,
    border: "0.5px solid #EF9F27"
  },
  errorMessage: {
    background: "#FFE5E5",
    color: "#D32F2F",
    padding: "12px",
    borderRadius: 8,
    marginBottom: "20px",
    fontSize: 14
  },
  requestSummary: {
    background: "#FAEEDA",
    padding: "16px",
    borderRadius: 8,
    marginBottom: "20px"
  },
  backBtn: {
    background: "#fff",
    color: "#FF5733",
    border: "1px solid #FF5733",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginRight: "12px"
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "20px"
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px"
  }
};

function ChefForm({ submissions, setSubmissions, onRequestCreated }) {
  const { authUser, isCustomer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedChefId = location.state?.chefId ?? "";

  const [chefs, setChefs] = useState([]);
  const [loadingChefs, setLoadingChefs] = useState(true);

  const [formData, setFormData] = useState({
    price: "",
    date: "",
    ingredients: [],
    equipment: [],
    summary: "",
    chef_id: selectedChefId || "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentRequestId, setCurrentRequestId] = useState(null);

  const [step, setStep] = useState(1);

  const [paymentData, setPaymentData] = useState({
    name_on_card: "",
    cc_number: "",
    exp_month: "",
    exp_year: "",
    cvc: ""
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/chefs`)
      .then((res) => res.json())
      .then((data) => {
        setChefs(data);
        setLoadingChefs(false);
      })
      .catch((err) => {
        console.error("Failed to fetch chefs:", err);
        setLoadingChefs(false);
      });
  }, []);

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.summary) newErrors.summary = "Summary is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!isCustomer) {
      setSubmitError("Login required");
      return;
    }

    if (!validateForm()) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData = {
        price: parseFloat(formData.price),
        date: formData.date,
        ingredients: formData.ingredients,
        equipment: formData.equipment,
        summary: formData.summary,
        chef_id: formData.chef_id || null,
      };

      const res = await fetch(`${BACKEND_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": authUser?.role ?? "",
          "X-User-Id": authUser?.user_id ?? "",
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Request failed");

      setCurrentRequestId(data.request_id);
      setStep(2);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setSubmitError("");

    if (!paymentData.name_on_card) {
      setSubmitError("Cardholder name is required");
      return;
    }
    if (!paymentData.cc_number || paymentData.cc_number.replace(/\s/g, '').length < 16) {
      setSubmitError("Valid card number is required");
      return;
    }
    if (!paymentData.exp_month || !paymentData.exp_year) {
      setSubmitError("Expiration date is required");
      return;
    }
    if (!paymentData.cvc || paymentData.cvc.length < 3) {
      setSubmitError("Valid CVC is required");
      return;
    }

    try {

      await new Promise(resolve => setTimeout(resolve, 1500));


      if (typeof onRequestCreated === "function") {
        onRequestCreated();
      }

      setSubmitted(true);

      setTimeout(() => {
        navigate("/activity?tab=requests");
      }, 2000);
    } catch (e) {
      setSubmitError(e.message);
    }
  };

  const handleMonthChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2);
    setPaymentData({ ...paymentData, exp_month: value });
  };

  const handleYearChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setPaymentData({ ...paymentData, exp_year: value });
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPaymentData({ ...paymentData, cc_number: value });
  };

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.heroBand}>
          <h1 style={s.heroTitle}>Payment Complete!</h1>
        </div>
        <div style={s.successWrap}>
          <div style={s.successIcon}>✓</div>
          <h2 style={s.successTitle}>Request Submitted!</h2>
          <p style={s.successSub}>
            Your request is pending chef approval. Redirecting you to your requests...
          </p>
        </div>
      </div>
    );
  }

  const selectedChef = chefs.find(chef => chef.id === formData.chef_id || chef.chef_id === formData.chef_id);

  return (
    <div style={s.page}>
      <div style={s.heroBand}>
        <h1 style={s.heroTitle}>Hire a Chef</h1>
        <p style={s.heroSub}>Fill in your request details and complete payment</p>
      </div>

      <div style={s.outer}>
        <div style={s.grid}>
          <div style={s.formWrap}>
            {submitError && (
              <div style={s.errorMessage}>
                ⚠️ {submitError}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSubmit}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Select Chef (Optional)</label>
                  <select
                    value={formData.chef_id}
                    onChange={(e) => setFormData({ ...formData, chef_id: e.target.value })}
                    style={s.select}
                    disabled={loadingChefs || !!selectedChefId}
                  >
                    <option value="">-- Any Available Chef (Auto-assign) --</option>
                    {chefs.map((chef) => (
                      <option key={chef.id || chef.chef_id} value={chef.id || chef.chef_id}>
                        {chef.name} {chef.specialty && `- ${chef.specialty}`}
                      </option>
                    ))}
                  </select>
                  {!formData.chef_id && (
                    <p style={{ fontSize: 12, color: "#639922", marginTop: 4 }}>
                      ✓ We'll assign the best available chef for your event
                    </p>
                  )}
                  {selectedChefId && !loadingChefs && selectedChef && (
                    <p style={{ fontSize: 12, color: "#639922", marginTop: 4 }}>
                      ✓ Chef {selectedChef.name} has been selected for you
                    </p>
                  )}
                </div>

                <div style={s.fieldWrap}>
                  <label style={s.label}>Budget (USD)</label>
                  <div style={s.priceWrap}>
                    <span style={s.pricePrefix}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 150"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      style={s.priceInput}
                    />
                  </div>
                  {errors.price && <p style={{ color: "#D32F2F", fontSize: 12, marginTop: 4 }}>{errors.price}</p>}
                </div>

                <div style={s.fieldWrap}>
                  <label style={s.label}>Event Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={s.input}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.date && <p style={{ color: "#D32F2F", fontSize: 12, marginTop: 4 }}>{errors.date}</p>}
                </div>

                <div style={s.fieldWrap}>
                  <TagInput
                    label="Ingredients"
                    field="ingredients"
                    formData={formData}
                    setFormData={setFormData}
                    error={errors.ingredients}
                  />
                </div>

                <div style={s.fieldWrap}>
                  <TagInput
                    label="Equipment Needed"
                    field="equipment"
                    formData={formData}
                    setFormData={setFormData}
                    error={errors.equipment}
                  />
                </div>

                <div style={s.fieldWrap}>
                  <label style={s.label}>Request Summary</label>
                  <textarea
                    rows="4"
                    placeholder="Describe your event, dietary requirements, special instructions, etc."
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    style={s.textarea}
                  />
                  {errors.summary && <p style={{ color: "#D32F2F", fontSize: 12, marginTop: 4 }}>{errors.summary}</p>}
                </div>

                <button
                  type="submit"
                  style={isSubmitting ? s.submitBtnDisabled : s.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Request..." : "Continue to Payment"}
                </button>
              </form>
            ) : (
              <>
                <div style={s.requestSummary}>
                  <h3 style={{ margin: "0 0 10px 0", color: "#412402" }}>Request Summary</h3>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Chef:</strong> {selectedChef?.name || "Any Available Chef"}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Amount:</strong> ${formData.price}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Date:</strong> {formData.date}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Ingredients:</strong> {formData.ingredients.join(", ") || "None"}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Equipment:</strong> {formData.equipment.join(", ") || "None"}
                  </p>
                  <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666" }}>
                    {formData.summary}
                  </p>
                </div>

                <div style={s.paymentBox}>
                  <h3 style={{ margin: "0 0 20px 0", color: "#412402" }}>Payment Details</h3>

                  <div style={s.fieldWrap}>
                    <label style={s.label}>Name on Card</label>
                    <input
                      placeholder="John Smith"
                      value={paymentData.name_on_card}
                      onChange={(e) => setPaymentData({ ...paymentData, name_on_card: e.target.value })}
                      style={s.input}
                    />
                  </div>

                  <div style={s.fieldWrap}>
                    <label style={s.label}>Card Number</label>
                    <input
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cc_number}
                      onChange={handleCardNumberChange}
                      style={s.input}
                      maxLength={19}
                    />
                  </div>

                  <div style={s.row}>
                    <div>
                      <label style={s.label}>Expiration Month</label>
                      <input
                        placeholder="MM"
                        value={paymentData.exp_month}
                        onChange={handleMonthChange}
                        style={s.input}
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label style={s.label}>Expiration Year</label>
                      <input
                        placeholder="YYYY"
                        value={paymentData.exp_year}
                        onChange={handleYearChange}
                        style={s.input}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div style={s.fieldWrap}>
                    <label style={s.label}>CVC</label>
                    <input
                      placeholder="123"
                      type="password"
                      value={paymentData.cvc}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setPaymentData({ ...paymentData, cvc: value });
                        }
                      }}
                      style={s.input}
                      maxLength={4}
                    />
                  </div>

                  <div style={s.buttonGroup}>
                    <button onClick={() => setStep(1)} style={s.backBtn}>
                      ← Back
                    </button>
                    <button onClick={handlePayment} style={{ ...s.submitBtn, marginTop: 0 }}>
                      Pay ${formData.price}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={s.imgWrap}>
            <img src={chefImage} alt="Professional Chef" style={s.img} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChefForm;