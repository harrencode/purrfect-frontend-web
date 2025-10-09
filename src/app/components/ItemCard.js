'use client'

const items = [
  {
    name: 'Cat Food',
    price: '750',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Dog Food',
    price: '900',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Dog Treats',
    price: '300',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cat Treats',
    price: '400',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cat Toys',
    price: '850',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Dog Toys',
    price: '950',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Accessories',
    price: '500',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Merchandise',
    price: '1000',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
]

export default function ItemCard() {
  return (
    <section className="py-8 px-4 bg-yellow-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Missing Paws near you</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">Rs.{item.price} upwards</p>              
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
