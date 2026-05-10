import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map.jsx";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@400;500&display=swap";

export default function MapPage() {
  const [chefs, setChefs] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const sortedChefs = [...chefs].sort((a, b) => {
    const aSponsored = Boolean(a.is_sponsored);
    const bSponsored = Boolean(b.is_sponsored);

    if (aSponsored !== bSponsored) {
      return aSponsored ? -1 : 1;
    }

    const aSponsorScore = Number(a.sponsor_score || 0);
    const bSponsorScore = Number(b.sponsor_score || 0);

    if (aSponsorScore !== bSponsorScore) {
      return bSponsorScore - aSponsorScore;
    }

    return a.name.localeCompare(b.name);
  });

  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_URL;
      document.head.appendChild(link);
    }

    fetch("http://localhost:8000/api/chefs")
      .then((res) => res.json())
      .then((data) => {
        setChefs(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setChefs([]);
      });
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hero band */}
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

      {/* Map and list here */}
      <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", border: "0.5px solid #EF9F27", borderRadius: 16, overflow: "hidden", height: "65vh", minHeight: 400 }}>
          {/* Map */}
          <div style={{ height: "100%" }}>
            <Map
              chefs={sortedChefs}
              selectedChef={selected}
              onSelectChef={setSelected}
            />
          </div>

          {/* Chef list */}
          <div style={{ overflowY: "auto", background: "#FFF8ED", borderLeft: "0.5px solid #EF9F27" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid #FAC775" }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#BA7517", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {chefs.length} chef{chefs.length !== 1 ? "s" : ""} nearby
              </p>
            </div>

            {chefs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <i className="ti ti-map-pin-off" style={{ fontSize: 36, color: "#EF9F27" }} aria-hidden="true" />
                <p style={{ fontSize: 14, color: "#633806", marginTop: "1rem" }}>
                  No chefs found in this area.
                </p>
              </div>
            ) : (
              sortedChefs.map((chef) => {
                const isSponsored = Boolean(chef.is_sponsored);

                return (
                  <div
                    key={chef.chef_id}
                    onClick={() => setSelected(chef.chef_id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "0.9rem 1.25rem",
                      borderBottom: "0.5px solid #FAC775",
                      cursor: "pointer",
                      background: selected === chef.chef_id ? "#FAEEDA" : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <img
                      src={chef.profile_pic_file_path}
                      alt={chef.name}
                      style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #EF9F27", flexShrink: 0 }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#412402", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {chef.name}
                        {isSponsored && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#BA7517",
                              background: "#FAEEDA",
                              border: "0.5px solid #FAC775",
                              borderRadius: 999,
                              padding: "2px 6px",
                              marginLeft: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              fontWeight: 600,
                            }}
                          >
                            Sponsored
                          </span>
                        )}
                      </p>

                      <p style={{ fontSize: 12, color: "#633806", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {chef.address}
                      </p>

                      {chef.food_specialty && (
                        <p style={{ fontSize: 12, color: "#BA7517", margin: "0 0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {chef.food_specialty}
                        </p>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/hire-chef", { state: { chefId: chef.chef_id } });
                        }}
                        style={{
                          background: "#FF5733",
                          color: "#fff",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Request
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
