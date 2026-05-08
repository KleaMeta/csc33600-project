import { Button } from "flowbite-react";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Are you a chef or a Customer?</h1>
      <p className="mt-4">Please select below.</p>

      <div className="flex justify-center gap-4">
        <Button as={Link} to="/chef-login" color="blue">
          Chef
        </Button>

        <Button as={Link} to="/customer-login" color="gray">
          Customer
        </Button>
      </div>
    </div>
  );
}

export default Login;
