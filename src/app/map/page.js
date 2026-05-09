"use client";
import { useCallback, useState } from "react";
import { MapPinned } from "lucide-react";
import FullMap from "../components/FullMap";
import FormModal from "../components/FormModal";
import FullPageLoader from "../components/FullPageLoader";
import FlashMessage from "../components/FlashMessage";
import SectionHeading from "../components/SectionHeading";

export default function StrayMap() {
  const [formType, setFormType] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [flashMessage, setFlashMessage] = useState("");

  const [mapLoading, setMapLoading] = useState(true);
  const pageLoading = mapLoading;

  const openForm = (type) => setFormType(type);
  const closeForm = () => setFormType(null);
  const clearFlash = useCallback(() => setFlashMessage(""), []);
  const filterOptions = [
    { label: "All", value: "" },
    { label: "Rescue Homes", value: "rescue_home" },
    { label: "Vet Centers", value: "vet_center" },
    { label: "Stray Animals", value: "stray_animal" },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Full page loader */}
      {pageLoading && <FullPageLoader />}

      {/* HERO */}
      <section className="relative w-full min-h-[400px] overflow-hidden flex items-center">
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
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <MapPinned className="w-16 h-16 sm:w-20 sm:h-20 text-slate-900" />

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  Live map tools
                </p>

                <h2 className="mt-3 text-xl md:text-2xl font-semibold text-emerald-400">
                  Find Help - Save Lives
                </h2>

                <p className="text-slate-300 text-sm mt-2 max-w-xl">
                  Discover nearby rescue homes, veterinary centers and report
                  stray animals.
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
                  <button
                    onClick={() => openForm("RescueHome")}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition"
                  >
                    + Rescue Home
                  </button>
                  <button
                    onClick={() => openForm("VetCenter")}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-medium transition"
                  >
                    + Vet Center
                  </button>
                  <button
                    onClick={() => openForm("StrayAnimal")}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition"
                  >
                    + Stray Animal
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[10px] sm:text-xs text-slate-500 text-center md:text-right">
              Updated as reports and locations are added.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-stone-200 via-stone-100 to-amber-200 px-6 pt-8 pb-5">
        <SectionHeading
          eyebrow="Map filters"
          title="Explore Map Markers"
          description="Filter the map by rescue homes, veterinary centers, and stray animal reports."
          align="center"
          className="mb-5"
        />

        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3">
          {filterOptions.map((option) => {
            const active = selectedType === option.value;

            return (
              <button
                key={option.value || "all"}
                type="button"
                onClick={() => setSelectedType(option.value)}
                className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white/80 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Map */}
      <section className="relative bg-gradient-to-br from-stone-200 via-stone-100 to-amber-200">
        {/* let the map tell us when it’s done loading */}
        <FullMap
          selectedType={selectedType}
          onLoaded={() => setMapLoading(false)}
        />
      </section>

      <FlashMessage message={flashMessage} onDismiss={clearFlash} />

      {formType && (
        <FormModal
          type={formType}
          onClose={closeForm}
          onSaved={setFlashMessage}
        />
      )}
    </div>
  );
}
