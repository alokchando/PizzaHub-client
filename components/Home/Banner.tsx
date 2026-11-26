
import Link from "next/link"
import { ArrowRight, Pizza } from "lucide-react"

export default function Banner() {
  return (
    <section className="relative flex min-h-[550px] items-center overflow-hidden bg-neutral-950">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=2000&q=85')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400">
            <Pizza className="h-4 w-4" />
            Freshly Baked, Always Delicious
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-7xl">
            Hot & Fresh Pizza
            <span className="mt-2 block text-orange-500">
              Delivered to Your Door
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-gray-200 sm:text-lg">
            Enjoy delicious, freshly baked pizzas made with quality
            ingredients. Order your favorite flavors and get them
            delivered straight to your doorstep.
          </p>

          <div className="mt-9">
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 rounded-lg bg-orange-500 px-7 py-4 font-semibold text-white transition hover:bg-orange-600"
            >
              Explore Pizza Menu
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-300">
            Made with love. Served with happiness. 🍕
          </p>
        </div>
      </div>
    </section>
  )
}
