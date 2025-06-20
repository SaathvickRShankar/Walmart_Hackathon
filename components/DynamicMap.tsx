// components/DynamicMap.tsx
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false, // This is the key part
  loading: () => (
    <p className="h-[400px] w-full flex items-center justify-center bg-gray-200 rounded-lg">
      Loading map...
    </p>
  ),
});

export default DynamicMap;
