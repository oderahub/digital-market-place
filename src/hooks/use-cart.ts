// add items to cart
// remove items
// clear cart
// ( keep track of cart items)
// regular react state dont persist when u reload the page but our cart will persist cus we use the persist and it save our state in local storage

import { Product } from '@/payload-types'
import { toast } from 'sonner'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type CartItem = {
  product: Product
}

type CartState = {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const isProductInCart = state.items.some((Item) => Item.product.id === product.id)

          if (isProductInCart) {
            toast.error('Product is already in the cart')
            return state
          }
          return { items: [...state.items, { product }] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((Item) => Item.product.id !== id)
        })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
