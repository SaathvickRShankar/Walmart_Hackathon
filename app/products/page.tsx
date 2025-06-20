// app/products/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { ProductManager } from "./ProductManager";

export const revalidate = 0;

export default async function ProductsPage() {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, vendors(name)") // Join with vendors to get the name
    .order("name");

  const { data: vendors, error: vendorsError } = await supabase
    .from("vendors")
    .select("id, name")
    .order("name");

  if (productsError || vendorsError) {
    return <p className="p-8 text-red-500">Error loading data.</p>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Products</h1>
      <ProductManager
        initialProducts={products || []}
        vendors={vendors || []}
      />
    </div>
  );
}
