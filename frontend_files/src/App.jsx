import { useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import ChefForm from "./components/ChefForm.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import Requests from "./pages/Requests.jsx";
import Chef_Login from "./pages/Chef_Login.jsx";
import Customer_Login from "./pages/Customer_Login.jsx";
import MapPage from "./pages/MapPage.jsx";
import { useAuth } from "./context/useAuth.js";

const BACKEND_URL = "http://127.0.0.1:8000";

function ChefOnlyRoute({ children }) {
  const { isChef } = useAuth();

  if (!isChef) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const [submissions, setSubmissions] = useState([]);
  const [requestError, setRequestError] = useState("");
  const { authUser } = useAuth();

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
          headers: {
            "X-User-Role": authUser?.role ?? "",
            "X-User-Id": authUser?.user_id ?? "",
          },
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

            <Route path="/login" element={<Login />} />

            <Route path="/chef-login" element={<Chef_Login />} />
            <Route path="/customer-login" element={<Customer_Login />} />

            <Route path="/map" element={<MapPage />} />

            <Route
              path="/requests"
              element={
                <ChefOnlyRoute>
                  <Requests
                    submissions={submissions}
                    handleApprove={handleApprove}
                    handleDeny={handleDeny}
                    requestError={requestError}
                  />
                </ChefOnlyRoute>
              }
            />

            <Route path="/MapPage" element={<Navigate to="/map" replace />} />
            <Route path="/Login" element={<Navigate to="/login" replace />} />
            <Route path="/Requests" element={<Navigate to="/requests" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
