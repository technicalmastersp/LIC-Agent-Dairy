import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft, Home } from "lucide-react";
import siteConfig from "@/config/siteConfig";

const REDIRECT_SECONDS = 5;

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    if (count <= 0) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [count, navigate]);

  const progressPct = Math.max(0, Math.min(100, ((REDIRECT_SECONDS - count) / REDIRECT_SECONDS) * 100));

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md text-center">

        {/* Icon badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
        </div>

        {/* 404 numeral — scales down for very small screens */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-form-header leading-none tracking-tight">
          404
        </h1>

        <p className="mt-4 text-lg sm:text-xl font-medium text-form-header">
          This page doesn't exist
        </p>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground break-words px-2">
          We couldn't find <span className="font-mono text-xs sm:text-sm bg-muted border border-border rounded px-1.5 py-0.5 break-all">{location.pathname}</span> on {siteConfig.title}.
        </p>

        {/* Countdown progress bar */}
        <div className="mt-8 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Redirecting to home</span>
            <span className="font-medium text-form-header tabular-nums">{count}s</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Actions — stack on mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-8">
          <Button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary-light w-full sm:w-auto"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Home now
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="bg-background w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;