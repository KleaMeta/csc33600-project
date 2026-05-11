import { useEffect } from "react";
import { Link } from "react-router-dom";
import smilingChefs from "../assets/smilingchefs.png";
import smilingChefs2 from "../assets/smilingchefs2.jpg";
import Laptop from "../assets/womanlaptop.jpg";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

function Home() {
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

      {/* Hero Part */}
      <section style={{ background: "#FFF8ED", borderBottom: "0.5px solid #FAC775", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.5rem" }}>
              Book. Cook. Enjoy.
            </p>
            <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: "clamp(32px, 5vw, 52px)", color: "#412402", lineHeight: 1.2, margin: "0 0 1.25rem", fontWeight: 400 }}>
              Book a professional<br />chef in minutes
            </h1>
            <p style={{ fontSize: 16, color: "#633806", lineHeight: 1.8, maxWidth: 460, marginBottom: "2rem" }}>
              Tell us what you need — from ingredients to equipment — and we'll
              connect you with chefs who can bring your vision to life.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                to="/hire-chef"
                style={{ background: "#FF5733", color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 500, fontSize: 15, textDecoration: "none" }}
              >
                Hire a Chef
              </Link>
              <Link
                to="/about"
                style={{ background: "transparent", color: "#BA7517", padding: "12px 28px", borderRadius: 8, fontWeight: 500, fontSize: 15, textDecoration: "none", border: "0.5px solid #EF9F27" }}
              >
                Learn more
              </Link>
            </div>
          </div>

          <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={smilingChefs} alt="Smiling chefs" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: "#FF5733", padding: "2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", textAlign: "center" }}>
          {[
            { num: "500+", label: "Chefs available" },
            { num: "2,000+", label: "Meals served" },
            { num: "4.9★", label: "Average rating" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: 28, fontWeight: 500, color: "#fff", margin: "0 0 4px" }}>{s.num}</p>
              <p style={{ fontSize: 13, color: "#FFE0D8", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature split */}
      <section style={{ background: "#FFF8ED", borderTop: "0.5px solid #FAC775", borderBottom: "0.5px solid #FAC775", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={Laptop} alt="Customer browsing" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.4rem" }}>
              For customers
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 500, margin: "0 0 1rem", color: "#412402" }}>
              Your kitchen, your menu, your chef
            </h2>
            <p style={{ fontSize: 15, color: "#633806", lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Whether it's an intimate dinner for two or a feast for twenty, Cheffy
              connects you with chefs who match your exact vision — no compromises.
            </p>
            <Link
              to="/hire-chef"
              style={{ background: "#F0D813", color: "#412402", padding: "10px 24px", borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: "none", display: "inline-block" }}
            >
              Request a Chef
            </Link>
          </div>
        </div>
      </section>

      {/* Chef Call to Action */}
      <section style={{ background: "#fff", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.4rem" }}>
              For chefs
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 500, margin: "0 0 1rem", color: "#412402" }}>
              Turn your passion into a career
            </h2>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Set your own schedule, choose the clients you work with, and get paid
              to do what you love. Join hundreds of chefs already on the platform.
            </p>
            <Link
              to="/chef-login"
              style={{ background: "#FF5733", color: "#fff", padding: "10px 24px", borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: "none", display: "inline-block" }}
            >
              Join as a chef
            </Link>
          </div>
          <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={smilingChefs2} alt="Chef at work" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* Bottom Call To Action */}
      <section style={{ background: "#FF5733", padding: "3.5rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Pacifico', cursive", fontSize: 32, color: "#fff", margin: "0 0 0.75rem", fontWeight: 400 }}>
          Ready to eat well?
        </h2>
        <p style={{ fontSize: 15, color: "#FFE0D8", margin: "0 0 1.5rem" }}>
          Join thousands of happy customers already using Cheffy.
        </p>
        <Link
          to="/hire-chef"
          style={{ background: "#F0D813", color: "#412402", padding: "12px 32px", borderRadius: 8, fontWeight: 500, fontSize: 15, textDecoration: "none", display: "inline-block" }}
        >
          Hire a Chef today
        </Link>
      </section>

    </div>
  );
}

export default Home;