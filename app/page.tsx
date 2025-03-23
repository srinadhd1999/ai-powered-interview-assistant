"use client";
import { useState } from "react";

export default function Home() {
  const [domain, setDomain] = useState("");

  const openConvAI = () => {
    if (!domain) {
      alert("Please enter a domain to start the interview.");
      return;
    }
    window.open(`/convai?domain=${encodeURIComponent(domain)}`, "_blank"); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800">Welcome</h1>
        <p className="text-gray-600 mb-4">Enter your domain and start your interview.</p>

        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain (e.g., Data Engineering)"
          className="border border-gray-300 p-2 rounded-md mb-4 w-full"
        />

        <button
          onClick={openConvAI}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Start your mock interview
        </button>
      </div>
    </div>
  );
}
