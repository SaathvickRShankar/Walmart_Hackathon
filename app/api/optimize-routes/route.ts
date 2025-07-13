// app/api/optimize-routes/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// --- (Type definitions and parseGeoJsonPoint function remain unchanged) ---
type GeoJsonPoint = { type: "Point"; coordinates: [number, number] };
type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
};
type PendingOrderFromDB = {
  id: string;
  customer_name: string;
  delivery_address: string;
  status: string;
  created_at: string;
  delivery_location: GeoJsonPoint;
  order_items: OrderItem[];
};
function parseGeoJsonPoint(
  geoJson: GeoJsonPoint | null
): { lat: number; lng: number } | null {
  if (!geoJson || !geoJson.coordinates) return null;
  return { lat: geoJson.coordinates[1], lng: geoJson.coordinates[0] };
}

// --- NEW HELPER FUNCTION TO SIMULATE TRAFFIC ---
// This function takes the route points and randomly picks a few segments to mark as "congested".
function simulateTraffic(points: any[]) {
  if (!points || points.length === 0) return null;
  const trafficSegments = [];
  const coordinates = points.flatMap((segment: any) => segment.coordinates);

  // Pick 2 random spots to simulate traffic jams
  for (let i = 0; i < 2; i++) {
    if (coordinates.length < 10) continue; // Not enough points for a segment
    const startIndex = Math.floor(Math.random() * (coordinates.length - 5));
    const segment = coordinates.slice(startIndex, startIndex + 5);
    trafficSegments.push(segment);
  }
  return trafficSegments.length > 0 ? trafficSegments : null;
}

export async function POST(request: Request) {
  try {
    // --- (All fetching and validation logic is correct and remains unchanged) ---
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
        { error: `Warehouse not found.` },
        { status: 404 }
      );
    const warehouseLocation = parseGeoJsonPoint(warehouseData.location);
    if (!warehouseLocation)
      return NextResponse.json(
        { error: `Warehouse location invalid.` },
        { status: 500 }
      );
    const { data: pendingOrdersData, error: ordersError } = await supabase.rpc(
      "get_pending_orders_with_location"
    );
    if (ordersError) throw ordersError;
    const pendingOrders: PendingOrderFromDB[] = pendingOrdersData || [];
    if (pendingOrders.length === 0)
      return NextResponse.json({ message: "No pending orders found." });
    const [partnersRes, stockRes, productsRes] = await Promise.all([
      supabase.from("delivery_partners").select("*"),
      supabase
        .from("warehouse_stock")
        .select("product_id, quantity")
        .eq("warehouse_id", warehouseId),
      supabase.from("products").select("id, weight_kg"),
    ]);
    const stock = stockRes.data || [];
    const stockMap = new Map(stock.map((s) => [s.product_id, s.quantity]));
    const partners = partnersRes.data || [];
    const products = productsRes.data || [];
    const productWeightMap = new Map(products.map((p) => [p.id, p.weight_kg]));
    const validOrders = pendingOrders
      .map((order) => {
        const items = order.order_items || [];
        const isStockAvailable = items.every(
          (item: OrderItem) =>
            (stockMap.get(item.product_id) || 0) >= item.quantity
        );
        const location = parseGeoJsonPoint(order.delivery_location);
        if (isStockAvailable && location) {
          const weight = items.reduce(
            (sum: number, item: OrderItem) =>
              sum +
              (productWeightMap.get(item.product_id) || 0) * item.quantity,
            0
          );
          return { ...order, location, weight, order_items: items };
        }
        return null;
      })
      .filter(Boolean);
    if (validOrders.length === 0)
      return NextResponse.json({
        message: "No fulfillable orders found (check stock).",
      });
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
      const ghRequest = {
        vehicles: [
          {
            vehicle_id: vehicleLoad.partner.id,
            type_id: `${vehicleLoad.partner.vehicle_type || "truck"}_type`,
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
            return_to_depot: true,
          },
        ],
        vehicle_types: [
          {
            type_id: `${vehicleLoad.partner.vehicle_type || "truck"}_type`,
            profile: "car",
            capacity: [Math.floor(vehicleLoad.partner.max_capacity_kg)],
          },
        ],
        services: vehicleLoad.orders.map((o: any) => ({
          id: o.id,
          address: {
            location_id: o.id,
            lon: o.location.lng,
            lat: o.location.lat,
          },
          size: [Math.floor(o.weight)],
        })),
        configuration: { routing: { calc_points: true } },
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

        // --- SIMULATE AND SAVE TRAFFIC ---
        const trafficData = simulateTraffic(route.points);

        const { data: routeData } = await supabase
          .from("delivery_routes")
          .insert({
            delivery_partner_id: vehicleLoad.partner.id,
            warehouse_id: warehouseId,
            route_geometry: route.points,
            total_duration_seconds: route.completion_time,
            total_distance_meters: route.distance,
            traffic_segments: trafficData, // Save the simulated data
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
        { error: "Could not generate a route solution from GraphHopper." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Overall Optimization Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
