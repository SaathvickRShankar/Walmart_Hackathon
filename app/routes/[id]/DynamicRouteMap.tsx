// app/routes/[id]/DynamicRouteMap.tsx
"use client"; // <-- THIS IS THE FIX.

import dynamic from "next/dynamic";

const DynamicRouteMap = dynamic(
  () => import("./RouteMap").then((mod) => mod.RouteMap),
  {
    ssr: false,
    loading: () => (
      <p className="h-[600px] w-full flex items-center justify-center bg-gray-200 rounded-lg">
        Loading map...
      </p>
    ),
  }
);

export default DynamicRouteMap;
