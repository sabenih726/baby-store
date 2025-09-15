"use client"

import { useEffect, useState } from "react"
import { formatRupiah } from "@/lib/utils"
import { getSalesStatistics, getTransactionHistory, type TransactionHistory } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { InventoryManagement } from "./inventory-management"

interface SalesStatsProps {
  onClose: () => void
}

export function SalesStats({ onClose }: SalesStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<TransactionHistory[]>([])
  const [showInventory, setShowInventory] = useState(false)

  useEffect(() => {
    const salesStats = getSalesStatistics()
    const transactions = getTransactionHistory().slice(0, 10) // Last 10 transactions

    setStats(salesStats)
    setRecentTransactions(transactions)
  }, [])

  if (showInventory) {
    return <InventoryManagement onClose={() => setShowInventory(false)} />
  }

  if (!stats) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Statistik Penjualan</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowInventory(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Kelola Stok
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Today's Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Hari Ini</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-600 text-sm font-medium">Penjualan Hari Ini</div>
                <div className="text-2xl font-bold text-green-700">{formatRupiah(stats.todaySales)}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-blue-600 text-sm font-medium">Transaksi Hari Ini</div>
                <div className="text-2xl font-bold text-blue-700">{stats.todayTransactions}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-purple-600 text-sm font-medium">Item Terjual Hari Ini</div>
                <div className="text-2xl font-bold text-purple-700">{stats.todayItems}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Overall Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Total Keseluruhan</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-gray-600 text-sm font-medium">Total Penjualan</div>
                <div className="text-xl font-bold text-gray-800">{formatRupiah(stats.totalSales)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-gray-600 text-sm font-medium">Total Transaksi</div>
                <div className="text-xl font-bold text-gray-800">{stats.totalTransactions}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-gray-600 text-sm font-medium">Total Item</div>
                <div className="text-xl font-bold text-gray-800">{stats.totalItems}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-gray-600 text-sm font-medium">Rata-rata Transaksi</div>
                <div className="text-xl font-bold text-gray-800">{formatRupiah(stats.averageTransaction)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recent Transactions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Transaksi Terakhir</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada transaksi</p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">#{transaction.transactionId}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs text-gray-600">
                        {transaction.items.reduce((sum, item) => sum + item.quantity, 0)} item
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatRupiah(transaction.total)}</div>
                      <div className="text-xs text-gray-500">Kembalian: {formatRupiah(transaction.change)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Sales Chart (Simple) */}
          {stats.dailySales.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Penjualan 7 Hari Terakhir</h3>
                <div className="space-y-2">
                  {stats.dailySales.map((day: any, index: number) => (
                    <div key={day.date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="text-sm">
                        {new Date(day.date).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">{day.totalTransactions} transaksi</div>
                        <div className="font-medium">{formatRupiah(day.totalSales)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
