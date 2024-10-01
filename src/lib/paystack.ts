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
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    }
  }
}

// Paystack integration to verify payment
export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    })

    return response.data
  } catch (error) {
    throw new Error('Failed to verify payment')
  }
}
