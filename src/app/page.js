import Map from "./components/Map";
import { UserSearch, HeartHandshake, PawPrint, Store} from "lucide-react";
export default function Home() {
  return (
    <div>
      {/* hero section */}
    <section
                className="relative w-full h-[400px] flex items-center justify-center bg-white bg-center"
                style={{
                    backgroundImage:
                    "url('/images/hero-image.png')", // put your image (dog + cat) in public/images/hero-bg.jpg
                }}
                >
      
      {/* <div className=" w-full h-[40vh] px-4 bg-white"> */}
      <div className="flex justify-between m-auto items-center bg-white/40 backdrop-blur-[3px] shadow-md  w-full h-full flex flex-col md:flex-row items-center gap-6">
        <div className="text-center mx-20 animate-fade-in">
          <h1 className="text-black text-6xl font-bold">1526</h1>
          <h1 className="text-black text-xl">Rescues</h1>
        </div>
        <div className="text-center mx-20 animate-fade-in delay-200">
          <h1 className="text-black text-6xl font-bold">2596</h1>
          <h1 className="text-black text-xl">Adoptions</h1>
        </div>
        <div className="text-center mx-20 animate-fade-in delay-400">
          <h1 className="text-black text-6xl font-bold">44575</h1>
          <h1 className="text-black text-xl">Located</h1>
        </div>
      </div>
    </section>

    {/* main cards */}

    <section className="py-10 bg-red-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Responsive grid — 1 column on mobile, 2 on tablets, 4 on desktops */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300 w-full max-w-xs">
            <PawPrint className="w-20 h-20 text-black mx-auto mb-4" />
            <a href="/rescues" className="text-black hover:underline text-lg font-semibold">
              Report a Rescue
            </a>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300 w-full max-w-xs">
            <HeartHandshake className="w-20 h-20 text-black mx-auto mb-4" />
            <a href="/adoptions" className="text-black hover:underline text-lg font-semibold">
              Adopt a Pet
            </a>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300 w-full max-w-xs">
            <UserSearch className="w-20 h-20 text-black mx-auto mb-4" />
            <a href="/lost-found" className="text-black hover:underline text-lg font-semibold">
              Lost & Found
            </a>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300 w-full max-w-xs">
            <Store className="w-20 h-20 text-black mx-auto mb-4" />
            <a href="/store" className="text-black hover:underline text-lg font-semibold">
              Store
            </a>
          </div>

        </div>
      </div>
    </section>


    <section>
      {/* <h1 className="bg-green-100 text-black pl-15 pt-5">Meet your Purr-fect Match</h1> */}
      <h1 className="text-black text-2xl font-bold pl-15 pt-5 bg-green-100 m-auto">Purr-fect Stray Locator</h1>
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
    {/* map and  notifications */}
    <section className="px-10 bg-green-100">
      {/* <div className="flex flex-row">
      
        <div className="basis-1/2">
          <h1 className="bg-green-100 text-black pl-15 pt-5">Purr-fect Stray locator</h1>
        </div>
        <div className="basis-1/2">
          <h1 className="bg-green-100 text-black pl-15 pt-5">Rescue Alerts Near you</h1>
        </div>
      </div> */}

      <div className="flex flex-row w-full h-[80vh]">
        
        {/* Left: Map Section */}
        <div className="basis-1/2 bg-green-100 p-4">
          <h1 className="text-black text-2xl font-bold mb-4">Purr-fect Stray Locator</h1>
          
          <div id="map" className="w-full h-auto rounded-lg shadow-md">
            <Map />
          </div>
        </div>

        {/* Right: Rescue Alerts Section */}
        <div className="basis-1/2 bg-green-100 p-4 overflow-y-auto">
          <h1 className="text-black text-2xl font-bold mb-4">Rescue Alerts Near You</h1>
          <div className="space-y-4">
            {[
              { time: '10 min ago', type: 'Injured dog', status: 'Critical', distance: '2.5 km' },
              { time: '1 hr ago', type: 'Newborn kitten', status: 'Abandoned', distance: '10 km' },
              { time: '5 hr ago', type: 'Small Puppy', status: 'Skin Disease', distance: '7 km' },
              // { time: '6 hr ago', type: 'Stray Cat', status: 'Hungry', distance: '3.2 km' },
              // { time: '8 hr ago', type: 'Lost Dog', status: 'Wandering', distance: '5.5 km' },
            ].map((alert, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500">🔔 {alert.time}</p>
                <h2 className="text-lg font-semibold text-gray-800">{alert.type}</h2>
                <p className="text-sm text-red-600">{alert.status}</p>
                <p className="text-sm text-gray-600">{alert.distance}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    </div>


    
  );
}
