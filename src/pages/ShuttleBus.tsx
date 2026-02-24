/**
 * Shuttle Bus page: route info and live GPS demo for pitch.
 */
import { useState, useEffect } from "react";
import { Bus, MapPin, Clock, Radio, MapPinned } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";

// Route path points as percentage of map container (for bus positions)
const ROUTE_A_POINTS = [
  { x: 8, y: 50 },
  { x: 22, y: 38 },
  { x: 38, y: 28 },
  { x: 55, y: 38 },
  { x: 72, y: 50 },
  { x: 88, y: 50 },
];

const ROUTE_B_POINTS = [
  { x: 8, y: 50 },
  { x: 25, y: 62 },
  { x: 42, y: 72 },
  { x: 60, y: 62 },
  { x: 85, y: 50 },
];

type DemoBus = { id: string; route: "A" | "B"; positionIndex: number };

const INITIAL_BUSES: DemoBus[] = [
  { id: "Bus A1", route: "A", positionIndex: 0 },
  { id: "Bus A2", route: "A", positionIndex: 3 },
  { id: "Bus B1", route: "B", positionIndex: 2 },
];

const ShuttleBus = () => {
  const [buses, setBuses] = useState<DemoBus[]>(INITIAL_BUSES);
  const [lastUpdated, setLastUpdated] = useState(0);

  // Simulate live GPS updates: move buses along route every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prev) =>
        prev.map((bus) => {
          const points = bus.route === "A" ? ROUTE_A_POINTS : ROUTE_B_POINTS;
          return {
            ...bus,
            positionIndex: (bus.positionIndex + 1) % points.length,
          };
        })
      );
      setLastUpdated(0);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // "Last updated Xs ago" tick every second
  useEffect(() => {
    const tick = setInterval(() => setLastUpdated((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  const routes = [
    {
      name: "Route A",
      from: "Main Campus",
      to: "Downtown Station",
      frequency: "Every 30 minutes",
      hours: "7:00 AM - 5:00 PM",
      stops: ["Main Gate", "Building 8", "Library", "Sports Complex", "Downtown"],
    },
    {
      name: "Route B",
      from: "Main Campus",
      to: "Student Dormitories",
      frequency: "Every 20 minutes",
      hours: "7:00 AM - 5:00 PM",
      stops: ["Main Gate", "Academic Center", "Canteen B9", "Dorm Complex A", "Dorm Complex B"],
    },
  ];

  const getBusPosition = (bus: DemoBus) => {
    const points = bus.route === "A" ? ROUTE_A_POINTS : ROUTE_B_POINTS;
    return points[bus.positionIndex];
  };

  return (
    <>
      <main>
        <section id="shuttle" className="pb-20 pt-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Shuttle Bus Service
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Free shuttle bus service for students and staff around campus and nearby areas
              </p>
            </div>

            {/* Live GPS demo */}
            <Card className="max-w-5xl mx-auto mb-12 overflow-hidden border-2 border-primary/20 bg-card">
              <div className="bg-primary/5 px-4 py-3 border-b border-primary/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                    </span>
                    <span className="font-semibold text-foreground">LIVE</span>
                  </div>
                  <span className="text-muted-foreground text-sm hidden sm:inline">
                    Demo • Simulated GPS
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Radio className="w-4 h-4" />
                    Last updated {lastUpdated}s ago
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      Route A
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      Route B
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <MapPinned className="w-4 h-4" />
                  <span className="text-sm font-medium">Campus shuttle map</span>
                </div>
                {/* Map container: SVG routes + absolutely positioned bus icons */}
                <div className="relative w-full aspect-[16/10] min-h-[280px] rounded-lg bg-muted/40 border border-border overflow-hidden">
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {/* Route A path */}
                    <path
                      d={`M ${ROUTE_A_POINTS.map((p) => `${p.x},${p.y}`).join(" L ")}`}
                      fill="none"
                      stroke="rgb(59 130 246)"
                      strokeWidth="1.2"
                      strokeDasharray="2 1.5"
                      opacity="0.9"
                    />
                    {/* Route B path */}
                    <path
                      d={`M ${ROUTE_B_POINTS.map((p) => `${p.x},${p.y}`).join(" L ")}`}
                      fill="none"
                      stroke="rgb(245 158 11)"
                      strokeWidth="1.2"
                      strokeDasharray="2 1.5"
                      opacity="0.9"
                    />
                    {/* Stop markers Route A */}
                    {ROUTE_A_POINTS.map((p, i) => (
                      <circle
                        key={`a-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="1.8"
                        fill="rgb(59 130 246)"
                        stroke="white"
                        strokeWidth="0.8"
                      />
                    ))}
                    {/* Stop markers Route B */}
                    {ROUTE_B_POINTS.map((p, i) => (
                      <circle
                        key={`b-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="1.8"
                        fill="rgb(245 158 11)"
                        stroke="white"
                        strokeWidth="0.8"
                      />
                    ))}
                  </svg>
                  {/* Moving bus icons */}
                  {buses.map((bus) => {
                    const pos = getBusPosition(bus);
                    return (
                      <div
                        key={bus.id}
                        className="absolute transition-all duration-[1500ms] ease-in-out pointer-events-none"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 ${
                            bus.route === "A"
                              ? "bg-blue-500 border-blue-600 text-white"
                              : "bg-amber-500 border-amber-600 text-white"
                          }`}
                          title={`${bus.id} • Route ${bus.route}`}
                        >
                          <Bus className="w-5 h-5" />
                        </div>
                        <span className="absolute left-1/2 -translate-x-1/2 -bottom-5 whitespace-nowrap text-xs font-medium text-foreground/90">
                          {bus.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Buses move along routes in this demo. In production, positions would come from real GPS.
                </p>
              </div>
            </Card>

            {/* Route cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {routes.map((route) => (
                <Card
                  key={route.name}
                  className="p-8 border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant bg-card"
                >
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="text-base px-4 py-2 shadow-card">
                      {route.name}
                    </Badge>
                    <Bus className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">Route</div>
                        <div className="font-semibold text-foreground">
                          {route.from} → {route.to}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">Schedule</div>
                        <div className="font-semibold text-foreground">{route.frequency}</div>
                        <div className="text-sm text-muted-foreground">{route.hours}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-2">Stops</div>
                        <div className="flex flex-wrap gap-2">
                          {route.stops.map((stop, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full"
                            >
                              {stop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-12 max-w-3xl mx-auto">
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">
                      Live Bus Tracking Available
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Download the RSU Campus App to track shuttle buses in real-time, view
                      schedules, and receive notifications about delays or route changes.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ShuttleBus;
