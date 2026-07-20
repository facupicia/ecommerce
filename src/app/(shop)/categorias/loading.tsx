import { ProductCardSkeleton } from "@/components/shop/Skeletons";

export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16" aria-busy="true" aria-label="Cargando catálogo">
      {/* Header */}
      <section className="mb-10 lg:mb-14 text-center max-w-2xl mx-auto animate-pulse">
        <div className="h-3 w-20 bg-[#ebebeb] rounded mx-auto mb-4" />
        <div className="h-10 w-56 bg-[#ebebeb] rounded mx-auto mb-4" />
        <div className="h-4 w-72 max-w-full bg-[#ebebeb] rounded mx-auto" />
      </section>

      <div className="flex gap-10 lg:gap-14">
        {/* Sidebar skeleton (desktop) */}
        <aside className="hidden lg:block w-[220px] flex-shrink-0 animate-pulse">
          <div className="h-3 w-24 bg-[#ebebeb] rounded mb-5 pb-3 border-b border-[#ebebeb]" />
          {[0, 1, 2].map((s) => (
            <div key={s} className="py-3 border-b border-[#ebebeb] space-y-3">
              <div className="h-3 w-28 bg-[#ebebeb] rounded" />
              <div className="h-2.5 w-3/4 bg-[#f0f0f0] rounded" />
              <div className="h-2.5 w-2/3 bg-[#f0f0f0] rounded" />
              <div className="h-2.5 w-1/2 bg-[#f0f0f0] rounded" />
            </div>
          ))}
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#ebebeb] animate-pulse">
            <div className="h-3 w-24 bg-[#ebebeb] rounded" />
            <div className="h-8 w-40 bg-[#ebebeb] rounded" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 lg:gap-x-8 lg:gap-y-14">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
