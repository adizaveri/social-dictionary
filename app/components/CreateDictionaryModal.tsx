"use client";

import { useState } from "react";

// For local development, use: import { createDictionary } from "../../lib/firestoreUtils";
const createDictionary = async (name: string, language: string, userId: string) => {
  return new Promise((resolve) => setTimeout(resolve, 800));
};

interface CreateDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export default function CreateDictionaryModal({ isOpen, onClose, userId, onSuccess }: CreateDictionaryModalProps) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim()) {
      setError("Dictionary name is required.");
      return;
    }

    setLoading(true);
    try {
      await createDictionary(name.trim(), language, userId);
      // Reset form after successful creation
      setName("");
      setLanguage("en");
      onSuccess();
    } catch (err) {
      console.error("Error creating dictionary:", err);
      setError("Failed to create dictionary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
      <div className="bg-[#F5F5DC] border-2 border-black rounded-xl p-6 max-w-sm w-full relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button 
          onClick={onClose}
          className="absolute top-2 right-3 font-bold text-2xl text-black hover:text-gray-600"
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 border-b-2 border-black pb-2 text-black lowercase">new dictionary.</h2>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-black lowercase">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full border-2 border-black rounded-xl p-3 bg-white focus:outline-none focus:bg-gray-50 transition-colors"
              placeholder="e.g. Slang Words, Verbes..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-black lowercase">Language Rule</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loading}
              className="w-full border-2 border-black rounded-xl p-3 bg-white focus:outline-none focus:bg-gray-50 transition-colors cursor-pointer"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
            </select>
            <p className="text-xs text-gray-600 mt-2 italic font-medium">
              Note: Only words recognized in this language can be added to this dictionary.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white border-2 border-black rounded-xl p-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}