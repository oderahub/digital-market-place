'use client'

import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { date } from 'zod'

interface PaymentStatusProps {
  orderEmail: string
  orderId: string
  isPaid: boolean
}

const PaymentStatus = ({ orderEmail, orderId, isPaid }: PaymentStatusProps) => {
  // calling the polling from payment router
  const router = useRouter()

  const { data } = trpc.payment.pollingOrderStatus.useQuery(
    { orderId },
    {
      enabled: isPaid === false,
      refetchInterval: (data) => (data?.isPaid ? false : 1000)
    }
  )

  useEffect(() => {
    if (data?.isPaid) router.refresh()
  }, [data?.isPaid, router])

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
      <div>
        <p className="font-medium text-gray-900">Shippin To</p>
        <p>{orderEmail}</p>
      </div>

      <div>
        <p className="font-medium text-gray-900">Order status</p>
        <p>{isPaid ? 'Payment sucessful' : 'Pending payment'}</p>
      </div>
    </div>
  )
}

export default PaymentStatus
