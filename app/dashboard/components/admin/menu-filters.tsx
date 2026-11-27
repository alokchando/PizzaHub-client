"use client";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
};

export default function MenuFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Search */}
      <input
        type="text"
        placeholder="Search menu items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-2"
      />

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border px-4 py-2"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Category filter */}
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="rounded-lg border px-4 py-2"
      >
        <option value="all">All Categories</option>
        <option value="Pizza">Pizza</option>
        <option value="Burger">Burger</option>
        <option value="Drinks">Drinks</option>
        <option value="Dessert">Dessert</option>
      </select>
    </div>
  );
}