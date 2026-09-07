import ProductCard from "@/components/ProductCard";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { listProducts } from "@/lib/products";

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const search = sp?.search || "";
  const products = listProducts({ search });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-[var(--color-primary)] sm:text-3xl">
            {search ? `Search results for "${search}"` : "Our Collection"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{products.length} products</p>
        </div>
        <WhatsAppShareButton
          path="/"
          message="Take a look at this beautiful jewellery collection!"
          label="Share Catalog"
        />
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-neutral-400">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
