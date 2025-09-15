"use client"

import type { Receipt } from "./types"

const STORAGE_KEYS = {
  TRANSACTIONS: "baby-store-transactions",
  DAILY_SALES: "baby-store-daily-sales",
  CART: "baby-store-cart",
}

const INVENTORY_KEYS = {
  STOCK_MOVEMENTS: "baby-store-stock-movements",
  PRODUCT_STOCKS: "baby-store-product-stocks",
}

export interface DailySales {
  date: string
  totalSales: number
  totalTransactions: number
  totalItems: number
}

export interface TransactionHistory extends Receipt {
  id: string
}

export interface StockMovement {
  id: string
  productId: number
  productName: string
  type: "in" | "out"
  quantity: number
  reason: string
  timestamp: string
  userId?: string
}

export interface ProductStock {
  productId: number
  currentStock: number
  minStock: number
  lastUpdated: string
}

// Save transaction to history
export function saveTransaction(receipt: Receipt): void {
  try {
    const transaction: TransactionHistory = {
      ...receipt,
      id: `txn_${receipt.transactionId}_${Date.now()}`,
    }

    // Get existing transactions
    const existingTransactions = getTransactionHistory()
    const updatedTransactions = [transaction, ...existingTransactions]

    // Keep only last 100 transactions
    const limitedTransactions = updatedTransactions.slice(0, 100)

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(limitedTransactions))

    // Update daily sales
    updateDailySales(receipt)

    receipt.items.forEach((item) => {
      addStockMovement({
        productId: item.id,
        productName: item.name,
        type: "out",
        quantity: item.quantity,
        reason: `Penjualan - Transaksi #${receipt.transactionId}`,
      })
    })
  } catch (error) {
    console.error("Error saving transaction:", error)
  }
}

// Get transaction history
export function getTransactionHistory(): TransactionHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error getting transaction history:", error)
    return []
  }
}

// Update daily sales summary
function updateDailySales(receipt: Receipt): void {
  try {
    const today = new Date().toISOString().split("T")[0]
    const existingSales = getDailySales()

    const todayIndex = existingSales.findIndex((sale) => sale.date === today)
    const totalItems = receipt.items.reduce((sum, item) => sum + item.quantity, 0)

    if (todayIndex >= 0) {
      // Update existing day
      existingSales[todayIndex].totalSales += receipt.total
      existingSales[todayIndex].totalTransactions += 1
      existingSales[todayIndex].totalItems += totalItems
    } else {
      // Add new day
      existingSales.unshift({
        date: today,
        totalSales: receipt.total,
        totalTransactions: 1,
        totalItems: totalItems,
      })
    }

    // Keep only last 30 days
    const limitedSales = existingSales.slice(0, 30)
    localStorage.setItem(STORAGE_KEYS.DAILY_SALES, JSON.stringify(limitedSales))
  } catch (error) {
    console.error("Error updating daily sales:", error)
  }
}

// Get daily sales summary
export function getDailySales(): DailySales[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_SALES)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error getting daily sales:", error)
    return []
  }
}

// Save cart state
export function saveCartState(cart: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart))
  } catch (error) {
    console.error("Error saving cart state:", error)
  }
}

// Get saved cart state
export function getSavedCartState(): any[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CART)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error getting saved cart state:", error)
    return []
  }
}

// Clear saved cart state
export function clearSavedCartState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CART)
  } catch (error) {
    console.error("Error clearing saved cart state:", error)
  }
}

// Get sales statistics
export function getSalesStatistics() {
  const dailySales = getDailySales()
  const transactions = getTransactionHistory()

  const totalSales = dailySales.reduce((sum, day) => sum + day.totalSales, 0)
  const totalTransactions = dailySales.reduce((sum, day) => sum + day.totalTransactions, 0)
  const totalItems = dailySales.reduce((sum, day) => sum + day.totalItems, 0)

  const todaySales = dailySales.find((sale) => sale.date === new Date().toISOString().split("T")[0])

  return {
    totalSales,
    totalTransactions,
    totalItems,
    todaySales: todaySales?.totalSales || 0,
    todayTransactions: todaySales?.totalTransactions || 0,
    todayItems: todaySales?.totalItems || 0,
    averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
    dailySales: dailySales.slice(0, 7), // Last 7 days
  }
}

// Stock movement functions
export function addStockMovement(movement: Omit<StockMovement, "id" | "timestamp">): void {
  try {
    const stockMovement: StockMovement = {
      ...movement,
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    const existingMovements = getStockMovements()
    const updatedMovements = [stockMovement, ...existingMovements]

    // Keep only last 500 movements
    const limitedMovements = updatedMovements.slice(0, 500)
    localStorage.setItem(INVENTORY_KEYS.STOCK_MOVEMENTS, JSON.stringify(limitedMovements))

    // Update product stock
    updateProductStock(movement.productId, movement.type === "in" ? movement.quantity : -movement.quantity)
  } catch (error) {
    console.error("Error adding stock movement:", error)
  }
}

export function getStockMovements(): StockMovement[] {
  try {
    const stored = localStorage.getItem(INVENTORY_KEYS.STOCK_MOVEMENTS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error getting stock movements:", error)
    return []
  }
}

// Product stock functions
export function updateProductStock(productId: number, quantityChange: number): void {
  try {
    const stocks = getProductStocks()
    const existingStock = stocks.find((s) => s.productId === productId)

    if (existingStock) {
      existingStock.currentStock = Math.max(0, existingStock.currentStock + quantityChange)
      existingStock.lastUpdated = new Date().toISOString()
    } else {
      stocks.push({
        productId,
        currentStock: Math.max(0, quantityChange),
        minStock: 5, // Default minimum stock
        lastUpdated: new Date().toISOString(),
      })
    }

    localStorage.setItem(INVENTORY_KEYS.PRODUCT_STOCKS, JSON.stringify(stocks))
  } catch (error) {
    console.error("Error updating product stock:", error)
  }
}

export function getProductStocks(): ProductStock[] {
  try {
    const stored = localStorage.getItem(INVENTORY_KEYS.PRODUCT_STOCKS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error getting product stocks:", error)
    return []
  }
}

export function getProductStock(productId: number): ProductStock | null {
  const stocks = getProductStocks()
  return stocks.find((s) => s.productId === productId) || null
}

export function setMinimumStock(productId: number, minStock: number): void {
  try {
    const stocks = getProductStocks()
    const existingStock = stocks.find((s) => s.productId === productId)

    if (existingStock) {
      existingStock.minStock = minStock
      existingStock.lastUpdated = new Date().toISOString()
    } else {
      stocks.push({
        productId,
        currentStock: 0,
        minStock,
        lastUpdated: new Date().toISOString(),
      })
    }

    localStorage.setItem(INVENTORY_KEYS.PRODUCT_STOCKS, JSON.stringify(stocks))
  } catch (error) {
    console.error("Error setting minimum stock:", error)
  }
}

// Get low stock products
export function getLowStockProducts(): ProductStock[] {
  const stocks = getProductStocks()
  return stocks.filter((stock) => stock.currentStock <= stock.minStock)
}
