
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import MenuFilters from "../../components/admin/menu-filters";
import MenuStats from "../../components/admin/menu-stats";
import MenuItemCard from "../../components/admin/menu-item-card";

import {
  deleteMenuItem,
  getMenuItems,
  toggleMenuItemActive,
  updateMenuItemStatus,
} from "@/lib/actions/menu-actions";

import type { MenuItem } from "@/lib/actions/types/menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

export default function ManageMenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Store the ID of the item waiting for deletion
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Fetch menu items when page opens
  useEffect(() => {
    let ignore = false;

    const loadItems = async () => {
      try {
        const data = await getMenuItems();

        if (!ignore) {
          setItems(data);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          toast.error("Failed to load menu items");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      ignore = true;
    };
  }, []);

  // Refresh menu items
  const fetchItems = async () => {
    try {
      setLoading(true);

      const data = await getMenuItems();
      setItems(data);

      toast.success("Menu items refreshed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  // Approve or reject menu item
  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "rejected"
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
                isActive:
                  status === "rejected" ? false : item.isActive,
              }
            : item
        )
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
            : menuItem
        )
      );

      toast.success(
        newStatus
          ? "Menu item activated"
          : "Menu item deactivated"
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update active status");
    }
  };

  // Open delete confirmation dialog
  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  // Confirm and delete menu item
  const confirmDelete = async () => {
    if (!pendingDeleteId || deleting) return;

    try {
      setDeleting(true);

      await deleteMenuItem(pendingDeleteId);

      setItems((previousItems) =>
        previousItems.filter(
          (item) => item._id !== pendingDeleteId
        )
      );

      setPendingDeleteId(null);

      toast.success("Menu item deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete menu item");
    } finally {
      setDeleting(false);
    }
  };

  // Filter menu items
  const filteredItems = items.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (item.itemName || "").toLowerCase().includes(searchText) ||
      (item.category || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      item.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      item.category === categoryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory
    );
  });

  return (
    <div className="space-y-6 p-6">

      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Manage Menu Items
          </h1>

          <p className="text-sm text-muted-foreground">
            Review and manage restaurant menu items.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchItems}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
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
          <p className="font-medium">
            No menu items found
          </p>

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

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setPendingDeleteId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently
              delete this menu item from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
