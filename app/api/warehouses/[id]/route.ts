// app/api/warehouses/[id]/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// This is the new, more direct way to define the parameters we expect
interface RequestContext {
  params: {
    id: string;
  };
}

// To handle a PUT (Update) request
export async function PUT(request: Request, context: RequestContext) {
  try {
    const { id } = context.params; // This will now work correctly
    const { name, location } = await request.json();

    if (!name || !location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    const locationString = `POINT(${location.lng} ${location.lat})`;

    const { data, error } = await supabase
      .from("warehouses")
      .update({ name, location: locationString })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Warehouse updated successfully",
      warehouse: data,
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
export async function DELETE(request: Request, context: RequestContext) {
  try {
    const { id } = context.params; // This will now work correctly

    const { error } = await supabase.from("warehouses").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Warehouse deleted successfully" });
  } catch (error: any) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}
