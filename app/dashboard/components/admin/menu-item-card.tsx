"use client"

import { Check, X, Trash2, Power } from "lucide-react"
import { MenuItem } from "../../admin/manage-menu-items/page"
import Image from "next/image"

type Props = {
  item: MenuItem
  updating: boolean
  onUpdateStatus: (id: string, status: "approved" | "rejected") => void
  onToggleActive: (item: MenuItem) => void
  onDelete: (id: string) => void
}

export default function MenuItemCard({
  item,
  updating,
  onUpdateStatus,
  onToggleActive,
  onDelete,
}: Props) {
  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        {item.image && (
          <Image
            width={96}
            height={96}
            src={item.image}
            alt={item.name}
            className="h-24 w-24 rounded-lg object-cover"
          />
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">
            {item.category} · {item.price}
          </p>
          <p className="mt-1 text-sm">{item.description}</p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-3 py-1">
              Status: {item.status}
            </span>

            <span className="rounded-full bg-muted px-3 py-1">
              {item.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-3">
        {item.status === "pending" && (
          <>
            <button
              disabled={updating}
              onClick={() => onUpdateStatus(item._id, "approved")}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              <Check size={16} />
              Approve
            </button>

            <button
              disabled={updating}
              onClick={() => onUpdateStatus(item._id, "rejected")}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              <X size={16} />
              Reject
            </button>
          </>
        )}

        {item.status === "approved" && (
          <button
            disabled={updating}
            onClick={() => onToggleActive(item)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
          >
            <Power size={16} />
            {item.isActive ? "Deactivate" : "Activate"}
          </button>
        )}

        <button
          disabled={updating}
          onClick={() => onDelete(item._id)}
          className="flex items-center gap-2 rounded-lg border border-red-500 px-3 py-2 text-sm text-red-500 disabled:opacity-50"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  )
}
