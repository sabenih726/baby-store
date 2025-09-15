"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatRupiah } from "@/lib/utils"

interface QRISPaymentProps {
  amount: number
  onPaymentSuccess: () => void
  onPaymentCancel: () => void
  isOpen: boolean
}

export function QRISPayment({ amount, onPaymentSuccess, onPaymentCancel, isOpen }: QRISPaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [countdown, setCountdown] = useState(300) // 5 minutes
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    if (isOpen && amount > 0) {
      // Generate QR Code URL (using a QR code generator service)
      const qrData = `00020101021226580014ID.CO.QRIS.WWW0215ID20232024567890303UME51440014ID.CO.QRIS.WWW0215ID20232024567890520454995802ID5914TOKO PERLENGKAPAN BAYI6007JAKARTA61051234562070703A0163044B2A`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&format=png`
      setQrCodeUrl(qrUrl)

      // Reset status
      setPaymentStatus("pending")
      setCountdown(300)
    }
  }, [isOpen, amount])

  useEffect(() => {
    if (!isOpen || paymentStatus !== "pending") return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPaymentStatus("failed")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, paymentStatus])

  // Simulate payment check (in real implementation, this would check with payment gateway)
  const simulatePaymentCheck = () => {
    // Simulate random success/failure for demo
    const isSuccess = Math.random() > 0.3 // 70% success rate
    if (isSuccess) {
      setPaymentStatus("success")
      setTimeout(() => {
        onPaymentSuccess()
      }, 2000)
    } else {
      setPaymentStatus("failed")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleClose = () => {
    setPaymentStatus("pending")
    setCountdown(300)
    onPaymentCancel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Pembayaran QRIS</DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="p-6 text-center space-y-4">
            {paymentStatus === "pending" && (
              <>
                <div className="text-2xl font-bold text-blue-600">{formatRupiah(amount)}</div>

                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code QRIS" className="w-48 h-48 mx-auto" />
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center">
                      <div className="text-gray-400">Loading QR...</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Scan QR Code dengan aplikasi pembayaran Anda</p>
                  <div className="text-lg font-mono text-red-500">{formatTime(countdown)}</div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                    Batal
                  </Button>
                  <Button onClick={simulatePaymentCheck} className="flex-1 bg-blue-500 hover:bg-blue-600">
                    Cek Pembayaran
                  </Button>
                </div>
              </>
            )}

            {paymentStatus === "success" && (
              <div className="space-y-4">
                <div className="text-green-500 text-6xl">✓</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600">Pembayaran Berhasil!</h3>
                  <p className="text-sm text-gray-600">Transaksi sebesar {formatRupiah(amount)} telah berhasil</p>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="space-y-4">
                <div className="text-red-500 text-6xl">✗</div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600">Pembayaran Gagal</h3>
                  <p className="text-sm text-gray-600">Waktu pembayaran habis atau terjadi kesalahan</p>
                </div>
                <Button onClick={handleClose} className="w-full">
                  Tutup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
