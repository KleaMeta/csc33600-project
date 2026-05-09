import { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth.js";
import Footer from "./components/Footer.jsx";
import ChefForm from "./components/ChefForm.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import Requests from "./pages/Requests.jsx";
import Chef_Login from "./pages/Chef_Login.jsx";
import Customer_Login from "./pages/Customer_Login.jsx";
import MapPage from "./pages/MapPage.jsx";
import Bookings from "./pages/Bookings.jsx";
import About from './pages/About.jsx';

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
  const [bookings, setBookings] = useState([]);
  const [requestError, setRequestError] = useState("");
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser?.role !== "chef" || !authUser?.user_id) {
      return;
    }

    fetch(`${BACKEND_URL}/requests/open`, {
      headers: {
        "X-User-Role": authUser.role,
        "X-User-Id": authUser.user_id,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          let message = "Could not load open requests.";
          try {
            const errorData = await response.json();
            if (errorData.detail) {
              message = errorData.detail;
            }
          } catch {
            // Keep generic error message.
          }
          throw new Error(message);
        }
        return response.json();
      })
      .then((data) => {
        setSubmissions(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        setRequestError(error.message);
      });
  }, [authUser]);

  const handleApprove = async (index) => {
    const requestToApprove = submissions[index];

    if (!requestToApprove?.request_id) return;

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
        }
      );

      if (!response.ok) {
        let errorMessage = "Could not approve the request.";
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMessage = errorData.detail;
        } catch { }
        throw new Error(errorMessage);
      }

      const approvedReq = { ...submissions[index], status: "approved" };
      setBookings(prev => [...prev, approvedReq]);
      setSubmissions(prev => prev.filter((_, i) => i !== index));

    } catch (error) {
      setRequestError(error.message);
    }
  };

  const handleDeny = (index) => {
    const updated = submissions.filter((_, i) => i !== index);
    setSubmissions(updated);
  };

  // Backend please implemeent patch here to get bookings canceled
  // and some bookings tables
  const handleCancel = async (requestId) => {
    if (!requestId) return;
    setRequestError("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/requests/${requestId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "X-User-Role": authUser?.role ?? "",
            "X-User-Id": authUser?.user_id ?? "",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Could not cancel the booking.";
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMessage = errorData.detail;
        } catch { }
        throw new Error(errorMessage);
      }

      setBookings(prev => prev.filter(req => req.request_id !== requestId)); // ✅ inside try
    } catch (error) {
      setRequestError(error.message);
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar submissions={submissions} bookings={bookings} />

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

            <Route path="/About" element={<About />} />

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

            <Route
              path="/bookings"
              element={
                <Bookings
                  bookings={bookings}
                  handleCancel={handleCancel}
                  bookingError={requestError}
                />
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
