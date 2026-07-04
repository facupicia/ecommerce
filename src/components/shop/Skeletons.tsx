export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-[#ebebeb] rounded-sm mb-3" />
      <div className="space-y-2 px-0.5">
        <div className="h-2.5 bg-[#ebebeb] rounded w-1/2" />
        <div className="h-3.5 bg-[#ebebeb] rounded w-3/4" />
        <div className="h-3 bg-[#ebebeb] rounded w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="h-8 bg-[#ebebeb] rounded w-48 mb-10 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
