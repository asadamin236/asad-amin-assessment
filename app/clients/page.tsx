"use client";
import React, { useEffect, useState } from "react";
import { getClients, Client, deleteClient, updateClient } from "@/context/clientApi";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const ClientsPage = () => {
  const { isAdmin, user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    business_name: "",
    role: "",
    new_password: ""
  });

  const setupDatabase = async () => {
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        console.log('Database setup completed');
        return true;
      }
    } catch (e) {
      console.error('Database setup failed:', e);
    }
    return false;
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
      setError(""); // Clear any previous errors
    } catch (e: any) {
      // If table doesn't exist, try to set up database
      if (e.message?.includes("table") || e.message?.includes("schema")) {
        console.log("Tables don't exist, setting up database...");
        const setupSuccess = await setupDatabase();
        if (setupSuccess) {
          // Try fetching again after setup
          try {
            const data = await getClients();
            setClients(data);
            setError("");
          } catch (retryError: any) {
            setError(retryError.message || "Failed to load clients after database setup");
          }
        } else {
          setError("Database setup failed. Please check your Supabase configuration.");
        }
      } else {
        setError(e.message || "Failed to load clients");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (email: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteClient(email);
      fetchClients();
    } catch (e: any) {
      setError(e.message || "Failed to delete user");
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setEditForm({
      name: client.name,
      business_name: client.business_name,
      role: client.role || "client",
      new_password: ""
    });
  };

  const handleUpdate = async () => {
    if (!editingClient) return;
    
    try {
      const updates: any = {};
      if (editForm.name !== editingClient.name) updates.name = editForm.name;
      if (editForm.business_name !== editingClient.business_name) updates.business_name = editForm.business_name;
      if (editForm.role !== editingClient.role) updates.role = editForm.role;
      if (editForm.new_password) updates.new_password = editForm.new_password;

      await updateClient(editingClient.email, updates);
      setEditingClient(null);
      fetchClients();
    } catch (e: any) {
      setError(e.message || "Failed to update user");
    }
  };

  const cancelEdit = () => {
    setEditingClient(null);
    setEditForm({ name: "", business_name: "", role: "", new_password: "" });
  };

  // Show login message if not authenticated
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Clients</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Please login to view clients data.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black">Clients</h1>
          {isAdmin && (
            <button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 text-sm sm:text-base"
            >
              Add New User
            </button>
          )}
        </div>
        
        {!isAdmin && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <strong>Note:</strong> You are viewing as a regular user. You can only view client data, not modify it.
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">Loading clients...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
            <br />
            <small>Make sure the database tables are created in Supabase dashboard.</small>
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded text-center">
            <p className="mb-2">No clients found.</p>
            {isAdmin && (
              <p className="text-sm">Use the "Add New User" button above to add clients.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left text-xs sm:text-sm">Name</th>
                  <th className="p-2 text-left text-xs sm:text-sm hidden sm:table-cell">Email</th>
                  <th className="p-2 text-left text-xs sm:text-sm hidden md:table-cell">Business</th>
                  <th className="p-2 text-left text-xs sm:text-sm">Role</th>
                  <th className="p-2 text-left text-xs sm:text-sm hidden lg:table-cell">Created</th>
                  {isAdmin && <th className="p-2 text-left text-xs sm:text-sm">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="border-t">
                    <td className="p-2 text-xs sm:text-sm">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="sm:hidden text-xs text-gray-500">{client.email}</div>
                      </div>
                    </td>
                    <td className="p-2 text-xs sm:text-sm hidden sm:table-cell">{client.email}</td>
                    <td className="p-2 text-xs sm:text-sm hidden md:table-cell">{client.business_name}</td>
                    <td className="p-2">
                      <span className={`px-1 sm:px-2 py-1 rounded text-xs sm:text-sm ${
                        client.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {client.role || 'client'}
                      </span>
                    </td>
                    <td className="p-2 text-xs sm:text-sm hidden lg:table-cell">{new Date(client.created_at).toLocaleString()}</td>
                    {isAdmin && (
                      <td className="p-2">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            onClick={() => handleEdit(client)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            onClick={() => handleDelete(client.email)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-black">Edit User: {editingClient.email}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full p-2 border rounded text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Business Name</label>
                <input
                  type="text"
                  value={editForm.business_name}
                  onChange={(e) => setEditForm({...editForm, business_name: e.target.value})}
                  className="w-full p-2 border rounded text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full p-2 border rounded text-black"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-black">New Password (optional)</label>
                <input
                  type="password"
                  value={editForm.new_password}
                  onChange={(e) => setEditForm({...editForm, new_password: e.target.value})}
                  className="w-full p-2 border rounded text-black"
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
              >
                Update
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientsPage;
