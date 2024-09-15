import { Access, CollectionConfig } from 'payload/types'
import { User } from '../../payload-types'
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
      return order.products.map((product) => {
        if (typeof product === 'string')
          return req.payload.logger.error('Search depth not sufficient to find purchased file IDs')

        return typeof product.product_file === 'string'
          ? product.product_file
          : product.product_file.id
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
