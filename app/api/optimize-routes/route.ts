// app/api/optimize-routes/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

type GeoJsonPoint = { type: "Point"; coordinates: [number, number] };

function parseGeoJsonPoint(
  geoJson: GeoJsonPoint | null
): { lat: number; lng: number } | null {
  if (!geoJson || !geoJson.coordinates) return null;
  return { lat: geoJson.coordinates[1], lng: geoJson.coordinates[0] };
}

export async function POST(request: Request) {
  try {
    const { warehouseId } = await request.json();
    if (!warehouseId)
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 }
      );

    const { data: warehouseData } = await supabase
      .rpc("get_warehouse_by_id", { w_id: warehouseId })
      .single();
    if (!warehouseData)
      return NextResponse.json(
        { error: `Warehouse with ID ${warehouseId} not found.` },
        { status: 404 }
      );
    const warehouseLocation = parseGeoJsonPoint(warehouseData.location);
    if (!warehouseLocation)
      return NextResponse.json(
        {
          error: `Could not parse location for warehouse '${warehouseData.name}'.`,
        },
        { status: 500 }
      );

    const { data: pendingOrders, error: ordersError } = await supabase.rpc(
      "get_pending_orders_with_location"
    );
    if (ordersError) throw ordersError;

    const [partnersRes, stockRes, productsRes] = await Promise.all([
      supabase.from("delivery_partners").select("*"),
      supabase
        .from("warehouse_stock")
        .select("product_id, quantity")
        .eq("warehouse_id", warehouseId),
      supabase.from("products").select("id, weight_kg"),
    ]);

    const partners = partnersRes.data || [];
    const stock = stockRes.data || [];
    const products = productsRes.data || [];

    const stockMap = new Map(stock.map((s) => [s.product_id, s.quantity]));
    const productWeightMap = new Map(products.map((p) => [p.id, p.weight_kg]));

    const validOrders = (pendingOrders || [])
      .map((order) => {
        const isStockAvailable = order.order_items.every(
          (item: any) => (stockMap.get(item.product_id) || 0) >= item.quantity
        );
        const location = parseGeoJsonPoint(order.delivery_location);
        if (isStockAvailable && location) {
          const weight = order.order_items.reduce(
            (sum: number, item: any) =>
              sum +
              (productWeightMap.get(item.product_id) || 0) * item.quantity,
            0
          );
          return { ...order, location, weight };
        }
        return null;
      })
      .filter(Boolean);

    if (validOrders.length === 0)
      return NextResponse.json({ message: "No fulfillable orders found." });

    const vehicleLoads: { partner: any; orders: any[]; totalWeight: number }[] =
      partners.map((p) => ({ partner: p, orders: [], totalWeight: 0 }));
    for (const order of validOrders) {
      const vehicle = vehicleLoads.find(
        (v) => v.partner.max_capacity_kg - v.totalWeight >= order.weight
      );
      if (vehicle) {
        vehicle.orders.push(order);
        vehicle.totalWeight += order.weight;
      }
    }

    let routesCreated = 0;
    for (const vehicleLoad of vehicleLoads) {
      if (vehicleLoad.orders.length === 0) continue;

      // --- FINAL, FINAL, CORRECTED GraphHopper Request Schema ---
      const ghRequest = {
        // The `locations` property is REMOVED from here.
        vehicle_types: [
          {
            type_id: `${vehicleLoad.partner.vehicle_type || "truck"}_type`,
            profile: "car",
            capacity: [Math.floor(vehicleLoad.partner.max_capacity_kg)],
          },
        ],
        vehicles: [
          {
            vehicle_id: vehicleLoad.partner.id,
            type_id: `${vehicleLoad.partner.vehicle_type || "truck"}_type`,
            // Coordinates are now defined directly inside the address objects
            start_address: {
              location_id: "warehouse",
              lon: warehouseLocation.lng,
              lat: warehouseLocation.lat,
            },
            end_address: {
              location_id: "warehouse",
              lon: warehouseLocation.lng,
              lat: warehouseLocation.lat,
            },
          },
        ],
        services: vehicleLoad.orders.map((o: any) => ({
          id: o.id,
          // Coordinates are now defined directly inside the address objects
          address: {
            location_id: o.id,
            lon: o.location.lng,
            lat: o.location.lat,
          },
          duration: 300,
          size: [Math.floor(o.weight)],
        })),
      };

      const ghResponse = await fetch(
        `https://graphhopper.com/api/1/vrp?key=${process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ghRequest),
        }
      );
      const solution = await ghResponse.json();

      if (solution.solution) {
        routesCreated++;
        const route = solution.solution.routes[0];
        const { data: routeData } = await supabase
          .from("delivery_routes")
          .insert({
            delivery_partner_id: vehicleLoad.partner.id,
            warehouse_id: warehouseId,
            route_geometry: route.geometry,
            total_duration_seconds: route.completion_time,
            total_distance_meters: route.distance,
          })
          .select()
          .single();
        if (!routeData) continue;
        const routeId = routeData.id;
        const stops = route.activities
          .filter((act: any) => act.type === "service")
          .map((act: any, index: number) => ({
            route_id: routeId,
            order_id: act.id,
            stop_number: index + 1,
          }));
        await supabase.from("route_stops").insert(stops);
        const orderIdsToUpdate = vehicleLoad.orders.map((o: any) => o.id);
        await supabase
          .from("customer_orders")
          .update({ status: "Out for Delivery" })
          .in("id", orderIdsToUpdate);
        for (const order of vehicleLoad.orders) {
          for (const item of order.order_items) {
            await supabase.rpc("decrement_stock", {
              p_id: item.product_id,
              w_id: warehouseId,
              amount: item.quantity,
            });
          }
        }
      } else {
        console.error("GraphHopper Error:", solution);
      }
    }

    if (routesCreated > 0) {
      return NextResponse.json({
        message: `Optimization complete! ${routesCreated} routes were planned.`,
      });
    } else {
      return NextResponse.json(
        {
          error:
            "Could not generate a route solution. Check GraphHopper error logs in terminal.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Overall Optimization Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
