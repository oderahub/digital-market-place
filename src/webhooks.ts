import { WebhookRequest } from './server' // Adjust this import based on your file structure
import express from 'express'
import { getPayloadClient } from './get-payload'
import { verifyPayment } from './lib/paystack'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Paystack Webhook Handler
export const paystackWebhookHandler = async (req: express.Request, res: express.Response) => {
  try {
    // Cast the request to your custom WebhookRequest
    const webhookReq = req as unknown as WebhookRequest
    const payload = JSON.parse(webhookReq.rawBody.toString('utf8')) // Parse the payload from the raw body
    const signature = webhookReq.headers['x-paystack-signature'] as string // Ensure it's a string
    const reference = payload.data?.reference

    console.log('Webhook payload:', payload) // Log incoming payload
    console.log('Received signature:', signature)

    // Validate the webhook signature
    const isValidSignature = (signature: string, rawBody: Buffer) => {
      const secret = process.env.PAYSTACK_SECRET_KEY
      if (!secret) {
        throw new Error('PAYSTACK_SECRET_KEY is not defined')
      }
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
      return signature === hash
    }

    // Verify webhook signature
    if (!signature || !isValidSignature(signature, webhookReq.rawBody)) {
      console.error('Invalid Paystack signature')
      return res.status(400).send('Invalid or missing Paystack signature')
    }

    // Call verifyPayment to verify the transaction on Paystack
    const verificationResponse = await verifyPayment(reference)
    console.log('Verification Response:', verificationResponse)
    const isPaymentSuccessful = verificationResponse.data?.status === 'success'

    if (!isPaymentSuccessful) {
      return res
        .status(400)
        .json({ error: 'Payment verification failed', details: verificationResponse })
    }

    // Handle successful Paystack event and update the order in Payload CMS

    if (payload.event === 'charge.success') {
      const payloadClient = await getPayloadClient()

      // Extract userId from session or payload
      const session = payload.data?.metadata

      if (!session || !session.userId) {
        return res.status(400).json({ error: 'UserId not found in session metadata' })
      }

      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          id: {
            equals: session.metadata.userId
          }
        }
      })

      const [user] = users

      if (!user) return res.status(404).json({ error: 'No such user exists.' })

      const { docs: orders } = await payloadClient.find({
        collection: 'orders',
        where: {
          id: {
            equals: reference.split('_')[1] // Extract orderId from the reference
          }
        }
      })

      const [order] = orders

      if (!order) {
        return res.status(404).json({ error: 'No matching order found.' })
      }

      // Update the order to mark it as paid and save the payment details
      await payloadClient.update({
        collection: 'orders',
        id: order.id,
        data: {
          _isPaid: true,
          paymentReference: reference,
          paymentProvider: 'paystack'
        }
      })

      // send receipt
    }

    return res.status(200).send('Webhook processed successfully')
  } catch (err) {
    console.error('Error processing Paystack webhook:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: 'Webhook processing failed', details: errorMessage })
  }
}
