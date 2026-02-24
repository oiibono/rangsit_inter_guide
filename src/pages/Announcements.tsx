import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
/**
 * Announcements component displays a list of university announcements.
 * It categorizes announcements, highlights urgent ones, and provides details like date and description.
 */
import { Card } from "@/components/ui/card";     // Card component for displaying individual announcements
import { Button } from "@/components/ui/button"; // Button component for actions like 'View All Announcements'
import Footer from "@/components/Footer";       // Footer component

// Define the Announcements functional component
const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase.from('announcements').select('*');
      if (error) {
        console.error('Error fetching announcements:', error);
      } else {
        setAnnouncements(data);
      }
    };

    fetchAnnouncements();
  }, []);

  // The component's render method
  return (
    <> {/* React Fragment to return multiple elements (Navigation is rendered once by Layout) */}
      <main className="pt-20 lg:pt-0 lg:mr-[80px]">
        {/* Main section for the announcements content */}
        <section id="announcements" className="pb-20 lg:pt-20 bg-muted/30">
          {/* Container for responsive layout */}
          <div className="container mx-auto px-4">
            {/* Section for the main title and description */}
            <div className="text-center mb-16">
              {/* Main heading for the announcements page */}
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Announcements
              </h2>
              {/* Description text */}
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stay informed with the latest news and updates from Rangsit University
              </p>
            </div>

            {/* Grid layout for displaying announcement cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {/* Maps through the 'announcements' array to render a Card for each announcement */}
              {announcements.map((announcement, index) => (
                // Card component for an individual announcement
                <Card
                  key={index} // Unique key for list rendering
                  className="p-6 border-2 hover:border-primary transition-all duration-300 hover:shadow-card bg-card group cursor-pointer"
                >
                  {/* Container for category and urgent badges */}
                  <img src={announcement.image_url} alt={announcement.title} className="w-full h-48 object-cover mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {announcement.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {announcement.subtitle}
                  </p>


                </Card>
              ))}
            </div>

            {/* Section for the 'View All Announcements' button */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All Announcements
              </Button>
            </div>
          </div>
        </section>
      </main>
      {/* Renders the footer */}
      <Footer />
    </>
  );
};

// Exports the Announcements component for use in other parts of the application
export default Announcements;
