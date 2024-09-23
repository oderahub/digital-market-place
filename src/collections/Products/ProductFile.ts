import { Access, CollectionConfig } from 'payload/types'
import { Product, User } from '../../payload-types'
import { BeforeChangeHook } from 'payload/dist/collections/config/types'

const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null

  if (user?.role === 'admin') return true

  if (!user) return false

  const { docs: products } = await req.payload.find({
    collection: 'products',
    depth: 0,
    where: {
      user: {
        equals: user.id
      }
    }
  })
  // geting all the product you own
  const ownProductFileIds = products.map((prod) => prod.product_file).flat()

  // access to all products bought

  const { docs: orders } = await req.payload.find({
    collection: 'orders',
    depth: 2,
    where: {
      user: {
        equals: user.id
      }
    }
  })
  const purchasedProductFileIds = orders
    .map((order) => {
      // Assuming `order.products` is an array of Product or string references
      return (order.products as (string | Product)[]).map((product) => {
        if (typeof product === 'string') {
          req.payload.logger.error('Search depth not sufficient to find purchased file IDs')
          return null // Handle the case where product is a string (id) rather than an object
        }

        return typeof product.product_file === 'string'
          ? product.product_file // If `product_file` is a string (id), return it directly
          : product.product_file.id // Otherwise, return the `id` of the product file
      })
    })
    .filter(Boolean)
    .flat()

  return {
    id: {
      in: [...ownProductFileIds, ...purchasedProductFileIds]
    }
  }
}

const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null
  return { ...data, user: user?.id }
}

export const ProductFiles: CollectionConfig = {
  slug: 'product_files',
  admin: {
    hidden: ({ user }) => user.role !== 'admin'
  },
  hooks: {
    beforeChange: []
  },
  access: {
    read: yourOwnAndPurchased,
    update: ({ req }) => req.user.role === 'admin',
    delete: ({ req }) => req.user.role === 'admin'
  },
  upload: {
    staticURL: '/product_files',
    staticDir: 'product_files',
    mimeTypes: ['image/*', 'fonts/*', 'application/postscript']
  },

  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: () => false
      },
      hasMany: false,
      required: true
    }
  ]
}
