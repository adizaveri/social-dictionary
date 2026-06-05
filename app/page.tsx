"use client";

import { useEffect, useState } from "react";
import { 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  sendSignInLinkToEmail, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile, createUserProfile, getUserDictionaries } from "../lib/firestoreUtils";
import { UserProfile, Dictionary } from "../types";
import InstallPrompt from "./components/InstallPrompt";
import CreateDictionaryModal from "./components/CreateDictionaryModal";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Helper function to fetch and set dictionaries cleanly
  const loadDictionaries = async (userId: string) => {
    const userDicts = await getUserDictionaries(userId);
    setDictionaries(userDicts);
  };

  // 1. Auth Listener & Magic Link Handler
  useEffect(() => {
    const handleAuth = async () => {
      // Check if the user is returning from a Magic Link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let savedEmail = window.localStorage.getItem('emailForSignIn');
        if (!savedEmail) {
          savedEmail = window.prompt('Please provide your email for confirmation');
        }
        
        if (savedEmail) {
          try {
            await signInWithEmailLink(auth, savedEmail, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            // Remove the magic link parameters from the URL
            window.history.replaceState(null, '', window.location.pathname);
          } catch (error) {
            console.error("Error signing in with link", error);
          }
        }
      }
    };

    handleAuth();

    // Listen for standard auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setUserProfile(profile);
          await loadDictionaries(currentUser.uid);
        } else {
          // User is authenticated but has no profile (Brand new user)
          setNeedsName(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Send Magic Link
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setLinkSent(true);
    } catch (error) {
      console.error("Error sending email link", error);
      alert("Failed to send login link. Please try again.");
    }
    setLoading(false);
  };

  // 3. Save New User Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;
    
    setLoading(true);
    try {
      await createUserProfile(user.uid, user.email!, displayName.trim());
      const newProfile = await getUserProfile(user.uid);
      setUserProfile(newProfile);
      setNeedsName(false);
    } catch (error) {
      console.error("Error saving profile", error);
    }
    setLoading(false);
  };

  // ---------------------------------------------------------
  // RENDER: Loading State
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center font-sans text-black">
        <p className="font-bold text-xl animate-pulse">Loading...</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // RENDER: Unauthenticated (Login Screen)
  // ---------------------------------------------------------
  if (!user) {
    return (
      <main className="min-h-screen bg-[#F5F5DC] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white border-2 border-black rounded-xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-3xl font-bold mb-2 text-black lowercase">social dictionary.</h1>
          <p className="text-gray-600 mb-6 text-sm">A collaborative space for words.</p>
          
          {linkSent ? (
            <div className="bg-[#F5F5DC] border-2 border-black p-4 rounded-xl text-center">
              <p className="font-bold text-black">Check your email!</p>
              <p className="text-sm mt-2">We sent a magic link to {email}. Click it to securely log in.</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-black lowercase">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-black rounded-xl p-3 bg-gray-50 focus:outline-none focus:bg-[#F5F5DC] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#F5F5DC] border-2 border-black rounded-xl p-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              >
                Send Magic Link
              </button>
            </form>
          )}
        </div>
        <InstallPrompt />
      </main>
    );
  }

  // ---------------------------------------------------------
  // RENDER: Needs Display Name (First Time Setup)
  // ---------------------------------------------------------
  if (needsName) {
    return (
      <main className="min-h-screen bg-[#F5F5DC] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white border-2 border-black rounded-xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-bold mb-4 text-black lowercase">welcome.</h2>
          <p className="text-gray-600 mb-6 text-sm">What should we call you?</p>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <input 
                type="text" 
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border-2 border-black rounded-xl p-3 bg-gray-50 focus:outline-none focus:bg-[#F5F5DC] transition-colors"
                placeholder="Display Name"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#F5F5DC] border-2 border-black rounded-xl p-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
            >
              Complete Profile
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // RENDER: Main Dashboard
  // ---------------------------------------------------------
  return (
    <main className="min-h-screen bg-[#F5F5DC] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b-2 border-black pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-black lowercase">your dictionaries.</h1>
          <div className="flex items-center gap-4">
            <span className="font-bold text-sm bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {userProfile?.displayName}
            </span>
            <button 
              onClick={() => auth.signOut()}
              className="text-sm font-bold underline hover:text-gray-600"
            >
              log out
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        {dictionaries.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-xl p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-gray-600 mb-4">You aren&apost in any dictionaries yet.</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#F5F5DC] border-2 border-black rounded-xl px-6 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
            >
              + Create Dictionary
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#F5F5DC] border-2 border-black rounded-xl px-4 py-2 font-bold text-sm text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
              >
                + New Dictionary
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dictionaries.map((dict) => (
                <div 
                  key={dict.id}
                  className="bg-white border-2 border-black rounded-xl p-6 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold lowercase mb-2">{dict.name}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{dict.language}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {isCreateModalOpen && user && (
        <CreateDictionaryModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          userId={user.uid}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            loadDictionaries(user.uid);
          }}
        />
      )}
      
      <InstallPrompt />
    </main>
  );
}