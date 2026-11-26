
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

import {
  ImagePlus,
  Loader2,
  Upload,
  UtensilsCrossed,
  MapPin,
  DollarSign,
  X,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const categories = [
  "Pizza",
  "Burger",
  "Pasta",
  "Chicken",
  "Sandwich",
  "Dessert",
  "Drinks",
  "Other",
]

export default function AddMenuItemPage() {
  const router = useRouter()

  const { data: session, isPending } = useSession()

  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    location: "",
  })

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB")
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!session?.user) {
      toast.error("Please login first")
      router.push("/sign-in")
      return
    }

    if (session.user.role !== "vendor") {
      toast.error("Only vendors can add menu items")
      return
    }

    if (!image) {
      toast.error("Please upload an item image")
      return
    }

    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.location.trim()
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    const price = Number(formData.price)

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    setLoading(true)

    try {
      // Upload image to ImgBB
      const imageData = new FormData()
      imageData.append("image", image)

      const uploadResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: imageData,
        }
      )

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error("Image upload failed")
      }

      // Save menu item to backend
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL

      if (!serverUrl) {
        toast.error("Server URL is missing")
        return
      }

      const response = await fetch(`${serverUrl}/menu-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          price,
          image: uploadResult.data.url,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to add menu item")
      }

      toast.success("Menu item submitted for approval!")

      setFormData({
        name: "",
        category: "",
        description: "",
        price: "",
        location: "",
      })

      setImage(null)
      setPreview("")

      router.push("/vendor/dashboard/menu-items")
      router.refresh()

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (!session?.user || session.user.role !== "vendor") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          Access Denied
        </h2>
        <p className="mt-2 text-muted-foreground">
          Only vendors can add menu items.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Add Menu Item
          </h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Add a new food item to your restaurant menu.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Item Information</CardTitle>
          <CardDescription>
            Fill in the details below to submit your menu item.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Chicken Cheese Pizza"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value ?? formData.category,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description *
              </Label>

              <Textarea
                id="description"
                placeholder="Describe your food item..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* Price and Location */}
            <div className="grid gap-5 md:grid-cols-2">

              <div className="space-y-2">
                <Label htmlFor="price">Price (৳) *</Label>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 size-4 text-muted-foreground" />

                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="500"
                    className="pl-9"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />

                  <Input
                    id="location"
                    placeholder="e.g. Sylhet, Bangladesh"
                    className="pl-9"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Item Image *</Label>

              <div className="relative rounded-xl border-2 border-dashed p-6 text-center">

                {preview ? (
                  <div className="relative mx-auto max-w-sm">
                    <img
                      src={preview}
                      alt="Item preview"
                      className="h-52 w-full rounded-lg object-cover"
                    />

                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -right-2 -top-2"
                      onClick={() => {
                        setImage(null)
                        setPreview("")
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="mx-auto size-10 text-muted-foreground" />

                    <p className="mt-3 font-medium">
                      Upload food image
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      PNG, JPG or WEBP (Maximum 5MB)
                    </p>

                    <Label
                      htmlFor="image"
                      className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Upload className="size-4" />
                      Choose Image
                    </Label>
                  </>
                )}

                <Input
                  id="image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Approval Notice */}
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm font-medium">
                Admin Approval Required
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your menu item will be submitted with Pending
                status. Customers can see it only after admin
                approval.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Menu Item"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
