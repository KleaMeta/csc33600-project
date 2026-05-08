import { useState } from "react";
import { TextInput, Label, Textarea } from "flowbite-react";
import { HiCalendar } from "react-icons/hi";
import TagInput from "./TagInput";
import chefImage from "../assets/pexels-sebastian-coman-photography-1598188-3717880.jpg";
import { useAuth } from "../context/useAuth.js";

const BACKEND_URL = "http://127.0.0.1:8000";

function ChefForm({ submissions, setSubmissions }) {
  const { authUser, isCustomer } = useAuth();
  const [formData, setFormData] = useState({
    price: "",
    date: "",
    ingredients: [],
    equipment: [],
    summary: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors = {};
    let hasError = false;

    if (!formData.price || isNaN(formData.price)) {
      newErrors.price = "Price must be a number.";
      hasError = true;
    }

    if (!formData.date) {
      newErrors.date = "Date is required.";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      if (!isCustomer) {
        setSubmitError("Please log in as a customer before submitting a request.");
        return;
      }

      // Copy the current form values before any async work starts.
      const requestPayload = {
        ...formData,
        ingredients: [...formData.ingredients],
        equipment: [...formData.equipment],
      };

      try {
        setIsSubmitting(true);

        const response = await fetch(`${BACKEND_URL}/requests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Role": authUser?.role ?? "",
            "X-User-Id": authUser?.user_id ?? "",
          },
          body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
          let errorMessage = "Backend rejected the request.";

          try {
            const errorData = await response.json();
            if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch {
            // Fall back to the generic message if the response is not JSON.
          }

          throw new Error(errorMessage);
        }

        const responseData = await response.json();

        setSubmissions([
          ...submissions,
          {
            ...requestPayload,
            price: `$${parseFloat(requestPayload.price).toFixed(2)}`,
            request_id: responseData.request_id,
            accepted: false,
            status: "pending",
          },
        ]);
        setSubmitted(true);
        setFormData({
          price: "",
          date: "",
          ingredients: [],
          equipment: [],
          summary: "",
        });
      } catch (error) {
        setSubmitError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Thank you for submitting!
        </h2>
        <p className="text-gray-700">
          We received your request. A chef will contact you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-8">
      <div className="grid lg:grid-cols-[minmax(0,36rem)_32rem] p-8 max-w-screen-xl mx-auto shadow-lg overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-8 bg-white rounded-l-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-4">Hire a Chef</h1>

          <div>
            <Label htmlFor="price">Price</Label>
            <TextInput
              id="price"
              type="number"
              placeholder="200.00"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
            {errors.price && (
              <p className="text-red-500 text-sm">{errors.price}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <TextInput
              id="date"
              type="date"
              icon={HiCalendar}
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date}</p>
            )}
          </div>

          <TagInput
            label="Ingredients"
            field="ingredients"
            formData={formData}
            setFormData={setFormData}
            error={errors.ingredients}
          />

          <TagInput
            label="Equipment"
            field="equipment"
            formData={formData}
            setFormData={setFormData}
            error={errors.equipment}
          />

          <div>
            <Label htmlFor="comment">Request Summary</Label>
            <Textarea
              id="comment"
              placeholder="State the dishes that you want, eg. Shrimp Alfredo"
              rows={4}
              required
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            style={{ backgroundColor: "#FF5733", color: "#FFFFFF" }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>

          {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
        </form>

        <div className="hidden lg:flex overflow-hidden rounded-r-lg shadow-lg">
          <img
            src={chefImage}
            alt="Chef cooking"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default ChefForm;
