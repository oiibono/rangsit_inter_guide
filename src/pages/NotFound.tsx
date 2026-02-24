import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "@/components/Footer";

// Define the NotFound functional component
const NotFound = () => {
  // Get the current location object from react-router-dom, which contains information about the URL
  const location = useLocation();

  // useEffect hook to perform side effects after rendering
  useEffect(() => {
    // Logs a 404 error message to the console, including the non-existent path the user tried to access
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]); // The effect re-runs if the pathname changes

  // The component's render method (Navigation is rendered once by Layout)
  return (
    <>
      <main className="pt-20 lg:pt-0 lg:mr-[80px]">
        <div className="flex min-h-[80vh] items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">404</h1>
            <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
            <a href="/" className="text-blue-500 underline hover:text-blue-700">
              Return to Home
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
