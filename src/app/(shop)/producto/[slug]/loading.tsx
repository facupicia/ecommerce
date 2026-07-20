export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 lg:py-12" aria-busy="true" aria-label="Cargando producto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 lg:mb-12 animate-pulse">
        <div className="h-2.5 w-12 bg-[#ebebeb] rounded" />
        <div className="h-2.5 w-2 bg-[#ebebeb] rounded" />
        <div className="h-2.5 w-20 bg-[#ebebeb] rounded" />
        <div className="h-2.5 w-2 bg-[#ebebeb] rounded" />
        <div className="h-2.5 w-32 bg-[#ebebeb] rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 animate-pulse">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] bg-[#ebebeb] rounded-[24px]" />
          <div className="mt-4 flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-24 bg-[#f0f0f0] rounded-lg" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col lg:pt-2">
          <div className="h-3 w-24 bg-[#ebebeb] rounded mb-3" />
          <div className="h-8 w-3/4 bg-[#ebebeb] rounded mb-2" />
          <div className="h-8 w-1/2 bg-[#ebebeb] rounded mb-6" />
          <div className="h-6 w-40 bg-[#ebebeb] rounded mb-8 pb-8 border-b border-[#ebebeb]" />
          <div className="space-y-4 mb-8">
            <div className="h-3 w-32 bg-[#ebebeb] rounded" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-11 bg-[#f0f0f0] rounded" />
              ))}
            </div>
          </div>
          <div className="h-12 w-full bg-[#ebebeb] rounded mb-8" />
          <div className="h-32 w-full bg-[#f0f0f0] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
