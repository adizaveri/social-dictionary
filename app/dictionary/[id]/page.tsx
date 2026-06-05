"use client";

import { useState } from "react";

// For local development, use:
// import { verifyAndFetchWord } from "../../lib/dictionaryApi";
// import { addWordToDictionary } from "../../lib/firestoreUtils";

const verifyAndFetchWord = async (word: string, languageCode: string) => {
  return new Promise<string | null>((resolve) => setTimeout(() => resolve("A mocked definition for " + word), 800));
};

const addWordToDictionary = async (dictionaryId: string, word: string, definition: string, userId: string) => {
  return new Promise<string>((resolve) => setTimeout(() => resolve("mock-word-id"), 800));
};

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  dictionaryId: string;
  dictionaryLanguage: string;
  userId: string;
  onSuccess: () => void;
}

export default function AddWordModal({ 
  isOpen, 
  onClose, 
  dictionaryId, 
  dictionaryLanguage, 
  userId, 
  onSuccess 
}: AddWordModalProps) {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!word.trim()) {
      setError("Please enter a word.");
      return;
    }

    setLoading(true);
    
    try {
      // 1. Verify the language and fetch the definition from the API
      const definition = await verifyAndFetchWord(word.trim(), dictionaryLanguage);
      
      if (!definition) {
        // The API returned a 404, so we block the addition!
        setError(`"${word.trim()}" is not recognized as a valid word in this dictionary's language (${dictionaryLanguage.toUpperCase()}).`);
        setLoading(false);
        return;
      }

      // 2. If valid, save it to Firestore
      await addWordToDictionary(dictionaryId, word.trim(), definition, userId);
      
      // 3. Clean up and refresh the list
      setWord("");
      onSuccess();
    } catch (err) {
      console.error("Error adding word:", err);
      setError("Failed to add word. Please try again.");
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
        <h2 className="text-xl font-bold mb-4 border-b-2 border-black pb-2 text-black lowercase">add word.</h2>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm font-bold shadow-[2px_2px_0px_0px_rgba(185,28,28,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-black lowercase">Word</label>
            <input 
              type="text" 
              value={word}
              onChange={(e) => setWord(e.target.value)}
              disabled={loading}
              className="w-full border-2 border-black rounded-xl p-3 bg-white focus:outline-none focus:bg-gray-50 transition-colors"
              placeholder="Type a word..."
            />
            <p className="text-xs text-gray-600 mt-2 font-medium italic">
              We will automatically fetch the definition if it matches the dictionary language.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white border-2 border-black rounded-xl p-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2"
          >
            {loading ? "Verifying & Adding..." : "Add Word"}
          </button>
        </form>
      </div>
    </div>
  );
}