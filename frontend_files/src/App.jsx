import { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth.js";
import Footer from "./components/Footer.jsx";
import ChefForm from "./components/ChefForm.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import Chef_Login from "./pages/Chef_Login.jsx";
import Customer_Login from "./pages/Customer_Login.jsx";
import Admin_Login from "./pages/Admin_Login.jsx";
import MapPage from "./pages/MapPage.jsx";
import Activity from './pages/Activity.jsx';
import About from "./pages/About.jsx";
import Reviews from "./pages/Reviews.jsx";
import Chat from './components/Chat.jsx';
import Billing from './components/Financial_Hub.jsx';
import Revenue from './pages/Revenue.jsx';
import AdminDashboard from "./pages/AdminDashboard.jsx";

const BACKEND_URL = "http://127.0.0.1:8000";

function ChefOnlyRoute({ children }) {
  const { isChef } = useAuth();

  if (!isChef) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminOnlyRoute({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default function App() {
  const [submissions, setSubmissions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [requestError, setRequestError] = useState("");
  const { authUser } = useAuth();

  const isChef = authUser?.role === "chef";
  const isCustomer = authUser?.role === "customer";

  // Fetch submissions — chefs get all open requests, customers get their own
  const fetchSubmissions = useCallback(() => {
    if (!authUser?.user_id) return;

    const endpoint = isChef
      ? `${BACKEND_URL}/requests/open`
      : `${BACKEND_URL}/requests/my`;  // customer's own outgoing requests

    fetch(endpoint, {
      headers: {
        "X-User-Role": authUser.role,
        "X-User-Id": authUser.user_id,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          let message = "Could not load requests.";
          try {
            const errorData = await response.json();
            if (errorData.detail) message = errorData.detail;
          } catch { }
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
  }, [authUser, isChef]);

  // Fetch bookings — chefs get their approved bookings, customers get theirs
  const fetchBookings = useCallback(() => {
    if (!authUser?.user_id) return;

    fetch(`${BACKEND_URL}/requests/bookings`, {
      headers: {
        "X-User-Role": authUser.role,
        "X-User-Id": authUser.user_id,
      },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load bookings.");
        return response.json();
      })
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        setRequestError(error.message);
      });
  }, [authUser]);

  useEffect(() => {
    if (!authUser?.user_id) return;
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (!authUser?.user_id) return;
    fetchBookings();
  }, [fetchBookings]);

  const handleApprove = async (requestId) => {
    const requestToApprove = submissions.find((r) => r.request_id === requestId);
    if (!requestToApprove?.request_id) return;

    setRequestError("");

    try {
      const response = await fetch(`${BACKEND_URL}/requests/${requestId}/approve`, {
        method: "PATCH",
        headers: {
          "X-User-Role": authUser?.role ?? "",
          "X-User-Id": authUser?.user_id ?? "",
        },
      });

      if (!response.ok) {
        let errorMessage = "Could not approve the request.";
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMessage = errorData.detail;
        } catch { }
        throw new Error(errorMessage);
      }

      // Refetch both — removes it from chef's open requests AND customer's pending list
      await fetchBookings();
      await fetchSubmissions();

    } catch (error) {
      setRequestError(error.message);
    }
  };

  const handleDeny = (requestId) => {
    setSubmissions((prev) => prev.filter((r) => r.request_id !== requestId));
  };

  const handleCancel = async (requestId) => {
    if (!requestId) return;
    setRequestError("");

    try {
      const response = await fetch(`${BACKEND_URL}/requests/${requestId}/cancel`, {
        method: "PATCH",
        headers: {
          "X-User-Role": authUser?.role ?? "",
          "X-User-Id": authUser?.user_id ?? "",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Could not cancel booking.");
      }

      // Refetch both so UI updates for either role
      await fetchBookings();
      await fetchSubmissions();

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
                  onRequestCreated={fetchSubmissions}
                />
              }
            />

            <Route path="/About" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chef-login" element={<Chef_Login />} />
            <Route path="/customer-login" element={<Customer_Login />} />
            <Route path="/admin-login" element={<Admin_Login />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/billing" element={<Billing />} />
            <Route
              path="/revenue"
              element={(
                <ChefOnlyRoute>
                  <Revenue />
                </ChefOnlyRoute>
              )}
            />
            <Route
              path="/admin"
              element={(
                <AdminOnlyRoute>
                  <AdminDashboard />
                </AdminOnlyRoute>
              )}
            />

            <Route
              path="/activity"
              element={
                <Activity
                  submissions={submissions}
                  bookings={bookings}
                  handleApprove={handleApprove}
                  handleDeny={handleDeny}
                  handleCancel={handleCancel}
                  requestError={requestError}
                  bookingError={requestError}
                />
              }
            />

            <Route path="/MapPage" element={<MapPage />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Requests" element={<Navigate to="/activity" replace />} />
            <Route path="/Bookings" element={<Navigate to="/activity" replace />} />
            <Route path="/requests" element={<Navigate to="/activity" replace />} />
            <Route path="/bookings" element={<Navigate to="/activity" replace />} />
          </Routes>
        </main>
        <Chat />
        <Footer />
      </div>
    </Router>
  );
}
