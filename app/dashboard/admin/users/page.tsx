
"use client"

import { useEffect, useState } from "react"
import {
  Search,
  UserRound,
  Mail,
  CalendarDays,
  ShieldCheck,
  ShieldBan,
  Loader2,
} from "lucide-react"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL

type User = {
  _id: string
  name: string
  email: string
  image?: string
  emailVerified: boolean
  createdAt: string
  role: string
  isBlocked: boolean
  businessName?: string
  subscriptionPlan?: string
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/users`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Search and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())

    const matchesRole =
      role === "all" || user.role === role

    return matchesSearch && matchesRole
  })

  // Block / Unblock user
  const handleBlockToggle = async (user: User) => {
    if (updatingId) return

    const newStatus = !user.isBlocked

    try {
      setUpdatingId(user._id)

      const response = await fetch(
        `${API_URL}/users/${user._id}/block`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isBlocked: newStatus,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update user status")
      }

      // Update frontend after successful backend response
      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === user._id
            ? { ...item, isBlocked: newStatus }
            : item
        )
      )
    } catch (error) {
      console.error(error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage registered customers and vendors.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-11 rounded-lg border bg-background px-4 text-sm outline-none"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>

      </div>

      {/* User Count */}
      <p className="text-sm text-muted-foreground">
        Total users: <span className="font-semibold text-foreground">
          {filteredUsers.length}
        </span>
      </p>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-xl border bg-card p-5 space-y-5"
            >

              {/* Profile */}
              <div className="flex items-center gap-3">

                <div className="size-12 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {user.image ? (
                    <Image
                      width={48}
                      height={48}
                      src={user.image}
                      alt={`${user.name}'s profile`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {user.name}
                  </h3>

                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    user.isBlocked
                      ? "bg-red-500/10 text-red-600"
                      : "bg-green-500/10 text-green-600"
                  }`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>

              </div>

              {/* User Details */}
              <div className="space-y-3 text-sm">

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Role
                  </span>
                  <span className="font-medium capitalize">
                    {user.role}
                  </span>
                </div>

                {user.businessName && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">
                      Business
                    </span>
                    <span className="font-medium truncate">
                      {user.businessName}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Subscription
                  </span>
                  <span className="font-medium capitalize">
                    {user.subscriptionPlan || "Free"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="size-4" />
                    Email
                  </span>

                  <span className={
                    user.emailVerified
                      ? "text-green-600"
                      : "text-amber-600"
                  }>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="size-4" />
                    Joined
                  </span>

                  <span>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

              </div>

              {/* Block / Unblock */}
              <button
                onClick={() => handleBlockToggle(user)}
                disabled={updatingId !== null || user.role === "admin"}
                className={`w-full h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  user.isBlocked
                    ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                    : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                }`}
              >
                {updatingId === user._id ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating...
                  </>
                ) : user.isBlocked ? (
                  <>
                    <ShieldCheck className="size-4" />
                    Unblock User
                  </>
                ) : (
                  <>
                    <ShieldBan className="size-4" />
                    Block User
                  </>
                )}
              </button>

            </div>
          ))}

        </div>
      ) : (
        <div className="border border-dashed rounded-xl py-16 text-center">
          <UserRound className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No users found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try searching with another name or email.
          </p>
        </div>
      )}

    </div>
  )
}
