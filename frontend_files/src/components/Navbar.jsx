import {
  Navbar as FlowbiteNavbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Button,
  Dropdown,
  DropdownItem,
} from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function Navbar({ submissions, bookings }) {
  const { authUser, isChef, isCustomer, isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activityCount = isChef
    ? submissions.length + bookings.length
    : bookings.length;

  const accentColor = isChef ? "#FF5733" : "#ad9e28";

  const linkStyle = (path) => ({
    color: location.pathname === path ? accentColor : "#374151",
    fontWeight: location.pathname === path ? 600 : 400,
  });

  const activityStyle = {
    color: location.pathname === "/activity" ? accentColor : "#374151",
    fontWeight: location.pathname === "/activity" ? 600 : 400,
  };

  const hoverHandlers = (path) => ({
    onMouseEnter: (e) => {
      if (location.pathname !== path) {
        e.currentTarget.style.color = accentColor;
      }
    },
    onMouseLeave: (e) => {
      if (location.pathname !== path) {
        e.currentTarget.style.color = "#374151";
      }
    },
  });

  return (
    <FlowbiteNavbar fluid rounded className="border border-gray-300">
      <NavbarBrand as={Link} to="/">
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
                : "bg-yellow-100 text-yellow-900 border-yellow-300"
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
        <NavbarLink
          as={Link}
          to="/"
          active={false}
          style={linkStyle("/")}
          {...hoverHandlers("/")}
        >
          Home
        </NavbarLink>

        <NavbarLink
          as={Link}
          to="/map"
          active={false}
          style={linkStyle("/map")}
          {...hoverHandlers("/map")}
        >
          Map
        </NavbarLink>

        <NavbarLink
          as={Link}
          to="/About"
          active={false}
          style={linkStyle("/About")}
          {...hoverHandlers("/About")}
        >
          About
        </NavbarLink>



        <NavbarLink
          as={Link}
          to="/reviews"
          active={false}
          style={linkStyle("/reviews")}
          {...hoverHandlers("/reviews")}
        >
          Reviews
        </NavbarLink>

        {isLoggedIn && (
          <Dropdown
            inline
            label={
              <span
                style={activityStyle}
                onMouseEnter={(e) => {
                  if (location.pathname !== "/activity") {
                    e.currentTarget.style.color = accentColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== "/activity") {
                    e.currentTarget.style.color = "#374151";
                  }
                }}
              >
                Activity ({activityCount})
              </span>
            }
          >
            {isChef && (
              <DropdownItem onClick={() => navigate("/activity?tab=requests")}>
                Open Requests ({submissions.length})
              </DropdownItem>
            )}

            <DropdownItem onClick={() => navigate("/activity?tab=bookings")}>
              Bookings ({bookings.length})
            </DropdownItem>
          </Dropdown>
        )}
      </NavbarCollapse>
    </FlowbiteNavbar>
  );
}

export default Navbar;
