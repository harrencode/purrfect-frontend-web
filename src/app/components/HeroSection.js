// "use client";

// import { useCallback, useEffect, useState } from "react";

// function formatNumber(num) {
//   if (num === null || num === undefined) return "0";
//   if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
//   if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
//   if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
//   return num.toLocaleString();
// }

// function useCountUp(target, duration = 1200) {
//   const [value, setValue] = useState(0);

//   useEffect(() => {
//     let frame;
//     const start = performance.now();
//     const endValue = Number(target) || 0;

//     const animate = (time) => {
//       const progress = Math.min((time - start) / duration, 1);
//       setValue(Math.round(endValue * progress));
//       if (progress < 1) frame = requestAnimationFrame(animate);
//     };

//     frame = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(frame);
//   }, [target]);

//   return value;
// }

// function StatCard({ label, value, icon, delay }) {
//   const animatedValue = useCountUp(value);

//   return (
//     <div
//       className="text-center space-y-2 transform transition-all rounded-xl px-4 py-4 bg-white/70 backdrop-blur-sm border border-white/60 hover:shadow-md"
//       style={{ transitionDelay: `${delay}ms` }}
//     >
//       <div className="flex items-center justify-center gap-1 text-slate-700 text-[10px] sm:text-xs uppercase tracking-[0.15em] font-semibold">
//         <span className="text-lg">{icon}</span>
//         {label}
//       </div>

//       <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
//         {formatNumber(animatedValue)}
//       </p>
//     </div>
//   );
// }

// export default function HeroSection() {
//   const [stats, setStats] = useState({ rescues: 0, adoptions: 0, located: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchStats = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const baseUrl =
//         process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

//       const res = await fetch(`${baseUrl}/api/stats`, {
//         headers: { Accept: "application/json" },
//         cache: "no-store",
//       });

//       if (!res.ok) throw new Error("Failed to fetch stats");

//       const data = await res.json();
//       setStats(data);
//     } catch (err) {
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);

//   const items = [
//     { label: "Rescues", value: stats.rescues, icon: "🐾" },
//     { label: "Adoptions", value: stats.adoptions, icon: "🏠" },
//     { label: "Located", value: stats.located, icon: "📍" },
//   ];

//   return (
//     <section className="relative w-full min-h-[350px] overflow-hidden">
//       {/* Background */}
//       <div
//         className="absolute inset-0 bg-cover bg-center"
//         style={{ backgroundImage: "url('/images/hero-image.png')" }}
//       />

//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/20" />

//       {/* Content */}
//       <div className="relative z-10 w-full px-4 py-10 sm:py-14 md:py-16 flex justify-center">
//         <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/70 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12">
            
//             {/* TEXT SIDE */}
//             <div className="text-center md:text-left space-y-3 max-w-md text-balance">
//               <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
//                 Live impact
//               </p>

//               <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-400">
//                 Every number is a life changed.
//               </h1>

//               <p className="text-sm sm:text-base text-slate-300">
//                 Real-time stats of rescues, successful adoptions and reunions.
//               </p>
//             </div>

//             {/* STATS SIDE */}
//             <div className="w-full">
//               {loading ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                   {[1, 2, 3].map((i) => (
//                     <div
//                       key={i}
//                       className="h-20 rounded-xl bg-slate-200 animate-pulse"
//                     />
//                   ))}
//                 </div>
//               ) : error ? (
//                 <div className="flex flex-col items-center gap-3">
//                   <p className="text-red-600 text-sm">{error}</p>
//                   <button
//                     onClick={fetchStats}
//                     className="px-4 py-2 bg-white border rounded-full shadow-sm hover:bg-slate-50"
//                   >
//                     Retry
//                   </button>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                   {items.map((item, i) => (
//                     <StatCard
//                       key={item.label}
//                       label={item.label}
//                       value={item.value}
//                       icon={item.icon}
//                       delay={i * 100}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           <p className="mt-6 text-[10px] sm:text-xs text-slate-500 text-center md:text-right">
//             Updated in real-time from our rescue & adoption database.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import { useCallback, useEffect, useState } from "react";

function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

// only start counting after stats are loaded
function useCountUp(target, duration = 1200, start = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let frame;
    const startTime = performance.now();
    const endValue = Number(target) || 0;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);

      // optional nicer easing (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(endValue * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    // reset to 0 each time we (re)start counting
    setValue(0);
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);

  return value;
}

function StatCard({ label, value, icon, delay, start }) {
  const animatedValue = useCountUp(value, 1200, start);

  return (
    <div
      className="text-center space-y-2 transform transition-all rounded-xl px-4 py-4 bg-white/70 backdrop-blur-sm border border-white/60 hover:shadow-md"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center gap-1 text-slate-700 text-[10px] sm:text-xs uppercase tracking-[0.15em] font-semibold">
        <span className="text-lg">{icon}</span>
        {label}
      </div>

      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
        {formatNumber(animatedValue)}
      </p>
    </div>
  );
}

export default function HeroSection() {
  const [stats, setStats] = useState({ rescues: 0, adoptions: 0, located: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      const res = await fetch(`${baseUrl}/api/stats`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch stats");

      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const items = [
    { label: "Rescues", value: stats.rescues, icon: "🐾" },
    { label: "Adoptions", value: stats.adoptions, icon: "🏠" },
    { label: "Located", value: stats.located, icon: "📍" },
  ];

  // start counting only when data is ready
  const startCounting = !loading && !error;

  return (
    <section className="relative w-full min-h-[350px] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-image.png')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-10 sm:py-14 md:py-16 flex justify-center">
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/70 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12">
            {/* TEXT SIDE */}
            <div className="text-center md:text-left space-y-3 max-w-md text-balance">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                Live impact
              </p>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-400">
                Every number is a life changed.
              </h1>

              <p className="text-sm sm:text-base text-slate-300">
                Real-time stats of rescues, successful adoptions and reunions.
              </p>
            </div>

            {/* STATS SIDE */}
            <div className="w-full">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-slate-200 animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-white border rounded-full shadow-sm hover:bg-slate-50"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((item, i) => (
                    <StatCard
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      icon={item.icon}
                      delay={i * 100}
                      start={startCounting}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 text-[10px] sm:text-xs text-slate-500 text-center md:text-right">
            Updated in real-time from our rescue & adoption database.
          </p>
        </div>
      </div>
    </section>
  );
}
