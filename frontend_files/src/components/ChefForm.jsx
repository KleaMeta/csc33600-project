import { useState } from "react";
import { TextInput, Label, Textarea } from "flowbite-react";
import { HiCalendar } from "react-icons/hi";
import TagInput from "./TagInput";
import chefImage from "../assets/pexels-sebastian-coman-photography-1598188-3717880.jpg";

function ChefForm({ submissions, setSubmissions }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    date: "",
    ingredients: [],
    equipment: [],
    summary: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
      hasError = true;
    }

    if (!formData.price || isNaN(formData.price)) {
      newErrors.price = "Price must be a number.";
      hasError = true;
    }

    if (!formData.date) {
      newErrors.date = "Date is required.";
      hasError = true;
    }

    if (formData.ingredients.length < 10) {
      newErrors.ingredients = "Please add at least ten ingredients.";
      hasError = true;
    }

    if (formData.equipment.length < 5) {
      newErrors.equipment = "Please add at least five equipment items.";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setSubmissions([...submissions, formData]);
      setSubmitted(true);
      setFormData({
        name: "",
        price: "",
        date: "",
        ingredients: [],
        equipment: [],
        summary: "",
      });
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
            <Label htmlFor="name">Username</Label>
            <TextInput
              id="name"
              type="text"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value.trimStart() })
              }
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

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
          >
            Submit Request
          </button>
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
