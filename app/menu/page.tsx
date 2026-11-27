"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

import { useSession } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Card, CardContent } from "@/components/ui/card"

import { Search, MapPin, Store, Utensils, Loader2 } from "lucide-react"
import { getMenuItems } from "@/lib/menu/menu-api"

type MenuItem = {
  _id: string
  name: string
  category: string
  description: string
  price: number
  image: string
  location: string
  vendorName?: string
  vendorEmail?: string
}

export default function BrowseMenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { data: session, isPending } = useSession()

  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Get filter values from URL
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || "all"
  const location = searchParams.get("location") || "all"

  // Fetch menu items whenever filters change
  useEffect(() => {
    let ignore = false

    const fetchItems = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getMenuItems(search, category, location)

        if (!ignore) {
          setItems(data)
        }
      } catch (error) {
        console.error(error)

        if (!ignore) {
          setError("Failed to load menu items. Please try again.")
          setItems([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchItems()

    return () => {
      ignore = true
    }
  }, [search, category, location])

  // Update URL search parameters
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    const query = params.toString()

    router.push(query ? `/menu?${query}` : "/menu")
  }

  // Get unique categories and locations
  const categories = [
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ]

  const locations = [
    ...new Set(items.map((item) => item.location).filter(Boolean)),
  ]

  // View menu item details
  const handleViewDetails = (id: string) => {
    if (isPending) return

    if (!session) {
      router.push(`/sign-up?redirect=${encodeURIComponent(`/menu/${id}`)}`)
      return
    }

    router.push(`/menu/${id}`)
  }

  // Clear all filters
  const clearFilters = () => {
    router.push("/menu")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Utensils size={22} />
            <span className="text-sm font-medium">Explore Our Food</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Browse Menu
          </h1>

          <p className="mt-2 text-muted-foreground">
            Discover delicious food from our trusted vendors.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              size={18}
            />

            <Input
              placeholder="Search food by name..."
              value={search}
              onChange={(e) => updateFilters("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={category}
            onValueChange={(value) => updateFilters("category", value ?? "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>

              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select
            value={location}
            onValueChange={(value) => updateFilters("location", value ?? "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>

              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Header */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading menu..." : `${items.length} menu items found`}
          </p>

          {(search || category !== "all" || location !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />

            <p className="text-muted-foreground">Loading menu items...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-20 text-center">
            <p className="text-destructive">{error}</p>

            <Button className="mt-5" onClick={() => router.refresh()}>
              Try Again
            </Button>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed py-20 text-center">
            <Utensils
              className="mx-auto mb-4 text-muted-foreground"
              size={40}
            />

            <h2 className="text-xl font-semibold">No menu items found</h2>

            <p className="mt-2 text-muted-foreground">
              Try another search or change your filters.
            </p>

            <Button variant="outline" className="mt-5" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          /* Menu Cards */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <Card
                key={item._id}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* Food Image */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <Image
                    src={item.image || "/placeholder-food.jpg"}
                    alt='prodect image'
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <CardContent className="space-y-3 p-4">
                  {/* Name and Price */}
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="leading-tight font-semibold">{item.name}</h2>

                    <span className="shrink-0 font-bold text-primary">
                      ৳{item.price}
                    </span>
                  </div>

                  {/* Category */}
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={15} />
                    <span>{item.location}</span>
                  </div>

                  {/* Vendor */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store size={15} />
                    <span>{item.vendorName || "PizzaHub Vendor"}</span>
                  </div>

                  {/* View Details */}
                  <Button
                    className="w-full"
                    onClick={() => handleViewDetails(item._id)}
                    disabled={isPending}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
