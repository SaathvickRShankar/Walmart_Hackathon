// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-100">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Walmart Logistics Optimizer
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Welcome to the central hub for managing your logistics pipeline.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card for Vendors */}
          <Link
            href="/vendors"
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-all"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-blue-600">
              Manage Vendors
            </h5>
            <p className="font-normal text-gray-700">
              Add, view, and manage your product suppliers.
            </p>
          </Link>
          {/* Card for Delivery Partners */}
          <Link
            href="/delivery-partners"
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-all"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-blue-600">
              Manage Partners
            </h5>
            <p className="font-normal text-gray-700">
              Configure your fleet of delivery partners and their vehicle
              capacities.
            </p>
          </Link>
          // In app/page.tsx, add this inside the grid div
          {/* Card for Warehouses */}
          <Link
            href="/warehouses"
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-all"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-blue-600">
              Manage Warehouses
            </h5>
            <p className="font-normal text-gray-700">
              Set up warehouse locations using an interactive map.
            </p>
          </Link>
          {/* Card for Products */}
          <Link
            href="/products"
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-all"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-blue-600">
              Manage Products
            </h5>
            <p className="font-normal text-gray-700">
              Define SKUs, weights, and vendors for all items.
            </p>
          </Link>
          {/* Card for Inbound Shipments */}
          <Link
            href="/inbound"
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-all"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-blue-600">
              Inbound Shipments
            </h5>
            <p className="font-normal text-gray-700">
              Track incoming inventory and update warehouse stock.
            </p>
          </Link>
          {/* Card for Outbound Logistics */}
          <Link
            href="/outbound"
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-all col-span-1 md:col-span-2 lg:col-span-3"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-green-600">
              Outbound Logistics & Route Optimization
            </h5>
            <p className="font-normal text-gray-700">
              View pending orders, plan optimal delivery routes, and track
              outbound shipments.
            </p>
          </Link>
          {/* Card for Route Tracking */}
          <Link
            href="/routes"
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-all"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-purple-600">
              Track Routes
            </h5>
            <p className="font-normal text-gray-700">
              View and monitor all planned and active delivery routes on the
              map.
            </p>
          </Link>
          {/* We will add more cards here later */}
        </div>
      </div>
    </main>
  );
}
