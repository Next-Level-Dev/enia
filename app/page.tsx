export default function Page() {
  return ( 
    <main className="min-h-screen w-full overflow-x-hidden">

      <div className="flex flex-col gap-4 justify-center items-center mt-8 p-4">
        <h1 className="text-5xl sm:text-7xl lg:text-9xl font-extrabold font-[Arial] bg-gradient-to-r from-[#71B280] to-[#FFE47A] bg-clip-text text-transparent text-center">Enia</h1>
        <h2 className="text-lg sm:text-xl font-bold font-[Arial] text-[#B3B3B3] text-center">World of gods and sigils</h2>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-15 p-25 sm:p-20 md:p-25 lg:p-35">
        <button className="bg-[#23194e] hover:bg-[#3b144d] text-gray-100 font-medium px-8 py-4 sm:px-16 sm:py-8 md:px-25 md:py-13 rounded-lg transition">
          Read the documents
        </button>

        <button className="bg-[#23194e] hover:bg-[#3b144d] text-gray-100 font-semibold px-8 py-4 sm:px-16 sm:py-8 md:px-27 md:py-15 rounded-xl transform shadow-lg sm:scale-105 md:scale-120 transition">
          Start with a short guide!
        </button>

        <button className="bg-[#23194e] hover:bg-[#3b144d] text-gray-100 font-medium px-8 py-4 sm:px-16 sm:py-8 md:px-25 md:py-13 rounded-lg transition">
          Read the stories
        </button>
      </div>

      <div className="flex flex-col gap-2 justify-center items-center mt-55 sm:mt-25 md:mt-15">
        <h4 className="text-base sm:text-lg font-light font-[Arial] text-[#B3B3B3]">A writing project by Utku</h4>
      </div>

    </main>
  );
}