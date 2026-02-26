/**
 * Canteen component displays information about the university's canteen services.
 * Building 6 includes an interactive floor plan with clickable food stalls and menu popups.
 */
import { useState } from "react";
import { UtensilsCrossed, MapPin, Clock, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MenuItem = { name: string; price: string };
type Stall = { id: string; name: string; menu: MenuItem[] };

const B6_STALLS: Stall[] = [
  {
    id: "stall-1",
    name: "Thai Kitchen",
    menu: [
      { name: "Pad Thai", price: "฿45" },
      { name: "Som Tam", price: "฿40" },
      { name: "Khao Pad", price: "฿45" },
      { name: "Tom Yum Soup", price: "฿50" },
    ],
  },
  {
    id: "stall-2",
    name: "Noodle Bar",
    menu: [
      { name: "Beef Noodle Soup", price: "฿55" },
      { name: "Wonton Noodles", price: "฿50" },
      { name: "Boat Noodles", price: "฿45" },
      { name: "Dry Noodles", price: "฿50" },
    ],
  },
  {
    id: "stall-3",
    name: "Rice & Curry",
    menu: [
      { name: "Green Curry Rice", price: "฿50" },
      { name: "Basil Pork Rice", price: "฿45" },
      { name: "Fried Rice", price: "฿45" },
      { name: "Omelette Rice", price: "฿50" },
    ],
  },
  {
    id: "stall-4",
    name: "Drinks & Desserts",
    menu: [
      { name: "Thai Iced Tea", price: "฿35" },
      { name: "Iced Coffee", price: "฿40" },
      { name: "Mango Sticky Rice", price: "฿55" },
      { name: "Shaved Ice", price: "฿45" },
    ],
  },
  {
    id: "stall-5",
    name: "Grill & Fry",
    menu: [
      { name: "Grilled Chicken", price: "฿55" },
      { name: "Fried Chicken", price: "฿50" },
      { name: "Spring Rolls", price: "฿40" },
      { name: "French Fries", price: "฿35" },
    ],
  },
  {
    id: "stall-6",
    name: "Vegetarian Corner",
    menu: [
      { name: "Tofu Stir Fry", price: "฿45" },
      { name: "Vegetable Curry", price: "฿45" },
      { name: "Mixed Veg Rice", price: "฿40" },
      { name: "Salad Bowl", price: "฿50" },
    ],
  },
];

const Canteen = () => {
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);
  const [menuStall, setMenuStall] = useState<Stall | null>(null);

  const canteens = [
    {
      name: "Building 6 Canteen",
      code: "B6",
      description: "Modern food court with diverse Thai and international cuisine",
      hours: "7:00 AM - 4:00 PM",
      location: "Building 6, Ground Floor",
      features: ["Thai Food", "International", "Vegetarian Options", "Air Conditioned"],
    },
    {
      name: "Building 9 Canteen",
      code: "B9",
      description: "Traditional Thai restaurant and casual dining area",
      hours: "7:00 AM - 8:00 PM",
      location: "Building 9, Ground Floor",
      features: ["Thai Cuisine", "Fast Food", "Beverages", "Outdoor Seating"],
    },
  ];

  return (
    <>
      <div>
        <section id="canteen" className="pb-16 sm:pb-20 pt-6 sm:pt-8 lg:pt-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                Canteen Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enjoy delicious meals at our modern campus dining facilities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {canteens.map((canteen) => (
                <Card
                  key={canteen.code}
                  className="p-6 sm:p-8 border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant bg-card"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="inline-block px-3 py-1 bg-primary/10 rounded-lg mb-3">
                        <span className="text-lg font-bold text-primary">
                          {canteen.code}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {canteen.name}
                      </h3>
                      <p className="text-muted-foreground">{canteen.description}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-foreground">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{canteen.hours}</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{canteen.location}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {canteen.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {canteen.code === "B6" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setFloorPlanOpen(true)}
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      View floor plan
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">
                      View Menu
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Building 6 interactive floor plan dialog */}
      <Dialog open={floorPlanOpen} onOpenChange={setFloorPlanOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" />
              Building 6 Canteen – Floor plan
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Click a stall to see its menu.
          </p>

          <div className="border-2 border-border rounded-lg bg-muted/30 p-3 sm:p-4 font-mono text-sm">
            {/* Floor plan grid with HTML structure */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Entrance */}
              <div className="col-span-2 sm:col-span-3 flex justify-center">
                <div className="px-4 py-2 bg-primary/10 rounded-t-lg border border-primary/30 text-center font-medium text-primary">
                  Entrance
                </div>
              </div>
              {/* Stalls row 1 */}
              {B6_STALLS.slice(0, 3).map((stall) => (
                <button
                  key={stall.id}
                  type="button"
                  onClick={() => setMenuStall(stall)}
                  className="flex flex-col items-center justify-center min-h-[100px] p-3 rounded-lg border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <UtensilsCrossed className="w-6 h-6 text-primary mb-1" />
                  <span className="font-semibold text-sm text-center">{stall.name}</span>
                </button>
              ))}
              {/* Stalls row 2 */}
              {B6_STALLS.slice(3, 6).map((stall) => (
                <button
                  key={stall.id}
                  type="button"
                  onClick={() => setMenuStall(stall)}
                  className="flex flex-col items-center justify-center min-h-[100px] p-3 rounded-lg border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <UtensilsCrossed className="w-6 h-6 text-primary mb-1" />
                  <span className="font-semibold text-sm text-center">{stall.name}</span>
                </button>
              ))}
              {/* Seating area */}
              <div className="col-span-2 sm:col-span-3 flex justify-center py-4">
                <div className="w-full py-3 px-4 rounded-b-lg border border-dashed border-border bg-muted/50 text-center text-muted-foreground text-sm">
                  Seating area
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu popup when a stall is clicked */}
      <Dialog open={!!menuStall} onOpenChange={(open) => !open && setMenuStall(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{menuStall?.name}</DialogTitle>
          </DialogHeader>
          {menuStall && (
            <ul className="space-y-2 mt-2">
              {menuStall.menu.map((item) => (
                <li
                  key={item.name}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <span className="text-foreground">{item.name}</span>
                  <span className="font-medium text-primary">{item.price}</span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Canteen;
