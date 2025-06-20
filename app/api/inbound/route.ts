// app/api/inbound/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Basic validation
    if (!body.product_id || !body.warehouse_id || !body.quantity || !body.eta) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("inbound_shipments")
      .insert([body])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(
      { message: "Shipment created", shipment: data },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
