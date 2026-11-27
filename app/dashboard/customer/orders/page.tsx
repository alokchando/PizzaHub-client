
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL

interface Order {
  _id: string
  itemId: string
  vendorId: string
  customerEmail: string
  customerId: string
  deliveryDate: string
  deliveryAddress: string
  message: string
  status: "pending" | "accepted" | "rejected" | "cancelled"
  createdAt: string
  itemName: string
  img: string
}

export default function MyOrdersPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch customer orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user.email || session.user.role !== "customer") {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${API_URL}/my-orders/${encodeURIComponent(session.user.email)}`,
          { cache: "no-store" }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()
        setOrders(data)
      } catch {
        toast.error("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [session?.user.email, session?.user.role])

  // View menu item details
  const handleViewDetails = (id: string) => {
    if (!session) {
      router.push(
        `/sign-up?redirect=${encodeURIComponent(`/menu/${id}`)}`
      )
      return
    }

    router.push(`/menu/${id}`)
  }

  // Delete pending order
  const handleDeleteOrder = async () => {
    if (!pendingOrder || !session || deleting) return

    try {
      setDeleting(true)

      const response = await fetch(
        `${API_URL}/orders/${pendingOrder._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: session.user.id,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete order")
      }

      setOrders((prev) =>
        prev.filter((order) => order._id !== pendingOrder._id)
      )

      setPendingOrder(null)

      toast.success("Pending order deleted successfully!")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      )
    } finally {
      setDeleting(false)
    }
  }

  // Status styles
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-600",
    }

    return styles[status] || "bg-gray-100 text-gray-600"
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading your orders...
        </p>
      </div>
    )
  }

  // Customer access
  if (!session || session.user.role !== "customer") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">
            Customer Access Only
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in with a customer account to view your orders.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-sky-600">
          CUSTOMER DASHBOARD
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          My Orders
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Track your orders and manage your food requests.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">

        <SummaryCard
          label="Total Orders"
          value={orders.length}
        />

        <SummaryCard
          label="Pending"
          value={orders.filter(
            (order) => order.status === "pending"
          ).length}
        />

        <SummaryCard
          label="Accepted"
          value={orders.filter(
            (order) => order.status === "accepted"
          ).length}
        />

        <SummaryCard
          label="Cancelled"
          value={orders.filter(
            (order) => order.status === "cancelled"
          ).length}
        />

      </div>

      {/* Orders List */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Your Orders
        </h2>

        <span className="text-sm text-muted-foreground">
          {orders.length} orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed px-5 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 8H5" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold">
            No orders yet
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Your orders will appear here once you place one.
          </p>

          <button
            onClick={() => router.push("/menu")}
            className="mt-5 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">

          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border bg-card p-4 transition hover:shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-5 sm:flex-row">

                {/* Item Image */}
                <Image
                  src={order.img || "/placeholder.png"}
                  alt={order.itemName}
                  width={640}
                  height={576}
                  className="h-44 w-full rounded-lg object-cover sm:h-36 sm:w-40"
                />

                {/* Order Information */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">
                      {order.itemName}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Delivery Date
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {order.deliveryDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Request Date
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Delivery Address
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {order.deliveryAddress}
                      </p>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        handleViewDetails(order.itemId)
                      }
                      className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
                    >
                      View Details
                    </button>

                    {order.status === "pending" && (
                      <button
                        onClick={() => setPendingOrder(order)}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                    )}

                  </div>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-xl">

            <h2 className="text-xl font-bold">
              Cancel Order?
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to cancel your order for{" "}
              <span className="font-semibold text-foreground">
                {pendingOrder.itemName}
              </span>
              ?
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              This will permanently delete your pending order.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setPendingOrder(null)}
                disabled={deleting}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Cancel"}
              </button>

            </div>
          </div>
        </div>
      )}

    </main>
  )
}

// Summary Card
function SummaryCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  )
}
