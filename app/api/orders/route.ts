// app/api/orders/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

async function geocodeAddress(address: string) {
  const url = `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(
    address
  )}&key=${process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("GraphHopper Geocode API Error:", await response.text());
      return null;
    }
    const data = await response.json();
    if (data.hits && data.hits.length > 0) {
      console.log(`Geocoding success for "${address}":`, data.hits[0].point);
      return data.hits[0].point; // Returns { lat, lng }
    }
    console.log(`Geocoding failed for "${address}": No hits found.`);
    return null;
  } catch (error) {
    console.error("Error calling Geocode API:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { customer_name, delivery_address, items } = await request.json();

    if (!customer_name || !delivery_address || !items || !items.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const point = await geocodeAddress(delivery_address);

    // THIS IS THE CHECK THAT PREVENTS BROKEN ORDERS
    if (!point) {
      return NextResponse.json(
        {
          error: `Could not find a location for the address: "${delivery_address}". Please use a more specific, real-world address.`,
        },
        { status: 400 }
      );
    }

    const locationString = `POINT(${point.lng} ${point.lat})`;

    const { data: orderData, error: orderError } = await supabase
      .from("customer_orders")
      .insert({
        customer_name,
        delivery_address,
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
