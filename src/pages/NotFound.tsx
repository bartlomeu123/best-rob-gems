import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 font-display text-6xl font-bold text-primary">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Page not found</p>
        <Link to="/">
          <Button variant="default">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
