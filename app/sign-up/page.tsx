
"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pizza,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  User,
  Store,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

type UserRole = "customer" | "vendor" | "admin";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  businessName: string;
}

interface UploadResponse {
  imageUrl?: string;
  message?: string;
}

export default function SignUpPage() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    role: "customer",
    businessName: "",
  });

  // Handle text input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPG, PNG or WEBP image.");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password)
    );
  };

  // Upload image to ImgBB
  const uploadImage = async (file: File): Promise<string> => {
    const imageData = new FormData();
    imageData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: imageData,
    });

    const result: UploadResponse = await response.json();

    if (!response.ok || !result.imageUrl) {
      throw new Error(result.message || "Image upload failed.");
    }

    return result.imageUrl;
  };

  // Signup with email and password
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error(
        "Password needs at least 6 characters, one uppercase and one lowercase letter."
      );
      return;
    }

    if (
      formData.role === "vendor" &&
      !formData.businessName.trim()
    ) {
      toast.error("Business name is required.");
      return;
    }

    if (formData.role === "vendor" && !imageFile) {
      toast.error("Profile image is required for vendors.");
      return;
    }

    try {
      setLoading(true);

      let imageUrl: string | undefined;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await authClient.signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        image: imageUrl,
        role: formData.role,
        businessName:
          formData.role === "vendor"
            ? formData.businessName.trim()
            : undefined,
      });

      if (error) {
        toast.error(error.message || "Registration failed.");
        return;
      }

      toast.success("Account created successfully!");

      router.push(
        formData.role === "vendor"
          ? "/dashboard/vendor"
          : "/"
      );

      router.refresh();

    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  // Google signup
  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/menu",
      });

      if (error) {
        toast.error(error.message || "Google signup failed.");
        setGoogleLoading(false);
      }

    } catch {
      toast.error("Unable to sign in with Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/50 px-4 py-10 dark:bg-background">
      <div className="mx-auto w-full max-w-lg rounded-2xl border bg-background p-6 shadow-lg sm:p-8">

        {/* Logo */}
        <div className="mb-7 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <Pizza className="h-9 w-9 text-orange-500" />

            <span className="text-2xl font-bold">
              Pizza<span className="text-orange-500">Hub</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Join PizzaHub and enjoy delicious food.
          </p>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="text-lg font-bold text-blue-500">G</span>
          )}

          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">
            OR CONTINUE WITH EMAIL
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address *
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-orange-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Password *
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className="w-full rounded-lg border bg-background px-4 py-3 pr-12 text-sm outline-none focus:border-orange-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Minimum 6 characters, one uppercase and one lowercase letter.
            </p>
          </div>

          {/* Profile Image */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Profile Image
              {formData.role === "vendor" ? (
                <span className="ml-1 text-red-500">*</span>
              ) : (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Optional)
                </span>
              )}
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 transition hover:border-orange-500">
              <Upload className="h-6 w-6 text-orange-500" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {imageFile ? imageFile.name : "Choose profile image"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG or WEBP (Max 5MB)
                </p>
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Role Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              Choose Account Role *
            </label>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    role: "customer",
                    businessName: "",
                  }));
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  formData.role === "customer"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                    : "hover:border-orange-300"
                }`}
              >
                <User className="mb-3 h-6 w-6 text-orange-500" />
                <p className="font-semibold">Customer</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Order your favorite food.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    role: "vendor",
                  }));
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  formData.role === "vendor"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                    : "hover:border-orange-300"
                }`}
              >
                <Store className="mb-3 h-6 w-6 text-orange-500" />
                <p className="font-semibold">Vendor</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Manage your restaurant.
                </p>
              </button>

            </div>
          </div>

          {/* Business Name */}
          {formData.role === "vendor" && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Business / Shop Name *
              </label>

              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter your restaurant name"
                required
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-orange-500"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

        </form>

        {/* Sign In */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-orange-500 hover:underline"
          >
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
