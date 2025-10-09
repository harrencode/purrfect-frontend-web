"use client"
import { PawPrint } from "lucide-react"; 
export default function Rescues (){
    return(
        <div>
            {/* hero section */}
            <section
                className="relative w-full h-[400px] flex items-center justify-center bg-white bg-center"
                style={{
                    backgroundImage:
                    "url('/images/hero-image.png')", // put your image (dog + cat) in public/images/hero-bg.jpg
                }}
                >
                {/* Overlay box */}
                <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md px-8 py-6 max-w-3xl w-[90%] flex flex-col md:flex-row items-center gap-6">
                    {/* Left icon */}
                    <div className="flex-shrink-0">
                    <PawPrint className="w-20 h-20 text-black" />
                    </div>

                    {/* Text and buttons */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-semibold text-black">
                        Love, Care, Adopt – One paw at a time
                    </h2>
                    <p className="text-gray-800 text-sm mt-2">
                        Connect with animals in need. Make a difference.<br />
                        AI powered search to find the best match
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition">
                        List for Adoption
                        </button>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition">
                        Advanced Search
                        </button>
                    </div>
                    </div>
                </div>
            </section>
            <section>
                <h1 className="bg-green-100 text-black pl-15 pt-5">Meet your Purr-fect Match</h1>
                <div className="flex flex-wrap justify-center gap-6 p-6 bg-green-100">
                    {/* card 1 */}
                    <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-80 h-80 ">
                    <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
                        <img src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80" alt="card-image" />
                    </div>
                    <div className="p-4">
                        <h6 className="mb-2 text-slate-800 text-xl font-semibold">Luna</h6>
                        <p className="text-slate-600 leading-normal font-light">
                        Female | 1 year
                        </p>
                    </div>
                    
                    </div>


                    {/* card 2 */}
                    <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-80 h-80 ">
                    <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
                        <img src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80" alt="card-image" />
                    </div>
                    <div className="p-4">
                        <h6 className="mb-2 text-slate-800 text-xl font-semibold">Luna</h6>
                        <p className="text-slate-600 leading-normal font-light">
                        Female | 1 year
                        </p>
                    </div>
                    
                    </div>

                    {/* card 3 */}
                    <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-80 h-80 ">
                    <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
                        <img src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80" alt="card-image" />
                    </div>
                    <div className="p-4">
                        <h6 className="mb-2 text-slate-800 text-xl font-semibold">Luna</h6>
                        <p className="text-slate-600 leading-normal font-light">
                        Female | 1 year
                        </p>
                    </div>
                    
                    </div>

                    {/* card 4 */}
                    <div className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-80 h-80 ">
                    <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
                        <img src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80" alt="card-image" />
                    </div>
                    <div className="p-4">
                        <h6 className="mb-2 text-slate-800 text-xl font-semibold">Luna</h6>
                        <p className="text-slate-600 leading-normal font-light">
                        Female | 1 year
                        </p>
                    </div>
                    
                    </div>

                    
                </div>
            </section>
        </div>
    )
}