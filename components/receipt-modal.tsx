"use client"

import type { Receipt } from "@/lib/types"
import { formatRupiah } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ReceiptModalProps {
  receipt: Receipt
  onClose: () => void
}

export function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleSaveReceipt = () => {
    // Create receipt data for download
    const receiptText = generateReceiptText(receipt)
    const blob = new Blob([receiptText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `struk-${receipt.transactionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-[280px] bg-white thermal-receipt">
        <CardContent className="p-4">
          {/* Receipt Content */}
          <div id="receipt-content" className="font-mono text-xs leading-tight">
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-sm font-bold mb-1">TOKO PERLENGKAPAN BAYI</h2>
              <p className="text-[10px] text-gray-600">Jl. Ceria Anak No. 123, Jakarta</p>
              <p className="text-[10px] text-gray-600">Telp: (021) 1234-5678</p>
              <p className="text-[10px] text-gray-600">NPWP: 12.345.678.9-012.000</p>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <p className="text-[10px]">{receipt.timestamp.toLocaleString("id-ID")}</p>
              <p className="text-[10px]">Kasir: Admin | ID: #{receipt.transactionId}</p>
            </div>

            {/* Items */}
            <div className="space-y-1 mb-3">
              {receipt.items.map((item, index) => (
                <div key={index} className="space-y-0.5">
                  <div className="text-[10px] font-medium">{item.name}</div>
                  <div className="flex justify-between text-[10px]">
                    <span>
                      {item.quantity} x {formatRupiah(item.price)}
                    </span>
                    <span className="font-medium">{formatRupiah(item.quantity * item.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            {/* Totals */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(receipt.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN 11%:</span>
                <span>{formatRupiah(receipt.tax)}</span>
              </div>
              <div className="border-t border-dashed border-gray-400 my-1"></div>
              <div className="flex justify-between font-bold text-xs">
                <span>TOTAL:</span>
                <span>{formatRupiah(receipt.total)}</span>
              </div>
              <div className="border-t border-dashed border-gray-400 my-1"></div>
              <div className="flex justify-between">
                <span>Tunai:</span>
                <span>{formatRupiah(receipt.cash)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Kembalian:</span>
                <span>{formatRupiah(receipt.change)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-3"></div>

            {/* Footer */}
            <div className="text-center text-[10px] space-y-1">
              <p className="font-semibold">*** TERIMA KASIH ***</p>
              <p>Barang yang sudah dibeli</p>
              <p>tidak dapat ditukar/dikembalikan</p>
              <p>Simpan struk sebagai bukti pembelian</p>
              <div className="mt-2">
                <p>Kunjungi kami di:</p>
                <p>www.tokobayibahagia.com</p>
                <p>IG: @tokobayibahagia</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 print:hidden">
            <Button variant="outline" onClick={onClose} className="flex-1 text-xs h-8 bg-transparent">
              Tutup
            </Button>
            <Button variant="outline" onClick={handleSaveReceipt} className="flex-1 text-xs h-8 bg-transparent">
              Simpan
            </Button>
            <Button onClick={handlePrint} className="flex-1 bg-blue-500 hover:bg-blue-600 text-xs h-8">
              Cetak
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .thermal-receipt, .thermal-receipt * {
            visibility: visible;
          }
          .thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm !important;
            max-width: 58mm !important;
            background: white;
            padding: 0;
            margin: 0;
            box-shadow: none;
            border: none;
          }
          #receipt-content {
            width: 100%;
            font-size: 8px !important;
            line-height: 1.2 !important;
            padding: 2mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

function generateReceiptText(receipt: Receipt): string {
  let text = `
TOKO PERLENGKAPAN BAYI
Jl. Ceria Anak No. 123, Jakarta
Telp: (021) 1234-5678
NPWP: 12.345.678.9-012.000

${receipt.timestamp.toLocaleString("id-ID")}
Kasir: Admin | ID: #${receipt.transactionId}

========================================

`

  receipt.items.forEach((item) => {
    text += `${item.name}\n`
    text += `${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.quantity * item.price)}\n\n`
  })

  text += `========================================

Subtotal: ${formatRupiah(receipt.subtotal)}
PPN 11%: ${formatRupiah(receipt.tax)}
----------------------------------------
TOTAL: ${formatRupiah(receipt.total)}
----------------------------------------
Tunai: ${formatRupiah(receipt.cash)}
Kembalian: ${formatRupiah(receipt.change)}

========================================

*** TERIMA KASIH ***
Barang yang sudah dibeli tidak dapat ditukar/dikembalikan
Simpan struk ini sebagai bukti pembelian

Kunjungi kami di:
www.tokobayibahagia.com
IG: @tokobayibahagia
`

  return text
}
