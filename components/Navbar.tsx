import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAdmin, user, logout } = useAuth();
  return (
    <nav className="bg-gray-800 text-white px-2 sm:px-4 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base">
          <Link href="/">
            <span className="font-bold text-base sm:text-lg">Client Portal</span>
          </Link>
          {user && <Link href="/clients" className="hover:text-blue-300">Clients</Link>}
          {isAdmin && <Link href="/admin/dashboard" className="hover:text-blue-300">Add New User</Link>}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-sm">
          {user && (
            <span className="text-xs sm:text-sm">
              Welcome, {isAdmin ? "Admin" : "User"}
            </span>
          )}
          {user ? (
            <button className="bg-red-500 px-2 sm:px-3 py-1 rounded hover:bg-red-600 text-xs sm:text-sm" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link href="/login" className="bg-blue-500 px-2 sm:px-3 py-1 rounded hover:bg-blue-600 text-xs sm:text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
