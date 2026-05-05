import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import ChefForm from "./components/ChefForm.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import Requests from "./pages/Requests.jsx";
import Chef_Login from "./pages/Chef_Login.jsx";
import MapPage from "./pages/MapPage.jsx";


const BACKEND_URL = "http://127.0.0.1:8000";

export default function App() {
  const [submissions, setSubmissions] = useState([]);
  const [requestError, setRequestError] = useState("");

  const handleApprove = async (index) => {
    const requestToApprove = submissions[index];

    if (!requestToApprove?.request_id) {
      return;
    }

    setRequestError("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/requests/${requestToApprove.request_id}/approve`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        let errorMessage = "Could not approve the request.";

        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Fall back to the generic message if the backend returns no JSON.
        }

        throw new Error(errorMessage);
      }

      const updated = submissions.map((req, i) =>
        i === index
          ? { ...req, status: "approved", accepted: true }
          : req,
      );
      setSubmissions(updated);
    } catch (error) {
      setRequestError(error.message);
    }
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

            <Route path="/chef-login" element={<Chef_Login />} />

            <Route path="/MapPage" element={<MapPage />} />


            <Route
              path="/Requests"
              element={
                <Requests
                  submissions={submissions}
                  handleApprove={handleApprove}
                  handleDeny={handleDeny}
                  requestError={requestError}
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
