// app/api/vendors/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// To handle a POST request to /api/vendors
export async function POST(request: Request) {
  try {
    const { name, contact_person, contact_email } = await request.json();

    // Basic validation
    if (!name || !contact_email) {
      return NextResponse.json(
        { error: "Name and contact email are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendors")
      .insert([{ name, contact_person, contact_email }])
      .select() // .select() returns the newly created record
      .single(); // .single() ensures we get an object, not an array

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Vendor created successfully",
        vendor: data,
      },
      { status: 201 }
    ); // 201 means "Created"
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
