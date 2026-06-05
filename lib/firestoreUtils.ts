import { collection, doc, setDoc, getDoc, getDocs, addDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Dictionary, Word, Comment } from '../types';

// ==========================================
// USERS
// ==========================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(uid: string, email: string, displayName: string): Promise<void> {
  const newUser: UserProfile = {
    uid,
    email,
    displayName,
    languagePreference: 'en', // Default value
    notificationPreferences: {
      wordAdded: false,
      userJoins: true,
      newComment: 'owned_words',
    }
  };
  
  // setDoc is used instead of addDoc because we want the document ID to match the user's UID
  await setDoc(doc(db, 'users', uid), newUser);
}


// ==========================================
// DICTIONARIES
// ==========================================

export async function createDictionary(name: string, language: string, ownerId: string): Promise<string> {
  const dictRef = collection(db, 'dictionaries');
  
  // Omit the 'id' field initially, as Firestore will auto-generate it
  const newDictData = {
    name,
    language,
    ownerId,
    members: [ownerId], // Owner is automatically the first member
    createdAt: Date.now(),
  };
  
  const docRef = await addDoc(dictRef, newDictData);
  
  // Update the document to include its own generated ID for easier referencing later
  await setDoc(doc(db, 'dictionaries', docRef.id), { id: docRef.id }, { merge: true });
  
  return docRef.id;
}

export async function getUserDictionaries(userId: string): Promise<Dictionary[]> {
  const q = query(
    collection(db, 'dictionaries'),
    where('members', 'array-contains', userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Dictionary);
}


// ==========================================
// WORDS & COMMENTS
// ==========================================

export async function addWordToDictionary(dictionaryId: string, word: string, definition: string, userId: string): Promise<string> {
  const wordsRef = collection(db, `dictionaries/${dictionaryId}/words`);
  
  const newWordData = {
    dictionaryId,
    word,
    definition,
    addedByUserId: userId,
    createdAt: Date.now(),
    commentCount: 0,
  };
  
  const docRef = await addDoc(wordsRef, newWordData);
  
  // Merge the generated ID back into the document
  await setDoc(docRef, { id: docRef.id }, { merge: true });
  
  return docRef.id;
}

export async function getDictionaryWords(dictionaryId: string): Promise<Word[]> {
  // Queries words ordered by creation date (newest first)
  const q = query(
    collection(db, `dictionaries/${dictionaryId}/words`),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Word);
}

export async function deleteWord(dictionaryId: string, wordId: string): Promise<void> {
  const wordRef = doc(db, `dictionaries/${dictionaryId}/words`, wordId);
  await deleteDoc(wordRef);
}