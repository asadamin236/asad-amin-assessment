import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAdmin, user, logout } = useAuth();
  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
      <div className="flex gap-4">
        <Link href="/">
          <span className="font-bold text-lg">Client Portal</span>
        </Link>
        {user && <Link href="/clients">Clients</Link>}
        {isAdmin && <Link href="/admin/dashboard">Admin Dashboard</Link>}
        {isAdmin && <Link href="/add-client">Add Client</Link>}
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm">
            Welcome, {isAdmin ? "Admin" : "User"}
          </span>
        )}
        {user ? (
          <button className="bg-red-500 px-3 py-1 rounded hover:bg-red-600" onClick={logout}>
            Logout
          </button>
        ) : (
          <Link href="/login" className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
