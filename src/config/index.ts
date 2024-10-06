export const PRODUCT_CATEGORIES = [
  {
    label: 'UI Kits',
    value: 'ui_kits' as const,
    featured: [
      {
        name: 'Editor picks',
        href: '#',
        imageSrc: '/Nav/ui-kits/mixed.jpg'
      },
      {
        name: 'New Arrivals',
        href: '#',
        imageSrc: '/Nav/ui-kits/blue.jpg'
      },
      {
        name: 'Bestseller',
        href: '#',
        imageSrc: '/Nav/ui-kits/purple.jpg'
      }
    ]
  },
  {
    label: 'Icons',
    value: 'icons' as const,
    featured: [
      {
        name: 'Favorite Icon Picks',
        href: '#',
        imageSrc: '/Nav/Icons/picks.jpg'
      },
      {
        name: 'New Arrivals',
        href: '#',
        imageSrc: '/Nav/Icons/new.jpg'
      },
      {
        name: 'Bestsellering Icons',
        href: '#',
        imageSrc: '/Nav/Icons/bestsellers.jpg'
      }
    ]
  }
]
