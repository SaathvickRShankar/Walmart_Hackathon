// app/api/delivery-partners/[id]/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function PUT(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;
    const { name, vehicle_type, max_capacity_kg } = await request.json();
    if (!name || !max_capacity_kg) {
      return NextResponse.json(
        { error: "Name and max capacity are required" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("delivery_partners")
      .update({ name, vehicle_type, max_capacity_kg: Number(max_capacity_kg) })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ message: "Partner updated", partner: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;
    const { error } = await supabase
      .from("delivery_partners")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Partner deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
