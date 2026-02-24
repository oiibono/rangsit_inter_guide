import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // This state will be passed to Navigation

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main
        className={cn(
          "flex-1 transition-all duration-300 pt-20 lg:pt-0", // pt-20 for mobile top bar, lg:pt-0 for desktop
          isSidebarOpen ? "lg:ml-[250px]" : "lg:ml-[80px]" // Adjust margin based on sidebar state for desktop
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
