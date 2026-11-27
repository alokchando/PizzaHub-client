const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Get menu items with filters
export const getMenuItems = async (
  search: string,
  category: string,
  location: string
) => {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (category !== "all") {
    params.set("category", category);
  }

  if (location !== "all") {
    params.set("location", location);
  }

  const response = await fetch(
    `${API_URL}/menu?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch menu items");
  }

  return response.json();
};