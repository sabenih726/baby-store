"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "@/components/product-grid"
import { ShoppingCart } from "@/components/shopping-cart"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { ReceiptModal } from "@/components/receipt-modal"
import { SearchBar } from "@/components/search-bar"
import { SalesStats } from "@/components/sales-stats"
import { ProductManagement } from "@/components/product-management"
import { products as initialProducts } from "@/lib/products"
import type { CartItem, Product } from "@/lib/types"
import { saveTransaction, saveCartState, getSavedCartState, clearSavedCartState } from "@/lib/storage"

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showProductManagement, setShowProductManagement] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)

  // Load saved cart and products on component mount
  useEffect(() => {
    const savedCart = getSavedCartState()
    if (savedCart.length > 0) {
      setCart(savedCart)
    }

    const savedProducts = localStorage.getItem("pos-products")
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts))
      } catch (error) {
        console.error("Error loading saved products:", error)
      }
    }
  }, [])

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem("pos-products", JSON.stringify(products))
  }, [products])

  // Save cart state whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      saveCartState(cart)
    } else {
      clearSavedCartState()
    }
  }, [cart])

  // Filter products based on search term
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Add product to cart
  const addToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  // Add product by barcode
  const addProductByBarcode = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode)
    if (product) {
      addToCart(product.id)
      return product.name
    }
    return null
  }

  // Update item quantity
  const updateQuantity = (productId: number, amount: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + amount
            return newQuantity <= 0 ? null : { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const addProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(...products.map((p) => p.id), 0) + 1,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
  }

  const deleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.11
  const total = subtotal + tax

  // Handle checkout
  const handleCheckout = (cashAmount: number) => {
    const change = cashAmount - total
    const receipt = {
      items: cart,
      subtotal,
      tax,
      total,
      cash: cashAmount,
      change,
      timestamp: new Date(),
      transactionId: Math.floor(Math.random() * 900000) + 100000,
    }

    saveTransaction(receipt)
    setReceiptData(receipt)
    setShowReceipt(true)
  }

  // Reset transaction
  const resetTransaction = () => {
    setCart([])
    setShowReceipt(false)
    setReceiptData(null)
    clearSavedCartState()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center">
            {/* Left (Kelola Produk) */}
            <div className="flex-1">
              <button
                onClick={() => setShowProductManagement(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                   />
                </svg>
                Kelola Produk
              </button>
            </div>

            {/* Center (Title) */}
            <div className="flex-1 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-pink-500 mb-1">
                Els Baby Store
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Management Store
              </p>
            </div>

            {/* Right (Statistik) */}
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setShowStats(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Statistik
              </button>
            </div>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Daftar Produk</h2>
                <div className="flex items-center gap-3">
                  <SearchBar value={searchTerm} onChange={setSearchTerm} />
                  <button
                    onClick={() => setShowScanner(true)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-full transition-colors duration-200 flex items-center gap-2 text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h3a1 1 0 011 1v1a1 1 0 01-1 1H6v2a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm14 0a1 1 0 00-1-1h-3a1 1 0 00-1 1v1a1 1 0 001 1h3v2a1 1 0 001 1h1a1 1 0 001-1V5zm-4 12a1 1 0 011-1h3v-2a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-1zM5 15h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3a1 1 0 011-1z"
                      />
                    </svg>
                    Scan
                  </button>
                </div>
              </div>
              <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <ShoppingCart
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showScanner && <BarcodeScanner onScan={addProductByBarcode} onClose={() => setShowScanner(false)} />}

      {showReceipt && receiptData && <ReceiptModal receipt={receiptData} onClose={resetTransaction} />}

      {showStats && <SalesStats onClose={() => setShowStats(false)} />}

      {showProductManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold">Manajemen Produk</h2>
              <button onClick={() => setShowProductManagement(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ProductManagement
                products={products}
                onAddProduct={addProduct}
                onUpdateProduct={updateProduct}
                onDeleteProduct={deleteProduct}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
