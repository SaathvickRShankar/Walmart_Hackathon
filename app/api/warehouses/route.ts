// app/api/warehouses/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // LOG 1: This is the most important log. What did the API receive?
    console.log("--- API RECEIVED BODY ---", body);

    const { name, location } = body;

    if (!name || !location || !location.lat || !location.lng) {
      // LOG 2: If we get here, the data was missing or invalid.
      console.error(
        "Validation failed: Name or location is missing/invalid in the received body."
      );
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    // Format for PostGIS: POINT(lng lat)
    const locationString = `POINT(${location.lng} ${location.lat})`;
    // LOG 3: Is the string we're trying to save correct?
    console.log("--- CONSTRUCTED LOCATION STRING ---", locationString);

    const { data, error } = await supabase
      .from("warehouses")
      .insert([{ name, location: locationString }])
      .select()
      .single();

    if (error) {
      // LOG 4: Did Supabase return an error during the insert?
      console.error("--- SUPABASE INSERT ERROR ---", error);
      throw error;
    }

    // LOG 5: If everything worked, what did Supabase return?
    console.log("--- SUPABASE INSERT SUCCESS ---", data);
    return NextResponse.json(
      { message: "Warehouse created", warehouse: data },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
