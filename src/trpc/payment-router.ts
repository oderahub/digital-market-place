import { z } from 'zod'
import { privateProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { getPayloadClient } from '../get-payload'
import { paystack } from '../lib/paystack'

export const paymentRouter = router({
  createSession: privateProcedure
    .input(
      z.object({
        productIds: z.array(z.string())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { productIds } = input

      if (productIds.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No products selected' })
      }

      const payload = await getPayloadClient()

      // Fetch products based on input product IDs
      const { docs: products } = await payload.find({
        collection: 'products',
        where: {
          id: { in: productIds }
        }
      })

      const filteredProducts = products.filter((prod) => Boolean(prod.price))
      const totalAmount = products.reduce(
        (sum, product) => sum + (product.price as number) * 100, // price in kobo (minor currency unit)
        0
      )

      // Define a fixed transaction fee (in kobo)
      const transactionFee = 100 // Example: 100 kobo, you can adjust the amount

      // Add the transaction fee to the total amount
      const totalAmountWithFee = totalAmount + transactionFee

      if (!totalAmountWithFee) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid product prices' })
      }

      // Create order in Payload CMS
      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id.toString()),
          user: user.id
          // transactionFee // Optional: store transaction fee in the order for future reference
        }
      })

      // Initialize Paystack transaction with metadata and total amount including fee
      const paystackSession = await paystack.transaction.initialize({
        amount: totalAmountWithFee, // Total amount in kobo including fee
        email: user.email,
        reference: `order_${order.id}`,
        callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
        metadata: {
          userId: user.id,
          orderId: order.id,
          cancel_action: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`
        }
      })

      return { url: paystackSession.data.authorization_url }
    }),

  pollingOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input

      const payload = await getPayloadClient()

      const { docs: orders } = await payload.find({
        collection: 'orders',
        where: {
          id: {
            equals: orderId
          }
        }
      })

      if (!orders.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const [order] = orders

      return { isPaid: order._isPaid }
    })
})
