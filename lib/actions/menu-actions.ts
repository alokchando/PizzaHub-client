import { MenuItem } from "./types/menu";


const API_URL = "http://localhost:3001/menu-items";

// Get all menu items
export async function getMenuItems(): Promise<MenuItem[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch menu items");
  }

  return response.json();
}

// Approve or reject
export async function updateMenuItemStatus(
  id: string,
  status: "approved" | "rejected"
) {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update status");
  }

  return response.json();
}

// Activate or deactivate
export async function toggleMenuItemActive(
  id: string,
  isActive: boolean
) {
  const response = await fetch(`${API_URL}/${id}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    throw new Error("Failed to update active status");
  }

  return response.json();
}

// Delete
export async function deleteMenuItem(id: string) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete item");
  }

  return response.json();
}
