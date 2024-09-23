'use client'

import Link from 'next/link'
import { TQueryValidator } from '../lib/validators/query-validator'
import { trpc } from '@/trpc/client'
import { Product } from '../payload-types'
import ProductListing from './ProductListing'

// Define the interface for ProductReelProps to handle component props
interface ProductReelProps {
  title: string // Title for the product reel section
  subtitle?: string // Optional subtitle
  href?: string // Optional link to a collection page
  query: TQueryValidator // Query parameters for fetching products
}

// Fallback limit for products to be displayed if not provided in the query
const FALLBACK_LIMIT = 4

// Main ProductReel component
const ProductReel = (props: ProductReelProps) => {
  const { title, subtitle, href, query } = props

  // Fetch product data with an infinite query using tRPC
  const { data: queryResults, isLoading } = trpc.getInfiniteProducts.useInfiniteQuery(
    {
      limit: query.limit ?? FALLBACK_LIMIT, // Use limit from query or fallback
      query
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage // Get the next page for infinite scroll
    }
  )

  // Flatten paginated product results into a single array
  const products = queryResults?.pages.flatMap((page) => page.items)

  // Setting up the product map, which will hold the products or loading placeholders
  let map: (Product | null)[] = []

  // Type guard function to ensure an item matches the Product type
  function isProduct(item: any): item is Product {
    return (
      typeof item === 'object' &&
      item !== null &&
      'name' in item &&
      'price' in item &&
      'category' in item &&
      'product_file' in item
    )
  }

  // Populate the map either with valid products or placeholders for loading state
  if (products && products.length) {
    // Map through the products and only keep valid Product objects
    map = products.map((item) => (isProduct(item) ? item : null))
  } else if (isLoading) {
    // If loading, fill the map with null placeholders for skeleton components
    map = new Array<null>(query.limit ?? FALLBACK_LIMIT).fill(null)
  }

  // Return the JSX to render the product reel section
  return (
    <section className="py-12">
      {/* Header section for title, subtitle, and optional link */}
      <div className="md:flex md:items-center md:justify-between mb-4">
        <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
          {/* Conditionally render title */}
          {title ? <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1> : null}
          {/* Conditionally render subtitle */}
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        {/* Conditionally render a link to the collection page if provided */}
        {href ? (
          <Link
            href={href}
            className="hidden text-sm font-medium text-blue-600 hover:text-blue-500 md:block"
          >
            shop the collection <span aria-hidden="true">&rarr;</span>
          </Link>
        ) : null}
      </div>

      {/* Main content area to display product listings */}
      <div className="relative">
        <div className="mt-6 flex items-center w-full">
          {/* Display products or placeholders in a responsive grid layout */}
          <div className="w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8">
            {/* Map over the product array and render a ProductListing component for each product */}
            {map.map((product, i) => (
              <ProductListing key={i} product={product} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductReel
