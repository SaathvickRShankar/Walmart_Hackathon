// app/api/inbound/[id]/receive/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // Call the database function
    const { error } = await supabase.rpc("receive_shipment", {
      shipment_id_param: id,
    });
    if (error) throw error;
    return NextResponse.json({
      message: "Shipment received and stock updated",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
