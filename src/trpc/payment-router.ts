// import { z } from 'zod'
// import { privateProcedure, publicProcedure, router } from './trpc'
// import { TRPCError } from '@trpc/server'
// import { getPayloadClient } from '../get-payload'
// import { stripe } from '../lib/stripe'
// import type Stripe from 'stripe'

// export const paymentRouter = router({
//   createSession: privateProcedure
//     .input(z.object({ productIds: z.array(z.string()) }))
//     .mutation(async ({ ctx, input }) => {
//       const { user } = ctx
//       let { productIds } = input

//       if (productIds.length === 0) {
//         throw new TRPCError({ code: 'BAD_REQUEST' })
//       }

//       const payload = await getPayloadClient()

//       const { docs: products } = await payload.find({
//         collection: 'products',
//         where: {
//           id: {
//             in: productIds
//           }
//         }
//       })

//       const filteredProducts = products.filter((prod) => Boolean(prod.priceId))

//       const order = await payload.create({
//         collection: 'orders',
//         data: {
//           _isPaid: false,
//           products: filteredProducts.map((prod) => prod.id),
//           user: user.id
//         }
//       })

//       const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

//       filteredProducts.forEach((product) => {
//         line_items.push({
//           price: product.priceId!,
//           quantity: 1
//         })
//       })

//       line_items.push({
//         price: 'price_1OCeBwA19umTXGu8s4p2G3aX',
//         quantity: 1,
//         adjustable_quantity: {
//           enabled: false
//         }
//       })

//       try {
//         const stripeSession = await stripe.checkout.sessions.create({
//           success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
//           cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
//           payment_method_types: ['card', 'paypal'],
//           mode: 'payment',
//           metadata: {
//             userId: user.id,
//             orderId: order.id
//           },
//           line_items
//         })

//         return { url: stripeSession.url }
//       } catch (err) {
//         return { url: null }
//       }
//     }),
//   pollOrderStatus: privateProcedure
//     .input(z.object({ orderId: z.string() }))
//     .query(async ({ input }) => {
//       const { orderId } = input

//       const payload = await getPayloadClient()

//       const { docs: orders } = await payload.find({
//         collection: 'orders',
//         where: {
//           id: {
//             equals: orderId
//           }
//         }
//       })

//       if (!orders.length) {
//         throw new TRPCError({ code: 'NOT_FOUND' })
//       }

//       const [order] = orders

//       return { isPaid: order._isPaid }
//     })
// })

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
        (sum, product) => sum + (product.price as number) * 100,
        0
      )

      if (!totalAmount) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid product prices' })
      }

      // Create order in Payload CMS
      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id.toString()),
          user: user.id
        }
      })

      // Initialize Paystack transaction with metadata
      const paystackSession = await paystack.transaction.initialize({
        amount: totalAmount, // Total amount in kobo
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
