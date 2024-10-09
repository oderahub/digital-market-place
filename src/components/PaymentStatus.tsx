'use client'

import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { useEffect, useCallback } from 'react'
import { useCart } from '../hooks/use-cart'

interface PaymentStatusProps {
  orderEmail: string
  orderId: string
  isPaid: boolean
}

const PaymentStatus = ({ orderEmail, orderId, isPaid }: PaymentStatusProps) => {
  const router = useRouter()
  const { clearCart } = useCart()

  const { data } = trpc.payment.pollingOrderStatus.useQuery(
    { orderId },
    {
      enabled: true,
      refetchInterval: (data) => (data?.isPaid ? false : 1000),
    }
  )

  const handlePaymentComplete = useCallback(() => {
    clearCart()
    router.refresh()
  }, [clearCart, router])

  useEffect(() => {
    if (data?.isPaid) {
      handlePaymentComplete()
    } else {
      clearCart()
    }
  }, [data?.isPaid, handlePaymentComplete, clearCart])

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
      <div>
        <p className="font-medium text-gray-900">Shipping To</p>
        <p>{orderEmail}</p>
      </div>

      <div>
        <p className="font-medium text-gray-900">Order status</p>
        <p>{isPaid ? 'Payment successful' : 'Pending payment'}</p>
      </div>
    </div>
  )
}

export default PaymentStatus
