import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Shirt, Watch, Smartphone, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { getProductsServer } from "@/services/product/getProductsServer";
import { getCategoriesServer } from "@/services/category/getCategoriesServer";

const categoryIcons: Record<string, React.ElementType> = {
  Clothing: Shirt,
  Accessories: Watch,
  Electronics: Smartphone,
};

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProductsServer(),
    getCategoriesServer(),
  ]);

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="from-primary/15 via-primary/5 relative overflow-hidden bg-gradient-to-br to-transparent">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
            Everything you need,{" "}
            <span className="text-primary">delivered with care</span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg">
            Discover quality electronics, clothing, and accessories curated
            for your everyday life.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/shop">
              <Button size="lg" className="cursor-pointer">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3">
          <div className="flex items-center justify-center gap-3">
            <Truck className="text-primary h-6 w-6" />
            <span className="text-sm font-medium">Free Shipping</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck className="text-primary h-6 w-6" />
            <span className="text-sm font-medium">Secure Checkout</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <RotateCcw className="text-primary h-6 w-6" />
            <span className="text-sm font-medium">30-Day Returns</span>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Smartphone;
              return (
                <Link
                  key={category.id}
                  href={`/${category.name.toLowerCase()}`}
                  className="group border-border/60 bg-card/60 hover:border-primary/30 hover:shadow-primary/5 flex items-center gap-4 rounded-xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="group-hover:text-primary font-semibold transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground line-clamp-1 text-sm">
                      {category.description || "Explore the collection"}
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Featured Products
            </h2>
            <Link href="/shop">
              <Button variant="ghost" className="cursor-pointer">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="bg-primary/5 border-t">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to start shopping?
          </h2>
          <p className="text-muted-foreground max-w-md">
            Browse our full catalog and find something you&apos;ll love.
          </p>
          <Link href="/shop">
            <Button size="lg" className="cursor-pointer">
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
