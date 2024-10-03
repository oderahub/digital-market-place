import axios from 'axios'

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

export const paystack = {
  transaction: {
    initialize: async (data: {
      amount: number
      email: string
      reference: string
      callback_url: string
      metadata?: Record<string, any>
    }) => {
      const response = await axios.post('https://api.paystack.co/transaction/initialize', data, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    }
  }
}

// Paystack verify payment

export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`
      }
    })

    if (response.data.status !== 'success') {
      throw new Error('Payment verification failed')
    }

    return response.data
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error verifying payment: ${error.message}`)
    } else {
      console.error('Error verifying payment: Unknown error')
    }
    throw new Error('Failed to verify payment')
  }
}
