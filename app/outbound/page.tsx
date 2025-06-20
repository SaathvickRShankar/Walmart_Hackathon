// app/outbound/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { OutboundManager } from "./OutboundManager";
import Link from "next/link";

export const revalidate = 0;

export default async function OutboundPage() {
  const [ordersRes, warehousesRes] = await Promise.all([
    supabase
      .from("customer_orders")
      .select("*, order_items(*)")
      .eq("status", "Pending"),
    supabase.from("warehouses").select("*"),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Outbound Logistics</h1>
        <Link
          href="/orders"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Create New Order
        </Link>
      </div>
      <OutboundManager
        pendingOrders={ordersRes.data || []}
        warehouses={warehousesRes.data || []}
      />
    </div>
  );
}
