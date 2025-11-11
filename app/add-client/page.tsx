"use client";
import React, { useState } from "react";
import { addClient } from "@/context/clientApi";
import { sendWelcomeEmail } from "@/context/emailApi";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

const AddClientPage = () => {
  const { isAdmin, token } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isAdmin) {
    return <div className="p-8">Unauthorized</div>;
  }

  if (!token) {
    return <div className="p-8">Loading authentication...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Generate a random password for the client
      const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
      
      // Call API to create user in Supabase Auth
      let authToken = token;
      
      // Fallback: get token from localStorage if not available from context
      if (!authToken) {
        try {
          const storedAuth = localStorage.getItem("sb-duzgaclqdfsyxmyzgemy-auth-token");
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            authToken = authData.access_token;
          }
        } catch (e) {
          console.error("Error parsing stored auth:", e);
        }
      }
      
      if (!authToken) {
        throw new Error("No authentication token found. Please login again.");
      }
      
      console.log("Using token:", authToken.substring(0, 20) + "...");
      
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email,
          password: tempPassword,
          name,
          business_name: business,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("API Error:", data);
        throw new Error(data.error || "Failed to create user");
      }

      const result = await response.json();
      console.log("User created successfully:", result);

      // Send welcome email with credentials
      await sendWelcomeEmail(email, name, business);
      
      setSuccess(`Client added! Temporary password: ${tempPassword}`);
      setName("");
      setEmail("");
      setBusiness("");
      setTimeout(() => router.push("/clients"), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to add client");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Add New Client</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}
          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Business Name"
            value={business}
            onChange={e => setBusiness(e.target.value)}
            required
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Client"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddClientPage;
