This project is a full-stack web application built for the Walmart hackathon. It provides a comprehensive dashboard for managing a logistics network, from vendor and warehouse management to intelligent, last-mile delivery route optimization.
Core Features
Vendor & Partner Management: Full CRUD (Create, Read, Update, Delete) functionality for managing vendors and delivery partners.
Warehouse & Inventory System: Create warehouses with precise geographical locations and track real-time product inventory levels.
Inbound & Outbound Pipelines: Log inbound shipments to update stock and create outbound customer orders.
Intelligent Route Optimization: A core feature that calculates the most efficient delivery routes based on vehicle capacity, warehouse stock, and real-world road networks.
Route Visualization & Tracking: An interactive map interface to visualize the planned optimal routes, including stops and simulated real-time traffic data.
How the Route Optimization Works: An End-to-End Flow
The heart of this application is the route optimization pipeline. It's a multi-stage process that turns a list of pending customer orders into an actionable, optimized delivery plan. Here's how it works:

1. Data Input: Setting the Stage
   For the optimization to work, two key geographical points are required: the start point (the warehouse) and the end points (the customer delivery locations).
   Warehouse Location (app/warehouses/WarehouseManager.tsx):
   When an administrator creates a new warehouse, they don't just give it a name. They use an interactive Leaflet map to click and select the precise latitude and longitude of the warehouse. This coordinate is then saved directly to our Supabase database using its powerful PostGIS extension. This ensures we have a perfect, unambiguous starting and ending point for all our routes.
   Customer Order Location (app/orders/OrderForm.tsx):
   Similarly, when creating a customer order, instead of relying on a potentially ambiguous text address, the user directly inputs the customer's precise latitude and longitude. This removes any dependency on external geocoding services during the demo and guarantees that every order has a valid, plottable delivery location. This data is also saved as a geography type in the database.
2. The Trigger: "Plan Optimal Routes"
   The process begins on the Outbound Logistics page (app/outbound/page.tsx).
   A logistics manager views a list of all Pending customer orders.
   They select a dispatch warehouse from a dropdown list.
   They click the "Plan Optimal Routes" button. This action triggers a POST request to our core backend API endpoint.
3. The Backend Engine: The optimize-routes API
   This is where the magic happens. The API endpoint located at app/api/optimize-routes/route.ts executes a sophisticated sequence of steps:
   Data Aggregation: The API first fetches all necessary data in parallel for maximum efficiency. This includes:
   The details of the selected warehouse (including its coordinates).
   All pending orders and the specific items within each order.
   The current stock levels for every product in that specific warehouse.
   The list of all available delivery partners and their vehicle specifications (e.g., max weight capacity).
   The weight of every product in our system.
   Order Validation: The API iterates through every pending order and checks two critical conditions:
   Stock Availability: "Do we have enough of every single item in this order in our selected warehouse right now?"
   Location Validity: "Does this order have a valid latitude and longitude?"
   Only orders that pass both checks are considered "Fulfillable".
   Vehicle Packing (The Knapsack Problem): The API then performs a "greedy" packing algorithm. It takes the list of fulfillable orders and tries to pack them into the available delivery partner vehicles one by one, ensuring that the total weight of the orders assigned to a vehicle never exceeds its max_capacity_kg.
   Calling the GraphHopper API: For each "packed" vehicle with a set of assigned orders, our backend constructs a request to the GraphHopper VRP (Vehicle Routing Problem) API. This request includes:
   The vehicle's starting and ending address (the warehouse coordinates).
   A list of all customer delivery coordinates for that vehicle's assigned orders.
   A configuration flag (calc_points: true) explicitly asking the API to calculate and return the geometry for the route path.
   Processing the Solution: The GraphHopper API solves the complex "Traveling Salesperson Problem" for that set of stops and returns an optimized solution, including:
   The most efficient order to visit the stops.
   The total travel time and distance.
   A points object containing the encoded polyline for the entire road-network path (the blue line).
   Simulating Traffic & Saving the Route:
   Our API takes the returned route path and runs a simulation function to mimic real-time traffic. It randomly selects a few segments of the route and marks them as "congested".
   It then saves all of this information—the partner ID, warehouse ID, total time, total distance, the full route geometry, and our simulated traffic data—as a new entry in our delivery_routes table.
   Finally, it updates the status of the processed orders from Pending to Out for Delivery and decrements the stock levels in the warehouse_stock table.
4. The Frontend Visualization: Displaying the Route
   Once a route is planned, it can be viewed on the Route Tracking pages.
   The list of all routes is displayed on app/routes/page.tsx.
   Clicking a route navigates to the dynamic page app/routes/[id]/page.tsx.
   This page uses a client-side component, app/routes/[id]/RouteMap.tsx, to render the map.
   Data Fetching: The page fetches all the details for the specific route ID from our database, including the saved route_geometry and traffic_segments.
   Rendering the Map:
   It uses Leaflet and React-Leaflet to display an OpenStreetMap background.
   It plots markers for the warehouse and each customer stop.
   The Blue Line: It takes the main route_geometry data, plots it as a blue <Polyline> on the map, and automatically zooms the map to fit the entire route.
   The Red Segments: It then takes our simulated traffic_segments data and draws thicker, red <Polyline> components on top of the blue line, giving a clear visual indication of "congested" areas.
