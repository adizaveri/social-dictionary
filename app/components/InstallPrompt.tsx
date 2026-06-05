"use client";
import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [os, setOs] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Defer the OS check until strictly after the initial render cycle completes
    const checkOS = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (!isStandalone) {
          if (isIos) setOs('ios');
          else if (isAndroid) setOs('android');
        }
      }
    }, 0);

    // Cleanup the timeout if the component unmounts quickly
    return () => clearTimeout(checkOS);
  }, []);

  if (!os) return null;

  return (
    <>
      {/* The Beige Banner */}
      <div 
        className="fixed bottom-4 left-4 right-4 bg-[#F5F5DC] border-2 border-black rounded-xl p-4 text-center cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-40"
        onClick={() => setShowModal(true)}
      >
        <p className="font-bold text-black text-sm">Install App for the Best Experience</p>
      </div>

      {/* The OS-Specific Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-[#F5F5DC] border-2 border-black rounded-xl p-6 max-w-sm w-full relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              className="absolute top-2 right-3 font-bold text-2xl text-black hover:text-gray-600" 
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-black pb-2 text-black">Install Dictionary</h2>
            
            {os === 'ios' && (
              <div className="text-black text-sm space-y-3 font-medium">
                <p>1. Tap the <strong>Share</strong> button in your browser menu.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
              </div>
            )}

            {os === 'android' && (
              <div className="text-black text-sm space-y-3 font-medium">
                <p>1. Tap the <strong>Menu</strong> icon (three dots) in your browser.</p>
                <p>2. Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}