// app/orders/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { OrderForm } from "./OrderForm";

export const revalidate = 0;

export default async function CreateOrderPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, sku");
  if (error)
    return <p className="p-8 text-red-500">Could not load products.</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Customer Order</h1>
      <OrderForm products={products || []} />
    </div>
  );
}
