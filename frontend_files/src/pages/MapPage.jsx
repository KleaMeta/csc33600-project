import { useEffect } from "react";
import Map from "../components/Map.jsx";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

export default function MapPage() {
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

      <div style={{ background: "#FFF8ED", borderBottom: "0.5px solid #FAC775", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BA7517", fontWeight: 500, marginBottom: "0.4rem" }}>
            Explore
          </p>
          <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 32, color: "#412402", margin: "0 0 0.5rem", fontWeight: 400 }}>
            Find a chef near you
          </h1>
          <p style={{ fontSize: 15, color: "#633806", margin: 0, lineHeight: 1.7 }}>
            Chefs are available across the city — find one in your area and hire them today.
          </p>
        </div>
      </div>

      {/* Map */}
      <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 2rem" }}>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "0.5px solid #EF9F27", height: "65vh", minHeight: 400 }}>
          <Map />
        </div>
      </div>

    </div>
  );
}