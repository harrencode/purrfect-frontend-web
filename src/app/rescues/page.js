"use client"

import { HeartHandshake } from "lucide-react"; 
import RescueMissions from "../components/RescueMissions";
export default function Adopts(){
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
                    <HeartHandshake className="w-20 h-20 text-black" />
                    </div>

                    {/* Text and buttons */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-semibold text-black">
                        Rescue, Heal, Hope - Every Life Matters
                    </h2>
                    <p className="text-gray-800 text-sm mt-2">
                        Every rescue begins with someone who cares.<br />
                        AI powered search to find the best match
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition">
                        Report a Rescue
                        </button>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition">
                        Advanced Search
                        </button>
                    </div>
                    </div>
                </div>
            </section>


            <section>
                <RescueMissions />
            </section>
        </div>
    )
}