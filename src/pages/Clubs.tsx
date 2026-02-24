import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
/**
 * Clubs component displays a list of student clubs and organizations available at the university.
 * It provides details about each club, including its name, category, number of members, and a brief description.
 */

// Import UI components from the local components library
import { Card } from "@/components/ui/card";     // Card component for displaying individual club details
import Footer from "@/components/Footer";       // Footer component

type Club = {
  id: number;
  name: string;
  image_url: string;
  description: string;
};

// Define the Clubs functional component
const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      const { data, error } = await supabase.from('clubs').select('*');
      if (error) {
        console.error('Error fetching clubs:', error);
      } else {
        setClubs(data as Club[]);
      }
    };

    fetchClubs();
  }, []);

  // The component's render method
  return (
    <> {/* React Fragment to return multiple elements */}
      <main className="pt-20 lg:pt-0">
        {/* Main section for the student clubs content */}
        <section id="clubs" className="pb-20 lg:pt-20 bg-background">
          {/* Container for responsive layout */}
          <div className="container mx-auto px-4">
            {/* Section for the main title and description */}
            <div className="text-center mb-16">
              {/* Main heading for the student clubs page */}
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Student Clubs & Organizations
              </h2>
              {/* Description text */}
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join a vibrant community and explore your passions beyond the classroom
              </p>
            </div>

            {/* Grid layout for displaying club cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Maps through the 'clubs' array to render a Card for each club */}
              {clubs.map((club) => {
                // Dynamically assign the icon component based on the club's icon property
                return (
                  // Card component for an individual club
                  <Card
                    key={club.id}
                    className="p-6 border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant bg-card group cursor-pointer"
                  >
                  <img src={club.image_url} alt={club.name} className="w-full h-48 object-cover mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {club.description}
                  </p>

                    {/* Button to learn more about the club */}
                    <Button variant="ghost" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      {/* Renders the footer */}
      <Footer />
    </>
  );
};

// Exports the Clubs component for use in other parts of the application
export default Clubs;
