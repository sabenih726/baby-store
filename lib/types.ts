export interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
  barcode: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface Receipt {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  cash: number
  change: number
  timestamp: Date
  transactionId: number
}
