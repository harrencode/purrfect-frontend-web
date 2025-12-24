'use client';
import { useState } from 'react';
import { MapPinned } from 'lucide-react';
import FullMap from '../components/FullMap';
import FormModal from '../components/FormModal';
import FullPageLoader from '../components/FullPageLoader'; 

export default function StrayMap() {
  const [formType, setFormType] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  
  const [mapLoading, setMapLoading] = useState(true);
  const pageLoading = mapLoading;

  const openForm = (type) => setFormType(type);
  const closeForm = () => setFormType(null);

  return (
    <div className="relative min-h-screen">
        {/* Full page loader */}
        {pageLoading && <FullPageLoader />}
      <section
        className="relative w-full h-[400px] flex items-center justify-center bg-white bg-center"
        style={{ backgroundImage: "url('/images/hero-image.png')" }}
      >
        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md px-8 py-6 max-w-3xl w-[90%] flex flex-col md:flex-row items-center gap-6">
          <MapPinned className="w-20 h-20 text-black" />
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-semibold text-black">
              Find Help - Save Lives
            </h2>
            <p className="text-gray-800 text-sm mt-2">
              Discover nearby rescue homes, veterinary centers and report stray animals.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
              <button
                onClick={() => openForm('RescueHome')}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition"
              >
                + Rescue Home
              </button>
              <button
                onClick={() => openForm('VetCenter')}
                className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-medium transition"
              >
                + Vet Center
              </button>
              <button
                onClick={() => openForm('StrayAnimal')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition"
              >
                + Stray Animal
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center gap-4 pt-8 pb-4 bg-green-50">
        <button
          onClick={() => setSelectedType('')}
          className={`px-4 py-2 rounded-full font-medium transition ${
            selectedType === ''
              ? 'bg-gray-900 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedType('rescue_home')}
          className={`px-4 py-2 rounded-full font-medium transition ${
            selectedType === 'rescue_home'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Rescue Homes
        </button>
        <button
          onClick={() => setSelectedType('vet_center')}
          className={`px-4 py-2 rounded-full font-medium transition ${
            selectedType === 'vet_center'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vet Centers
        </button>
        <button
          onClick={() => setSelectedType('stray_animal')}
          className={`px-4 py-2 rounded-full font-medium transition ${
            selectedType === 'stray_animal'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Stray Animals
        </button>
      </div>

       {/* Map */}
      <section className="relative">
        {/* let the map tell us when it’s done loading */}
        <FullMap
          selectedType={selectedType}
          onLoaded={() => setMapLoading(false)}
        />
      </section>

      {formType && <FormModal type={formType} onClose={closeForm} />}
    </div>
  );
}
