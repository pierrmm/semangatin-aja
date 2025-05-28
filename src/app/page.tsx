"use client";

import { useState, useEffect } from "react";
import AdminLogin from "../components/AdminLogin";
import AdminPanel from "../components/AdminPanel";
import QuoteDisplay from "../components/QuoteDisplay";
import { fetchMotivationCount } from "../lib/supabase";
import { fetchQuotesFromDB } from "../lib/quotes";
import { Quote } from "../types";

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [motivationCount, setMotivationCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  
  useEffect(() => {
    // Load quotes
    const loadQuotes = async () => {
      const fetchedQuotes = await fetchQuotesFromDB();
      setQuotes(fetchedQuotes);
    };
    
    // Fetch motivation count
    const loadMotivationCount = async () => {
      const count = await fetchMotivationCount();
      setMotivationCount(count);
    };
    
    // Add script for canvas-confetti if it doesn't exist
    if (typeof window !== 'undefined' && !window.confetti) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Check if admin is logged in from localStorage
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      setAdminLoggedIn(isLoggedIn);
    }
    
    loadQuotes();
    loadMotivationCount();
  }, []);

  // Function to handle successful login
  const handleLoginSuccess = () => {
    setAdminLoggedIn(true);
    setShowAdminLogin(false);
    // Save login state to localStorage
    localStorage.setItem('adminLoggedIn', 'true');
  };
  
  // Admin logout
  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setIsAdmin(false);
    // Remove login state from localStorage
    localStorage.removeItem('adminLoggedIn');
  };

  return (
    <>
      {/* Admin login button */}
      <div className="absolute top-4 right-4 z-20">
        {!adminLoggedIn ? (
          <button 
            onClick={() => setShowAdminLogin(!showAdminLogin)} 
            className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm transition-all"
          >
            Admin
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
                          onClick={() => setIsAdmin(true)} 
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full transition-all"
            >
              Panel Admin
            </button>
            <button 
              onClick={handleAdminLogout} 
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Admin login modal */}
      {showAdminLogin && !adminLoggedIn && (
        <AdminLogin 
          onClose={() => setShowAdminLogin(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {/* Admin panel */}
      {isAdmin && adminLoggedIn && (
        <AdminPanel onClose={() => setIsAdmin(false)} />
      )}

      {/* Main quote display */}
      <QuoteDisplay 
        quotes={quotes} 
        motivationCount={motivationCount} 
        setMotivationCount={setMotivationCount} 
      />
    </>
  );
}