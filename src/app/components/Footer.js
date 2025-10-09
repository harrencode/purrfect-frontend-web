"use client";

import { Facebook, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white w-full py-6 px-4 md:px-16">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-0">

        {/* Left Section */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-light">Purr-Fect</h1>
          <p className="text-sm text-gray-400 mt-1">© 2025 All Rights Reserved</p>
        </div>

        {/* Middle Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-center md:text-left">
          <a href="/rescues" className="hover:text-gray-300">Rescue Section</a>
          <a href="/map" className="hover:text-gray-300">Stray Map</a>
          <a href="/store" className="hover:text-gray-300">Store</a>
          <a href="/adoptions" className="hover:text-gray-300">Adopt Section</a>
          <a href="/leaderboard" className="hover:text-gray-300">Leaderboard</a>
          <a href="/lost-found" className="hover:text-gray-300">Lost & Found</a>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition"
          >
            <Facebook className="text-white w-5 h-5" />
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 p-2 rounded-full hover:bg-green-700 transition"
          >
            <MessageCircle className="text-white w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
