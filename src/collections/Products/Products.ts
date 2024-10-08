import { AfterChangeHook, BeforeChangeHook } from 'payload/dist/collections/config/types'
import { Access, CollectionConfig } from 'payload/types'
import { Product, User } from '../../payload-types'
import { PRODUCT_CATEGORIES } from '../../config'

// Add the user to the product
const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user
  return { ...data, user: user.id }
}

// Sync user products after change
const syncUser: AfterChangeHook<Product> = async ({ req, doc }) => {
  const fullUser = await req.payload.findByID({
    collection: 'users',
    id: req.user.id
  })

  if (fullUser && typeof fullUser === 'object') {
    const products = fullUser.products as Array<string | Product> // Explicitly cast as an array of Product

    const allIDs = [
      ...(products?.map((product: string | Product) =>
        typeof product === 'object' ? product.id : product
      ) || [])
    ]
    const createdProductIDs = allIDs.filter((id, index) => allIDs.indexOf(id) === index)
    const dataToUpdate = [...createdProductIDs, doc.id]

    await req.payload.update({
      collection: 'users',
      id: fullUser.id,
      data: {
        products: dataToUpdate
      }
    })
  }
}

// Access control to allow admins or users with access to read/update/delete their products
const isAdminOrHasAccess =
  (): Access =>
  ({ req: { user: _user } }) => {
    const user = _user as User | undefined

    if (!user) return false
    if (user.role === 'admin') return true

    const userProductIDs = (user.products || []).reduce<Array<string>>((acc, product) => {
      if (!product) return acc
      if (typeof product === 'string') {
        acc.push(product)
      } else {
        acc.push((product as Product).id)
      }

      return acc
    }, [])

    return {
      id: {
        in: userProductIDs
      }
    }
  }

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name'
  },
  access: {
    read: isAdminOrHasAccess(),
    update: isAdminOrHasAccess(),
    delete: isAdminOrHasAccess()
  },
  hooks: {
    afterChange: [syncUser],
    beforeChange: [addUser]
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        condition: () => false
      }
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Product details'
    },
    {
      name: 'price',
      label: 'Price in USD',
      min: 0,
      max: 1000,
      type: 'number',
      required: true
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      // Replace this with dynamic categories if needed
      required: true
    },
    {
      name: 'product_files',
      label: 'Product file(s)',
      type: 'relationship',
      required: true,
      relationTo: 'product_files',
      hasMany: false
    },
    {
      name: 'approvedForSale',
      label: 'Product Status',
      type: 'select',
      defaultValue: 'pending',
      access: {
        create: ({ req }) => req.user.role === 'admin',
        read: ({ req }) => req.user.role === 'admin',
        update: ({ req }) => req.user.role === 'admin'
      },
      options: [
        {
          label: 'Pending verification',
          value: 'pending'
        },
        {
          label: 'Approved',
          value: 'approved'
        },
        {
          label: 'Denied',
          value: 'denied'
        }
      ]
    },
    {
      name: 'images',
      type: 'array',
      label: 'Product images',
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: 'Image',
        plural: 'Images'
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true
        }
      ]
    }
  ]
}
