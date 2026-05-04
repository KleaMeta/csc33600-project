const TEST_MODE = true;
import { useState } from "react";
import { TextInput, Label, Textarea } from "flowbite-react";
import { HiCalendar } from "react-icons/hi";
import TagInput from "./TagInput";
import chefImage from "../assets/pexels-sebastian-coman-photography-1598188-3717880.jpg";

const BACKEND_URL = "http://127.0.0.1:8000";

function ChefForm({ submissions, setSubmissions }) {
  const [formData, setFormData] = useState({
    price: "",
    startDate: "", //Added field, date has been replaced with startDate and endDate
    endDate: "", //Added field, date has been replaced with startDate and endDate
    startTime: "", //Added field, included for time range
    endTime: "", //Added field, included for time range
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

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required.";
      hasError = true;
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required.";
      hasError = true;
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required.";
      hasError = true;
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required.";
      hasError = true;
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date cannot be before start date.";
      hasError = true;  //New line
    }
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = "End time must be after start time.";
      hasError = true; //@@@@New line
    }

    setErrors(newErrors);

    if (!hasError) {
      // @@@@ Copy the current form values before any async work starts.
      const requestPayload = {
        ...formData,
        ingredients: [...formData.ingredients],
        equipment: [...formData.equipment],
        // @@@@ now needed startDate, endDate, startTime, endTime
      };

      try {
        setIsSubmitting(true);

        if (TEST_MODE) {
          console.log("TEST MODE: Would send payload to backend:", requestPayload);

          // simulate successful backend response
          const responseData = { request_id: Math.floor(Math.random() * 10000) };

          setSubmissions([
            ...submissions,
            {
              ...requestPayload,
              request_id: responseData.request_id,
              accepted: false,
              status: "pending",
            },
          ]);

          setSubmitted(true);

          setFormData({
            price: "",
            startDate: "",
            endDate: "",
            startTime: "",
            endTime: "",
            ingredients: [],
            equipment: [],
            summary: "",
          });

        } else {
          // real backend request
          const response = await fetch(`${BACKEND_URL}/requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestPayload),
          });

          // ... rest of your original response handling ...
        }

        if (!response.ok) {
          let errorMessage = "Backend rejected the request.";

          try {
            const errorData = await response.json();
            if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch {
            // @@@@ Fall back to the generic message if the response is not JSON.
          }

          throw new Error(errorMessage);
        }

        const responseData = await response.json();

        // @@@@ Keep the local list for now so the Requests page still shows the submission.
        setSubmissions([
          ...submissions,
          {
            ...requestPayload,
            request_id: responseData.request_id,
            accepted: false,
            status: "pending",
          },
        ]);
        setSubmitted(true);
        setFormData({
          price: "",
          startDate: "", //@@@@New field
          endDate: "", //@@@@New field
          startTime: "", //@@@@New field
          endTime: "", //@@@@New field
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
  //Added fields for date and time range: startDate, endDate, startTime, endTime
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
            <Label htmlFor="startDate">Start Date</Label>
            <TextInput
              id="startDate"
              type="date"
              icon={HiCalendar}
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
            {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <TextInput
              id="endDate"
              type="date"
              icon={HiCalendar}
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <TextInput
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
          </div>

          <div>
            <Label htmlFor="endTime">End Time</Label>
            <TextInput
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              required
            />
            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
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
