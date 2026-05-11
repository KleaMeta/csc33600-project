import { useMemo, useState } from "react";
import { AuthContext } from "./authContextObject.js";

const AUTH_STORAGE_KEY = "cheffy_auth_user";

function readStoredUser() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(readStoredUser);

  const login = (user) => {
    setAuthUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      authUser,
      isLoggedIn: Boolean(authUser),
      isChef: authUser?.role === "chef",
      isCustomer: authUser?.role === "customer",
      login,
      logout,
    }),
    [authUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
