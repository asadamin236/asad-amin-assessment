"use client";
import Image from "next/image";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const { token, isAdmin } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (token) {
      // Redirect both admin and regular users to clients page
      router.replace("/clients");
    }
  }, [token, router]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96 mt-8">
          <h1 className="text-black font-bold text-2xl mb-4">Welcome to the Client Portal</h1>
          {!token ? (
            <>
              <p className="mb-4">Admin login is required to manage clients.</p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              <p className="mb-4">You are logged in as <span className="font-semibold">{isAdmin ? "Admin" : "Client"}</span>.</p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => router.push("/clients")}
              >
                View Clients
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

