"use client"

import type React from "react"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

interface ProductManagementProps {
  products: Product[]
  onAddProduct: (product: Omit<Product, "id">) => void
  onDeleteProduct: (productId: number) => void
  onUpdateProduct: (product: Product) => void
}

export function ProductManagement({
  products,
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
}: ProductManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    barcode: "",
    image: "",
  })

  const categories = [
    { value: "susu", label: "Susu Formula" },
    { value: "pampers", label: "Pampers" },
    { value: "kosmetik", label: "Kosmetik Bayi" },
    { value: "perlengkapan", label: "Perlengkapan" },
    { value: "makanan", label: "Makanan Bayi" },
  ]

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      barcode: "",
      image: "",
    })
    setEditingProduct(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.category) {
      alert("Mohon lengkapi semua field yang wajib diisi!")
      return
    }

    const productData = {
      name: formData.name,
      price: Number.parseInt(formData.price),
      category: formData.category,
      barcode: formData.barcode || `${Date.now()}${Math.floor(Math.random() * 1000)}`,
      image: formData.image || "/placeholder.svg?height=150&width=150&text=No+Image",
    }

    if (editingProduct) {
      onUpdateProduct({ ...productData, id: editingProduct.id })
    } else {
      onAddProduct(productData)
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      barcode: product.barcode,
      image: product.image,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      onDeleteProduct(product.id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-gray-800">Manajemen Produk</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setIsAddDialogOpen(true)
                }}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama produk"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Harga *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="Masukkan harga"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
                    placeholder="Masukkan barcode (opsional)"
                  />
                </div>

                <div>
                  <Label htmlFor="image">URL Gambar</Label>
                  <Textarea
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="Masukkan URL gambar (opsional)"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
                    {editingProduct ? "Update" : "Tambah"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={50}
                height={50}
                className="w-12 h-12 object-cover rounded-md bg-white"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-800 truncate">{product.name}</h4>
                <p className="text-xs text-gray-500">{formatRupiah(product.price)}</p>
                <p className="text-xs text-gray-400 capitalize">{product.category}</p>
              </div>

              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="w-8 h-8 p-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(product)}
                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
