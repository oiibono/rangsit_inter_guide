import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // This state will be passed to Navigation

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main
        className={cn(
          "flex-1 w-full min-w-0 transition-all duration-300 pt-16 sm:pt-[72px] lg:pt-0", // Match mobile top bar height
          isSidebarOpen ? "lg:ml-[250px]" : "lg:ml-[80px]"
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
