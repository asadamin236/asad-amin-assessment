import { supabase } from "../context/supabaseClient";

export interface Client {
  id: string;
  name: string;
  email: string;
  business_name: string;
  created_at: string;
  role?: string;
}

export async function getClients(): Promise<Client[]> {
  // Get clients with their roles from profiles table
  const { data, error } = await supabase
    .from("clients")
    .select(`
      id, 
      name, 
      email, 
      business_name, 
      created_at,
      profiles!inner(role)
    `)
    .order("created_at", { ascending: false });
  
  if (error) {
    // Fallback: get clients without roles if join fails
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("clients")
      .select("id, name, email, business_name, created_at")
      .order("created_at", { ascending: false });
    
    if (fallbackError) throw fallbackError;
    
    return (fallbackData || []).map(client => ({
      ...client,
      role: "client" // Default role
    }));
  }
  
  // Transform the data to include role
  return (data || []).map((client: any) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    business_name: client.business_name,
    created_at: client.created_at,
    role: client.profiles?.role || "client"
  }));
}

export async function addClient(client: Omit<Client, "id" | "created_at">): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert([client])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClient(email: string): Promise<void> {
  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch('/api/admin/delete-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
}

export async function updateClient(email: string, updates: {
  name?: string;
  business_name?: string;
  role?: string;
  new_password?: string;
}): Promise<void> {
  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch('/api/admin/update-user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ email, ...updates }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
}
