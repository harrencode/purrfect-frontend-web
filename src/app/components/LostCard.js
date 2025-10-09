'use client'

const pets = [
  {
    name: 'Micky',
    gender: 'Female',
    location: 'XCMP-JC4, Weligama',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80g',
  },
  {
    name: 'Roy',
    gender: 'Male',
    location: 'XCHP-OG, Weligama',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Speedy',
    gender: 'Female',
    location: '4MNW+GP, Walasmulla',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mori',
    gender: 'Male',
    location: '2FW2+H2, Henegama',
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80',
  },
]

export default function LostCard() {
  return (
    <section className="py-8 px-4 bg-yellow-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Missing Paws near you</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pets.map((pet, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={pet.image} alt={pet.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
              <p className="text-sm text-gray-600">{pet.gender}</p>
              <p className="text-sm text-gray-600">{pet.location}</p>
              <button className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-white text-sm px-4 py-2 rounded">
                Mark Sighting
              </button>
              <p className="mt-2 text-xs text-blue-600 cursor-pointer hover:underline">
                Click for more details
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
