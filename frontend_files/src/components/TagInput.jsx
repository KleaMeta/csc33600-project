import { useState } from "react";

function TagInput({ label, field, formData, setFormData, error }) {
  const [input, setInput] = useState("");

  const tags = formData[field];

  const addTag = () => {
    const newTag = input.trim();
    if (!newTag) return;

    // Check if tag exists already
    if (formData[field].includes(newTag)) {
      setInput(""); // Clear input if there is a duplicate
      return;
    }

    // Add new tag to the necessary array which is ingredients or equipment
    setFormData({
      ...formData,
      [field]: [...formData[field], newTag],
    });

    setInput("");
  };

  const deleteTag = (index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }

    if (e.key === "Backspace" && input.trim() === "" && tags.length > 0) {
      deleteTag(tags.length - 1);
    }
  };

  return (
    <div>
      <label className="font-medium">{label}</label>

      <div className="flex flex-wrap gap-2 border p-2 rounded">
        {formData[field].map((tag, index) => (
          <span
            key={index}
            className="bg-blue-100 px-2 py-1 rounded flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => deleteTag(index)}
              className="text-red-500 font-bold"
            >
              x {/* KEEP THIS X, it is not random!!   */}
            </button>
          </span>
        ))}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Type and press enter...`}
          className="outline-none"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default TagInput;
