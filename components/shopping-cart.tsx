"use client"

import { useState } from "react"
import type { CartItem } from "@/lib/types"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { QRISPayment } from "./qris-payment"

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: number, amount: number) => void
  onRemoveItem: (productId: number) => void
  onCheckout: (cashAmount: number) => void
}

export function ShoppingCart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: ShoppingCartProps) {
  const [cashAmount, setCashAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash")
  const [showQRIS, setShowQRIS] = useState(false)

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.11
  const total = subtotal + tax
  const cash = Number.parseFloat(cashAmount) || 0
  const change = cash - total

  const handleCashCheckout = () => {
    if (items.length === 0) {
      alert("Keranjang masih kosong!")
      return
    }

    if (cash < total) {
      alert("Uang tunai tidak cukup!")
      return
    }

    onCheckout(cash)
    setCashAmount("")
  }

  const handleQRISCheckout = () => {
    if (items.length === 0) {
      alert("Keranjang masih kosong!")
      return
    }

    setShowQRIS(true)
  }

  const handleQRISSuccess = () => {
    setShowQRIS(false)
    onCheckout(total) // For QRIS, cash amount equals total (no change)
  }

  const handleQRISCancel = () => {
    setShowQRIS(false)
  }

  return (
    <>
      <Card className="sticky top-6 h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
            Keranjang Belanja
            {items.length > 0 && (
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-300 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">Keranjang masih kosong</p>
              </div>
            ) : (
              items.map((item) => (
                <CartItemCard key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemoveItem} />
              ))
            )}
          </div>

          {items.length > 0 && (
            <>
              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pajak (11%)</span>
                  <span className="font-medium">{formatRupiah(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-pink-600">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Metode Pembayaran</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cash")}
                    className="text-sm"
                  >
                    💵 Tunai
                  </Button>
                  <Button
                    variant={paymentMethod === "qris" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("qris")}
                    className="text-sm"
                  >
                    📱 QRIS
                  </Button>
                </div>
              </div>

              {/* Cash Payment */}
              {paymentMethod === "cash" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="cash-input" className="block text-sm font-medium text-gray-700">
                      Uang Tunai
                    </label>
                    <Input
                      id="cash-input"
                      type="number"
                      placeholder="Masukkan jumlah uang"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {cash > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className="font-medium text-gray-700">Kembalian</span>
                      <span className={`font-bold ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {formatRupiah(Math.max(0, change))}
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={handleCashCheckout}
                    disabled={items.length === 0}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 text-base"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Bayar Tunai & Cetak Struk
                  </Button>
                </>
              )}

              {/* QRIS Payment */}
              {paymentMethod === "qris" && (
                <Button
                  onClick={handleQRISCheckout}
                  disabled={items.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 text-base"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1z"
                    />
                  </svg>
                  Bayar dengan QRIS
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* QRIS Payment Modal */}
      <QRISPayment
        amount={total}
        onPaymentSuccess={handleQRISSuccess}
        onPaymentCancel={handleQRISCancel}
        isOpen={showQRIS}
      />
    </>
  )
}

interface CartItemCardProps {
  item: CartItem
  onUpdateQuantity: (productId: number, amount: number) => void
  onRemove: (productId: number) => void
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-800 truncate">{item.name}</h4>
        <p className="text-xs text-gray-500">{formatRupiah(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, -1)}
          className="w-7 h-7 p-0 rounded-full"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </Button>

        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, 1)}
          className="w-7 h-7 p-0 rounded-full"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Button>
      </div>

      <div className="text-right">
        <p className="font-bold text-sm text-gray-800">{formatRupiah(item.price * item.quantity)}</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
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
  )
}
