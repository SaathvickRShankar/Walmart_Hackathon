// app/api/orders/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// The geocodeAddress function is NO LONGER NEEDED. We can delete it.

export async function POST(request: Request) {
  try {
    // We now expect `delivery_location` with lat/lng, and `delivery_address` is just optional text
    const { customer_name, delivery_address, delivery_location, items } =
      await request.json();

    if (!customer_name || !delivery_location || !items || !items.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // --- NO MORE GEOCoding API CALL ---
    // We get the point directly from the request body.
    const point = delivery_location;

    // Validate that the point has lat and lng
    if (!point.lat || !point.lng) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude provided." },
        { status: 400 }
      );
    }

    const locationString = `POINT(${point.lng} ${point.lat})`;

    const { data: orderData, error: orderError } = await supabase
      .from("customer_orders")
      .insert({
        customer_name,
        // We save the optional text address and the required location
        delivery_address: delivery_address || "N/A",
        delivery_location: locationString,
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    const order_id = orderData.id;
    const orderItems = items.map((item: any) => ({ ...item, order_id }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      await supabase.from("customer_orders").delete().eq("id", order_id);
      throw itemsError;
    }

    return NextResponse.json(
      { message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create order. " + error.message },
      { status: 500 }
    );
  }
}
