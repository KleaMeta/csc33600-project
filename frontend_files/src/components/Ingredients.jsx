import React, { useState } from "react";
function IngredientTagInput() {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const addTag = () => {
    const newTag = input.trim();

    if (!newTag) return;

    if (tags.includes(newTag)) {
      setError("Tag already exists");

      setTimeout(() => {
        setError("");
      }, 2000);

      return;
    }

    setTags((prev) => [...prev, newTag]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }

    if (e.key === "Backspace" && !input && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const deleteTag = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-md space-y-2">
      <label
        htmlFor="tag-input"
        className="block text-sm font-medium text-gray-700"
      >
        Enter Ingredients
      </label>

      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
          >
            <span>{tag}</span>

            <button
              onClick={() => deleteTag(index)}
              className="font-bold hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}

        <input
          id="tag-input"
          type="text"
          placeholder="Type and press enter..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow min-w-[120px] outline-none"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
}
export default IngredientTagInput;
