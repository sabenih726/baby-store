"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getStockMovements,
  getProductStocks,
  addStockMovement,
  setMinimumStock,
  getLowStockProducts,
  type StockMovement,
  type ProductStock,
} from "@/lib/storage"
import { products } from "@/lib/products"

interface InventoryManagementProps {
  onClose: () => void
}

export function InventoryManagement({ onClose }: InventoryManagementProps) {
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [productStocks, setProductStocks] = useState<ProductStock[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<ProductStock[]>([])

  // Form states
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [movementType, setMovementType] = useState<"in" | "out">("in")
  const [quantity, setQuantity] = useState<string>("")
  const [reason, setReason] = useState<string>("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setStockMovements(getStockMovements())
    setProductStocks(getProductStocks())
    setLowStockProducts(getLowStockProducts())
  }

  const handleAddMovement = () => {
    if (!selectedProductId || !quantity || !reason) {
      alert("Mohon lengkapi semua field")
      return
    }

    const product = products.find((p) => p.id === Number.parseInt(selectedProductId))
    if (!product) return

    addStockMovement({
      productId: product.id,
      productName: product.name,
      type: movementType,
      quantity: Number.parseInt(quantity),
      reason: reason,
    })

    // Reset form
    setSelectedProductId("")
    setQuantity("")
    setReason("")

    // Reload data
    loadData()
  }

  const handleSetMinStock = (productId: number, minStock: number) => {
    setMinimumStock(productId, minStock)
    loadData()
  }

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || `Produk #${productId}`
  }

  const getCurrentStock = (productId: number) => {
    return productStocks.find((s) => s.productId === productId)?.currentStock || 0
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Manajemen Stok</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="movements">Pergerakan Stok</TabsTrigger>
              <TabsTrigger value="add-stock">Tambah Stok</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Low Stock Alert */}
              {lowStockProducts.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700 text-lg">⚠️ Stok Menipis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lowStockProducts.map((stock) => (
                        <div
                          key={stock.productId}
                          className="flex justify-between items-center p-2 bg-white rounded border"
                        >
                          <span className="font-medium">{getProductName(stock.productId)}</span>
                          <Badge variant="destructive">
                            {stock.currentStock} / {stock.minStock} minimum
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stock Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Stok Produk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => {
                      const currentStock = getCurrentStock(product.id)
                      const stockInfo = productStocks.find((s) => s.productId === product.id)
                      const isLowStock = stockInfo && currentStock <= stockInfo.minStock

                      return (
                        <div
                          key={product.id}
                          className={`p-4 rounded-lg border ${isLowStock ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            {isLowStock && (
                              <Badge variant="destructive" className="text-xs">
                                Low
                              </Badge>
                            )}
                          </div>
                          <div className="text-2xl font-bold mb-1">{currentStock}</div>
                          <div className="text-xs text-gray-500">
                            Min: {stockInfo?.minStock || 5} | Update:{" "}
                            {stockInfo?.lastUpdated
                              ? new Date(stockInfo.lastUpdated).toLocaleDateString("id-ID")
                              : "Belum ada"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Pergerakan Stok</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {stockMovements.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Belum ada pergerakan stok</p>
                    ) : (
                      stockMovements.map((movement) => (
                        <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{movement.productName}</div>
                            <div className="text-xs text-gray-500">{movement.reason}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(movement.timestamp).toLocaleString("id-ID")}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={movement.type === "in" ? "default" : "secondary"}>
                              {movement.type === "in" ? "+" : "-"}
                              {movement.quantity}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add-stock" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah/Kurangi Stok</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-select">Produk</Label>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} (Stok: {getCurrentStock(product.id)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="movement-type">Jenis Pergerakan</Label>
                      <Select value={movementType} onValueChange={(value: "in" | "out") => setMovementType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">Stok Masuk (+)</SelectItem>
                          <SelectItem value="out">Stok Keluar (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Jumlah</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Masukkan jumlah"
                        min="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reason">Keterangan</Label>
                      <Input
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Alasan pergerakan stok"
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddMovement} className="w-full">
                    {movementType === "in" ? "Tambah Stok" : "Kurangi Stok"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Stok Minimum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.map((product) => {
                      const stockInfo = productStocks.find((s) => s.productId === product.id)
                      return (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">Stok saat ini: {getCurrentStock(product.id)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`min-${product.id}`} className="text-sm">
                              Min:
                            </Label>
                            <Input
                              id={`min-${product.id}`}
                              type="number"
                              className="w-20"
                              defaultValue={stockInfo?.minStock || 5}
                              min="0"
                              onBlur={(e) => {
                                const value = Number.parseInt(e.target.value) || 5
                                handleSetMinStock(product.id, value)
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
