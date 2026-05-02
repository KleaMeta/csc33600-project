import { useState } from "react";
import { TextInput, Label, Button } from "flowbite-react";
// import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://127.0.0.1:8000";

function Chef_Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        const newErrors = {};
        let hasError = false;

        // ✅ validation (same pattern as your form)
        if (!formData.email) {
            newErrors.email = "Email is required.";
            hasError = true;
        }

        if (!formData.password) {
            newErrors.password = "Password is required.";
            hasError = true;
        }

        setErrors(newErrors);

        if (!hasError) {
            try {
                setIsSubmitting(true);

                const response = await fetch(`${BACKEND_URL}/chef-login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    let errorMessage = "Login failed.";

                    try {
                        const errorData = await response.json();
                        if (errorData.detail) {
                            errorMessage = errorData.detail;
                        }
                    } catch { }

                    throw new Error(errorMessage);
                }

                const data = await response.json();

                console.log("Logged in:", data);

                navigate("/requests");
                // 👉 later you can:
                // navigate("/dashboard")
                // or store token

            } catch (error) {
                setSubmitError(error.message);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="flex justify-center p-8">
            <form
                onSubmit={handleSubmit}
                className="space-y-4 p-8 bg-white rounded-lg shadow-lg w-full max-w-md"
            >
                <h1 className="text-3xl font-bold mb-4">Chef Login</h1>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <TextInput
                        id="email"
                        type="email"
                        placeholder="chef@email.com"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        required
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="password">Password</Label>
                    <TextInput
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        required
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </Button>

                {submitError && (
                    <p className="text-red-500 text-sm">{submitError}</p>
                )}
            </form>
        </div>
    );
}

export default Chef_Login;