// import { useState } from "react";
// import ChefForm from "../components/ChefForm";
// import TagInput from "../components/TagInput";

// function Chef({ submissions, setSubmissions }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     price: "",
//     date: "",
//     ingredients: [],
//     equipment: [],
//   });

//   const [errors, setErrors] = useState({ ingredients: "", equipment: "" });
//   const [submitted, setSubmitted] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     let hasError = false;
//     const newErrors = { ingredients: "", equipment: "" };

//     if (formData.ingredients.length < 10) {
//       newErrors.ingredients = "Please add at least ten ingredients.";
//       hasError = true;
//     }

//     if (formData.equipment.length < 5) {
//       newErrors.equipment = "Please add at least five equipment items.";
//       hasError = true;
//     }

//     setErrors(newErrors);

//     if (!hasError) {
//       console.log("Form submitted successfully:", formData);
//       setSubmissions([...submissions, formData]);
//       setSubmitted(true); // show thank you message
//       setFormData({
//         name: "",
//         price: "",
//         date: "",
//         ingredients: [],
//         equipment: [],
//       });
//     }
//   };

//   return (
//     <div className="p-8 max-w-md mx-auto">
//       {!submitted ? (
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <h1 className="text-3xl font-bold">Hire a Chef</h1>
//           <p className="mb-6">Book a professional chef for your event.</p>

//           <ChefForm formData={formData} setFormData={setFormData} />

//           <TagInput
//             label="Enter Ingredients"
//             field="ingredients"
//             formData={formData}
//             setFormData={setFormData}
//             error={errors.ingredients}
//           />

//           <TagInput
//             label="Enter Equipment"
//             field="equipment"
//             formData={formData}
//             setFormData={setFormData}
//             error={errors.equipment}
//           />

//           <button
//             type="submit"
//             className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2 rounded-lg font-semibold"
//           >
//             Submit Request
//           </button>
//         </form>
//       ) : (
//         <div className="text-center p-8 bg-green-50 rounded-lg">
//           <h2 className="text-2xl font-bold text-green-700 mb-4">
//             Thank you for submitting!
//           </h2>
//           <p className="text-gray-700">
//             Your request has been recieved. A chef will contact you soon.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }
// export default Chef;
