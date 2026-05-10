import {
  Navbar as FlowbiteNavbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Button,
} from "flowbite-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function Navbar({ submissions, bookings }) {
  const { authUser, isChef, isCustomer, isLoggedIn, logout } = useAuth();

  return (
    <FlowbiteNavbar fluid rounded className="border border-gray-300">
      <NavbarBrand href="/">
        <span
          style={{ backgroundColor: "#FFFFFF", color: "#FF5733" }}
          className="self-center whitespace-nowrap text-xl logo"
        >
          Cheffy
        </span>
      </NavbarBrand>

      <div className="flex md:order-2 items-center gap-2">
        {isLoggedIn ? (
          <>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${authUser?.role === "chef"
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-blue-100 text-blue-900 border-blue-300"
                }`}
            >
              {authUser?.role === "chef" ? "Chef" : "Customer"}
            </span>
            <Button
              style={{ backgroundColor: "#FF5733", color: "#000000" }}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={logout}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            style={{ backgroundColor: "#FF5733", color: "#000000" }}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <Link to="/login">Login</Link>
          </Button>
        )}
        {isCustomer && (
          <Button style={{ backgroundColor: "#F0D813", color: "#000000" }}>
            <Link to="/hire-chef">Hire a Chef</Link>
          </Button>
        )}
        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <NavbarLink as={Link} to="/">
          Home
        </NavbarLink>
        <NavbarLink as={Link} to="/map">
          Map
        </NavbarLink>
        
        <NavbarLink as={Link} to="/chat">
          Chat
        </NavbarLink>


        <NavbarLink as={Link} to="/About">
          About
        </NavbarLink>

        

        {isChef && (
          <NavbarLink as={Link} to="/Requests">
            Open Requests ({submissions.length})
          </NavbarLink>
        )}

        {isLoggedIn && (
          <NavbarLink as={Link} to="/Bookings">
            Bookings ({bookings.length})
          </NavbarLink>
        )}
      </NavbarCollapse>
    </FlowbiteNavbar>
  );
}

export default Navbar;
