"use client"

import type { Product } from "@/lib/types"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface ProductGridProps {
  products: Product[]
  onAddToCart: (productId: number) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">Produk tidak ditemukan</p>
        <p className="text-gray-400 text-sm">Coba ubah kata kunci pencarian</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: number) => void
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      susu: "bg-pink-50 border-pink-200",
      pampers: "bg-blue-50 border-blue-200",
      kosmetik: "bg-green-50 border-green-200",
      perlengkapan: "bg-purple-50 border-purple-200",
      makanan: "bg-orange-50 border-orange-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-50 border-gray-200"
  }

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      susu: "bg-pink-100 text-pink-700",
      pampers: "bg-blue-100 text-blue-700",
      kosmetik: "bg-green-100 text-green-700",
      perlengkapan: "bg-purple-100 text-purple-700",
      makanan: "bg-orange-100 text-orange-700",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  return (
    <Card
      className={`${getCategoryColor(product.category)} hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group`}
    >
      <CardContent className="p-3">
        <div className="relative mb-3">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={120}
            height={120}
            className="w-full h-24 object-cover rounded-md bg-white"
          />
          <div
            className={`absolute top-1 right-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(product.category)}`}
          >
            {product.category}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>

          <div className="space-y-2">
            <p className="text-pink-600 font-bold text-base">{formatRupiah(product.price)}</p>
            <Button
              size="sm"
              onClick={() => onAddToCart(product.id)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 text-xs h-7 group-hover:scale-105 transition-transform"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
