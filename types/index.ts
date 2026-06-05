/**
 * UserProfile represents the authenticated user's data in Firestore.
 * Database Path: /users/{uid}
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  languagePreference: 'en' | 'fr'; // Controls the App UI language
  notificationPreferences: {
    wordAdded: boolean; // Default: false. Sent when a word is added to a shared dictionary.
    userJoins: boolean; // Default: true. Sent when someone new joins a shared dictionary.
    newComment: 'off' | 'on' | 'owned_words'; // Granular comment push settings.
  };
  fcmToken?: string; // Stores the active Firebase Cloud Messaging token.
}

/**
 * Dictionary represents a shared collection of words.
 * Database Path: /dictionaries/{id}
 */
export interface Dictionary {
  id: string;
  name: string;
  language: string; // The strict language rule for this dictionary (e.g., 'en', 'fr', 'es')
  ownerId: string; // The UID of the user who created it
  members: string[]; // Array of UIDs that have read/write access
  createdAt: number; // Unix timestamp
}

/**
 * Word represents a single dictionary entry.
 * Database Path: /dictionaries/{dictionaryId}/words/{wordId}
 */
export interface Word {
  id: string;
  dictionaryId: string;
  word: string;
  definition: string; // Constrained to a single main definition for the UI
  addedByUserId: string; // The UID of the user who contributed the word
  createdAt: number;
  commentCount: number; // Denormalized count to easily render the bubble on the UI row
  personalNotes?: string; // Optional private notes for the user
}

/**
 * Comment represents a message in the real-time discussion section of a word.
 * Database Path: /dictionaries/{dictionaryId}/words/{wordId}/comments/{commentId}
 */
export interface Comment {
  id: string;
  wordId: string;
  userId: string;
  text: string;
  createdAt: number;
}