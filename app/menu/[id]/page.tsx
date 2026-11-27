
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  MessageSquare,
  ShoppingBag,
  Loader2,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL

type MenuItem = {
  _id: string
  itemName: string
  category: string
  description?: string
  price: number
  image: string
  location: string
  vendorId: string
}

type Order = {
  _id: string
  itemId: string
  customerId: string
  status: string
}

export default function MenuDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: session, isPending } = useSession()

  // Menu item states
  const [item, setItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Order states
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const [checkingOrder, setCheckingOrder] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Order form states
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [message, setMessage] = useState("")
  const [ordering, setOrdering] = useState(false)

  // Fetch menu item
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_URL}/menu-items/${id}`)

        if (!response.ok) {
          throw new Error("Menu item not found")
        }

        const data = await response.json()
        setItem(data)
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load menu item"
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchItem()
  }, [id])

  // Fetch customer's pending order
  useEffect(() => {
    const fetchPendingOrder = async () => {
      if (!session?.user.id || !id || session.user.role !== "customer") {
        setPendingOrder(null)
        return
      }

      try {
        setCheckingOrder(true)

        const response = await fetch(
          `${API_URL}/orders/pending?itemId=${id}&customerId=${session.user.id}`
        )

        if (!response.ok) {
          throw new Error("Failed to check pending order")
        }

        const data = await response.json()
        setPendingOrder(data)
      } catch (error) {
        console.error(error)
        toast.error("Could not check your pending order.")
      } finally {
        setCheckingOrder(false)
      }
    }

    if (!isPending) {
      fetchPendingOrder()
    }
  }, [id, session?.user.id, session?.user.role, isPending])

  // Open order form
  const handleOrder = () => {
    if (isPending || checkingOrder || ordering) return

    if (!session) {
      router.push(`/sign-in?redirect=${encodeURIComponent(`/menu/${id}`)}`)
      return
    }

    if (session.user.role !== "customer") {
      toast.error("Only customers can place orders.")
      return
    }

    if (pendingOrder) {
      toast.error("You already have a pending order for this item.")
      return
    }

    setShowOrderForm(true)
  }

  // Submit order
  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (ordering || !item) return

    if (!session) {
      router.push("/sign-in")
      return
    }

    if (session.user.role !== "customer") {
      toast.error("Only customers can place orders.")
      return
    }

    if (pendingOrder) {
      toast.error("You already have a pending order for this item.")
      setShowOrderForm(false)
      return
    }

    try {
      setOrdering(true)

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: id,
          itemName:item.itemName,
          vendorId: item.vendorId,
          customerId: session.user.id,
          customerEmail:session.user.email,
          img:item.image,
          deliveryDate,
          deliveryAddress,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order")
      }

      const newOrderId = data.insertedId || data.orderId

      if (!newOrderId) {
        throw new Error("Server did not return the new order ID.")
      }

      // Update UI immediately
      setPendingOrder({
        _id: newOrderId,
        itemId: id,
        customerId: session.user.id,
        status: "pending",
      })

      toast.success("Your order has been placed successfully!")

      // Reset form
      setShowOrderForm(false)
      setDeliveryDate("")
      setDeliveryAddress("")
      setMessage("")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setOrdering(false)
    }
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

      setPendingOrder(null)

      toast.success("Pending order deleted successfully!")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setDeleting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error state
  if (error || !item) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-xl font-semibold">
          {error || "Menu item not found"}
        </h2>

        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Menu
      </Button>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.image}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        {/* Information */}
        <div className="flex flex-col justify-center space-y-5">
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {item.category}
          </span>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {item.itemName}
          </h1>

          {item.description?.trim() && (
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          )}

          {item.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {item.location}
            </div>
          )}

          <div className="border-t pt-5">
            <p className="text-sm text-muted-foreground">Price</p>
            <h2 className="text-3xl font-bold text-primary">
              ৳{item.price}
            </h2>
          </div>

          {/* Order / Delete Button */}
          {!session && !isPending ? (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleOrder}
            >
              <ShoppingBag className="h-5 w-5" />
              Sign in to Order
            </Button>
          ) : isPending || checkingOrder ? (
            <Button size="lg" className="w-full" disabled>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Checking...
            </Button>
          ) : session?.user.role !== "customer" ? (
            <Button size="lg" className="w-full" disabled>
              Only Customers Can Order
            </Button>
          ) : pendingOrder ? (
            <Button
              size="lg"
              variant="destructive"
              className="w-full gap-2"
              onClick={handleDeleteOrder}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Deleting Order...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  Delete Order
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleOrder}
            >
              <ShoppingBag className="h-5 w-5" />
              Order Now
            </Button>
          )}
        </div>
      </div>

      {/* Order Form */}
      {showOrderForm && (
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border bg-card p-5 shadow-sm md:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold">Complete Your Order</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your delivery information below.
            </p>
          </div>

          {/* Selected Item */}
          <div className="mb-6 flex items-center justify-between rounded-xl bg-muted/60 p-4">
            <div>
              <p className="font-semibold">{item.itemName}</p>
              <p className="text-sm text-muted-foreground">
                {item.category}
              </p>
            </div>

            <p className="font-bold text-primary">৳{item.price}</p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-5">
            {/* Delivery Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Delivery Date
              </label>

              <input
                type="date"
                required
                min={new Date().toLocaleDateString("en-CA")}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </label>

              <textarea
                required
                rows={3}
                placeholder="Enter your complete delivery address..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Message (Optional)
              </label>

              <textarea
                rows={3}
                placeholder="Any special delivery instructions?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Form Buttons */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={ordering}
                onClick={() => setShowOrderForm(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1"
                disabled={ordering}
              >
                {ordering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
