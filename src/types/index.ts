export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  is_new: boolean
  sizes: string[]
  created_at: string
  updated_at: string
  images?: ProductImage[]
  reviews?: Review[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface Reservation {
  id: string
  product_id: string | null
  first_name: string
  last_name: string
  phone: string
  email: string
  message: string | null
  status: 'new' | 'contacted' | 'completed'
  created_at: string
  updated_at: string
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  customer_name: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
  product?: Product
}

export interface Admin {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}