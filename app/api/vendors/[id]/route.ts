// app/api/vendors/[id]/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface Params {
  id: string;
}

// To handle a PUT (Update) request
export async function PUT(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;
    const { name, contact_person, contact_email } = await request.json();

    if (!name || !contact_email) {
      return NextResponse.json(
        { error: "Name and contact email are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendors")
      .update({ name, contact_person, contact_email })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Vendor updated successfully",
      vendor: data,
    });
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

// To handle a DELETE request
export async function DELETE(request: Request, context: { params: Params }) {
  try {
    const { id } = context.params;

    const { error } = await supabase.from("vendors").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Vendor deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}
