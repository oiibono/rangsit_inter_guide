/**
 * Index component serves as the main landing page of the application.
 * It integrates various sections like navigation, hero, quick links, administration process, and footer.
 */
// Import necessary components for the landing page layout and functionality (Navigation is rendered once by Layout)
import Hero from "@/components/Hero";                     // Hero section component (e.g., banner, main call to action)
import QuickLinks from "@/components/QuickLinks";         // Quick links section component
import AdministrationProcess from "@/components/AdministrationProcess"; // Component displaying administrative processes
import Footer from "@/components/Footer";                 // Footer component

// Define the Index functional component, which acts as the main landing page
const Index = () => {
  // The component's render method
  return (
    // Main container div for the entire page, ensuring minimum screen height and setting background color
    <div className="min-h-screen bg-background">
      <div>
        {/* Renders the hero section of the landing page */}
        <Hero />
        {/* Renders the quick links section */}
        <QuickLinks />

        {/* Renders the administration process section */}
        <AdministrationProcess />
      </div>

      {/* Renders the footer section */}
      <Footer />
    </div>
  );
};

// Exports the Index component for use in other parts of the application (e.g., routing)
export default Index;
