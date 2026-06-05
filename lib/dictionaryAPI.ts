/**
 * Interfaces to type the expected response from the Free Dictionary API
 */
export interface DictionaryApiResponse {
  word: string;
  meanings: {
    definitions: {
      definition: string;
    }[];
  }[];
}

/**
 * Verifies if a word exists in a specific language and fetches its primary definition.
 * * @param word The word the user is trying to add.
 * @param languageCode The ISO language code of the dictionary (e.g., 'en', 'fr', 'es').
 * @returns The first definition as a string, or null if the word is invalid/not found.
 */
export async function verifyAndFetchWord(word: string, languageCode: string): Promise<string | null> {
  // Clean up the input
  const sanitizedWord = word.trim().toLowerCase();

  try {
    // The Free Dictionary API supports en, hi, es, fr, ja, ru, en, de, it, ko, pt-BR, ar, tr, etc.
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${languageCode}/${sanitizedWord}`);

    // If the API returns a 404, it means the word is not recognized in this language's dictionary.
    if (!response.ok) {
      console.warn(`Word '${sanitizedWord}' not found in language '${languageCode}'.`);
      return null;
    }

    const data: DictionaryApiResponse[] = await response.json();

    // Extract the very first definition to keep our UI minimalist and clean
    const firstDefinition = data[0]?.meanings[0]?.definitions[0]?.definition;

    return firstDefinition || "Definition available, but could not be parsed.";
    
  } catch (error) {
    console.error("Error fetching dictionary data:", error);
    // Returning null strictly blocks the addition if the API fails or errors out.
    return null; 
  }
}