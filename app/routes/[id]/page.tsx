// app/routes/[id]/page.tsx
"use client"; // <-- This file is now a Client Component

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { RouteDetailsClient } from "./RouteDetailsClient"; // We will still use this for clean separation

export default function RoutePage() {
  const params = useParams(); // Client-side hook to get URL params
  const routeId = params.id as string;

  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId) return;

    async function fetchRoute() {
      setLoading(true);
      const { data, error } = await supabase
        .rpc("get_route_details", { route_id_param: routeId })
        .single();

      if (error) {
        console.error("Error fetching route details:", error);
        setError("Failed to load route data.");
      } else {
        setRoute(data);
      }
      setLoading(false);
    }

    fetchRoute();
  }, [routeId]);

  if (loading) {
    return <div className="p-8 text-center">Loading route details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // Pass the fetched data to the presentation component
  return <RouteDetailsClient route={route} />;
}
