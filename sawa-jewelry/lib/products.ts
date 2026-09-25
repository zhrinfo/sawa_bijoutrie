export interface Product {
  id: string
  image: string
  title: string
  price: string
  category: 'Rings' | 'Earrings' | 'Necklaces' | 'Bracelets' | 'Watches'
  badge?: string
}

export const products: Product[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    title: 'Moonlight Diamond Bracelet',
    price: '$3,800',
    category: 'Bracelets',
    badge: 'Just In',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    title: 'Celestial Pearl Set',
    price: '$4,100',
    category: 'Necklaces',
    badge: 'New',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80',
    title: 'Golden Hour Earrings',
    price: '$2,400',
    category: 'Earrings',
    badge: 'New',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    title: 'Midnight Sapphire Ring',
    price: '$2,950',
    category: 'Rings',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    title: 'Diamond Solitaire Ring',
    price: '$4,250',
    category: 'Rings',
    badge: 'Best Seller',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80',
    title: 'Pearl Elegance Necklace',
    price: '$2,800',
    category: 'Necklaces',
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=600&q=80',
    title: 'Ruby Heart Pendant',
    price: '$3,450',
    category: 'Necklaces',
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    title: 'Emerald Drop Earrings',
    price: '$1,950',
    category: 'Earrings',
    badge: 'Limited',
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80',
    title: 'Diamond Tennis Bracelet',
    price: '$5,600',
    category: 'Bracelets',
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80',
    title: 'Sapphire Classic Watch',
    price: '$6,200',
    category: 'Watches',
  },
  {
    id: '11',
    image: 'https://images.unsplash.com/photo-1603561596112-db7f8f7f3c85?w=600&q=80',
    title: 'Rose Gold Hoops',
    price: '$1,600',
    category: 'Earrings',
  },
  {
    id: '12',
    image: 'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=600&q=80',
    title: 'Lumiere Gold Bangle',
    price: '$2,200',
    category: 'Bracelets',
  },
]