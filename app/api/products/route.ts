// app/api/products/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from("products")
      .insert([body])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(
      { message: "Product created", product: data },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
