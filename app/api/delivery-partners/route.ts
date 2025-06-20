// app/api/delivery-partners/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, vehicle_type, max_capacity_kg } = await request.json();
    if (!name || !max_capacity_kg) {
      return NextResponse.json(
        { error: "Name and max capacity are required" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("delivery_partners")
      .insert([
        { name, vehicle_type, max_capacity_kg: Number(max_capacity_kg) },
      ])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(
      { message: "Partner created", partner: data },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
