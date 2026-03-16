import {
  Navbar as FlowbiteNavbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Button,
} from "flowbite-react";
import { Link } from "react-router-dom";

function Navbar({ submissions }) {
  return (
    <FlowbiteNavbar fluid rounded className="border border-gray-300">
      <NavbarBrand href="/">
        <span
          style={{ backgroundColor: "#FFFFFF", color: "#FF5733" }}
          className="self-center whitespace-nowrap text-xl font-semibold text-blue-600"
        >
          Cheffy
        </span>
      </NavbarBrand>

      <div className="flex md:order-2 items-center gap-2">
        <Button
          style={{ backgroundColor: "#FF5733", color: "#000000" }}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          <Link to="/Login">Login</Link>
        </Button>
        <Button style={{ backgroundColor: "#F0D813", color: "#000000" }}>
          <Link to="/hire-chef">Hire a Chef</Link>
        </Button>
        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <NavbarLink as={Link} to="/">
          Home
        </NavbarLink>
        <NavbarLink href="#">About</NavbarLink>
        <NavbarLink as={Link} to="/Requests">
          Open Requests ({submissions.length})
        </NavbarLink>
      </NavbarCollapse>
    </FlowbiteNavbar>
  );
}

export default Navbar;
