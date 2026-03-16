import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center animate-fade-in">
        <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button className="gradient-primary text-primary-foreground">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
