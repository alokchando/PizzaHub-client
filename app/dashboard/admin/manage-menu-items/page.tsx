"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";


import MenuFilters from "../../components/admin/menu-filters";
import MenuStats from "../../components/admin/menu-stats";
import MenuItemCard from "../../components/admin/menu-item-card";
import { deleteMenuItem, getMenuItems, toggleMenuItemActive, updateMenuItemStatus } from "@/lib/actions/menu-actions";



export type MenuItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
};

export default function ManageMenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Load menu items when page opens
  const fetchItems = async () => {
    try {
      setLoading(true);

      const data = await getMenuItems();

      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const loadItems = async () => {
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  loadItems();
}, []);

  // Approve or reject menu item
  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    try {
      setUpdating(true);

      await updateMenuItemStatus(id, status);

      setItems((previousItems) =>
        previousItems.map((item) =>
          item._id === id
            ? {
                ...item,
                status,
                isActive: status === "rejected" ? false : item.isActive,
              }
            : item,
        ),
      );

      toast.success(`Menu item ${status}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update menu item");
    } finally {
      setUpdating(false);
    }
  };

  // Activate or deactivate menu item
  const handleToggleActive = async (item: MenuItem) => {
    try {
      const newStatus = !item.isActive;

      await toggleMenuItemActive(item._id, newStatus);

      setItems((previousItems) =>
        previousItems.map((menuItem) =>
          menuItem._id === item._id
            ? { ...menuItem, isActive: newStatus }
            : menuItem,
        ),
      );

      toast.success(newStatus ? "Menu item activated" : "Menu item deactivated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update active status");
    }
  };

  // Delete menu item
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?",
    );

    if (!confirmed) return;

    try {
      await deleteMenuItem(id);

      setItems((previousItems) =>
        previousItems.filter((item) => item._id !== id),
      );

      toast.success("Menu item deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete menu item");
    }
  };

  // Filter menu items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Manage Menu Items</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage restaurant menu items.
          </p>
        </div>

        <button
          onClick={fetchItems}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Statistics */}
      <MenuStats items={items} />

      {/* Search and filters */}
      <MenuFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      {/* Menu items */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading menu items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="font-medium">No menu items found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              updating={updating}
              onUpdateStatus={handleUpdateStatus}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}