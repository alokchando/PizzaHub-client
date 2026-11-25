"use client"

import Link from "next/link"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Pizza, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function SignInPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setLoading(true)

      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        toast.error(result.error.message || "Invalid email or password")
        return
      }

      toast.success("Welcome back!")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50/50 px-4 py-10 dark:bg-background">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 shadow-xl">

        <div className="mb-8 text-center">
          <Link href="/" className="mb-5 inline-flex items-center gap-2">
            <Pizza className="h-9 w-9 text-orange-500" />
            <span className="text-2xl font-bold">
              Pizza<span className="text-orange-500">Hub</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">
            Welcome Back!
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue enjoying your favorite pizza.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-medium text-orange-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-lg border bg-background px-3 pr-11 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-orange-500 hover:underline"
          >
            Create an account
          </Link>
        </div>

        <div className="mt-8 border-t pt-5 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition hover:text-orange-500"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}