import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import ChefForm from "./components/ChefForm.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import Requests from "./pages/Requests.jsx";

export default function App() {
  const [submissions, setSubmissions] = useState([]);

  const handleApprove = (index) => {
    const updated = submissions.map((req, i) =>
      i === index ? { ...req, status: "approved" } : req,
    );
    setSubmissions(updated);
  };

  const handleDeny = (index) => {
    const updated = submissions.filter((_, i) => i !== index);
    setSubmissions(updated);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar submissions={submissions} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/hire-chef"
              element={
                <ChefForm
                  submissions={submissions}
                  setSubmissions={setSubmissions}
                />
              }
            />

            <Route path="/Login" element={<Login />} />

            <Route
              path="/Requests"
              element={
                <Requests
                  submissions={submissions}
                  handleApprove={handleApprove}
                  handleDeny={handleDeny}
                />
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
