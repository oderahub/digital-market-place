import { clsx, type ClassValue } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: 'USD' | 'EUR' | 'GBP' | 'BDT' | 'NGR'
    notation?: Intl.NumberFormatOptions['notation']
  } = {}
) {
  const { currency = 'USD', notation = 'compact' } = options

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price

  return new Intl.NumberFormat('en-Us', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 2
  }).format(numericPrice)
}

//metadata
export function constructMetadata({
  title = 'Digitalmarketplace - the marketplace for digital assets',
  description = 'DigitalHippo is a marketplace for high-quality digital goods.',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = false
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@oderahdev'
    },
    icons,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL as string),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
