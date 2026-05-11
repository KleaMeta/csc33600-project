import { useEffect } from "react";
import { Link } from "react-router-dom";

const FONT_URL =
    "https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap";

const styles = {
    wrap: {
        fontFamily: "'DM Sans', sans-serif",
        color: "inherit",
    },
    heroBand: {
        background: "#FFF8ED",
        borderBottom: "0.5px solid #FAC775",
        padding: "3rem 2rem",
        textAlign: "center",
    },
    heroTitle: {
        fontFamily: "'Pacifico', cursive",
        fontSize: 36,
        color: "#BA7517",
        margin: "0 0 0.75rem",
        fontWeight: 400,
    },
    heroSub: {
        fontSize: 16,
        color: "#633806",
        maxWidth: 520,
        margin: "0 auto",
        lineHeight: 1.7,
    },
    section: {
        padding: "2.5rem 2rem",
        maxWidth: 720,
        margin: "0 auto",
    },
    sectionLabel: {
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "#BA7517",
        marginBottom: "0.4rem",
        fontWeight: 500,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 500,
        margin: "0 0 1rem",
    },
    sectionBody: {
        fontSize: 15,
        lineHeight: 1.8,
        color: "#555",
        maxWidth: 580,
    },
    divider: {
        border: "none",
        borderTop: "0.5px solid #FAC775",
        margin: 0,
    },
    valuesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12,
        marginTop: "1.25rem",
    },
    valueCard: {
        background: "#FAEEDA",
        border: "0.5px solid #EF9F27",
        borderRadius: 12,
        padding: "1rem",
    },
    valueIcon: {
        fontSize: 22,
        color: "#BA7517",
        marginBottom: 8,
    },
    valueTitle: {
        fontSize: 14,
        fontWeight: 500,
        color: "#412402",
        marginBottom: 4,
    },
    valueDesc: {
        fontSize: 13,
        color: "#633806",
        lineHeight: 1.5,
        margin: 0,
    },
    stepsList: {
        display: "flex",
        flexDirection: "column",
        marginTop: "1.25rem",
    },
    stepRow: {
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        padding: "1rem 0",
        borderBottom: "0.5px solid #FAC775",
    },
    stepNum: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#FF5733",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 500,
        flexShrink: 0,
    },
    stepContentTitle: {
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 3,
    },
    stepContentDesc: {
        fontSize: 13,
        color: "#666",
        lineHeight: 1.5,
        margin: 0,
    },
    teamGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",  // ✅ force 6 columns
        gap: 12,
        marginTop: "1.25rem",
    },
    teamCard: {
        background: "#fff",
        border: "0.5px solid #e5e7eb",
        borderRadius: 12,
        padding: "1rem",
        textAlign: "center",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "#FAEEDA",
        border: "2px solid #EF9F27",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 10px",
        fontSize: 15,
        fontWeight: 500,
        color: "#BA7517",
    },
    teamName: {
        fontSize: 14,
        fontWeight: 500,
        margin: 0,
    },
    ctaBand: {
        background: "#FF5733",
        padding: "3rem 2rem",
        textAlign: "center",
    },
    ctaTitle: {
        fontFamily: "'Pacifico', cursive",
        fontSize: 28,
        color: "#fff",
        margin: "0 0 0.75rem",
        fontWeight: 400,
    },
    ctaSub: {
        fontSize: 15,
        color: "#FFE0D8",
        margin: "0 0 1.5rem",
    },
    ctaBtn: {
        background: "#F0D813",
        color: "#412402",
        border: "none",
        padding: "10px 28px",
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        textDecoration: "none",
        display: "inline-block",
    },
};

const values = [
    {
        icon: "ti ti-heart",
        title: "Community first",
        desc: "Real relationships between chefs and customers are at the center of everything we do.",
    },
    {
        icon: "ti ti-shield-check",
        title: "Trust & safety",
        desc: "Every chef on our platform is vetted and reviewed before going live.",
    },
    {
        icon: "ti ti-award",
        title: "Quality always",
        desc: "We hold ourselves to the same standard we expect from every chef we work with.",
    },
    {
        icon: "ti ti-accessible",
        title: "Accessible dining",
        desc: "Great cooking shouldn't be a luxury. We keep pricing fair for everyone.",
    },
];

const steps = [
    {
        title: "Post your request",
        desc: "Tell us your date, budget, dietary needs, and what you're dreaming of eating.",
    },
    {
        title: "A chef accepts",
        desc: "A professional chef reviews your request and confirms the booking.",
    },
    {
        title: "Enjoy your meal",
        desc: "Sit back while your chef handles everything — cooking, plating, even cleanup.",
    },
];

const team = [
    { initials: "B", name: "Bekbol" },
    { initials: "BR", name: "Brian" },
    { initials: "D", name: "Daniel" },
    { initials: "G", name: "Gaurav" },
    { initials: "K", name: "Klea" },
    { initials: "N", name: "Nur" },
];

function About() {
    useEffect(() => {
        if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = FONT_URL;
            document.head.appendChild(link);
        }
    }, []);

    return (
        <div style={styles.wrap}>

            {/* Hero Page right here */}
            <div style={styles.heroBand}>
                <h1 style={styles.heroTitle}>About Cheffy</h1>
                <p style={styles.heroSub}>
                    We connect people who love great food with the talented chefs who can
                    make it happen — right in your own home.
                </p>
            </div>

            {/* Here are our Missions! */}
            <div style={styles.section}>
                <p style={styles.sectionLabel}>Our mission</p>
                <h2 style={styles.sectionTitle}>
                    Bringing restaurant-quality cooking to your table
                </h2>
                <p style={styles.sectionBody}>
                    Cheffy was born from a simple belief: everyone deserves a personal
                    chef experience. Whether it's a birthday dinner, weekly meal prep, or
                    a special celebration, we make it easy to connect with a professional
                    who truly cares about your food.
                </p>
            </div>

            <hr style={styles.divider} />

            {/* Our Core Values Here */}
            <div style={styles.section}>
                <p style={styles.sectionLabel}>What we stand for</p>
                <h2 style={styles.sectionTitle}>Our values</h2>
                <div style={styles.valuesGrid}>
                    {values.map((v) => (
                        <div key={v.title} style={styles.valueCard}>
                            <div style={styles.valueIcon}>
                                <i className={v.icon} aria-hidden="true" />
                            </div>
                            <p style={styles.valueTitle}>{v.title}</p>
                            <p style={styles.valueDesc}>{v.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <hr style={styles.divider} />

            {/* How it works section */}
            <div style={styles.section}>
                <p style={styles.sectionLabel}>How it works</p>
                <h2 style={styles.sectionTitle}>Three steps to your perfect meal</h2>
                <div style={styles.stepsList}>
                    {steps.map((s, i) => (
                        <div
                            key={s.title}
                            style={{
                                ...styles.stepRow,
                                ...(i === steps.length - 1 ? { borderBottom: "none" } : {}),
                            }}
                        >
                            <div style={styles.stepNum}>{i + 1}</div>
                            <div>
                                <p style={styles.stepContentTitle}>{s.title}</p>
                                <p style={styles.stepContentDesc}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr style={styles.divider} />

            {/* Our Team */}
            <div style={styles.section}>
                <p style={styles.sectionLabel}>The team</p>
                <h2 style={styles.sectionTitle}>Built by people who love food</h2>
                <div style={styles.teamGrid}>
                    {team.map((member) => (
                        <div key={member.name} style={styles.teamCard}>
                            <div style={styles.avatar}>{member.initials}</div>
                            <p style={styles.teamName}>{member.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call To Action here */}
            <div style={styles.ctaBand}>
                <h2 style={styles.ctaTitle}>Ready to eat well?</h2>
                <p style={styles.ctaSub}>
                    Join hundreds of happy customers already using Cheffy.
                </p>
                <Link to="/hire-chef" style={styles.ctaBtn}>
                    Hire a Chef
                </Link>
            </div>

        </div>
    );
}
export default About;