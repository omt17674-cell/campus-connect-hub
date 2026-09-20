import { useEffect, useRef, useState } from "react";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhoneEmailAuthProps {
  onSuccess: (userJsonUrl: string) => void;
  onError?: ((error: string) => void) | undefined;
  className?: string;
}

// Declare global types for Phone.Email
declare global {
  interface Window {
    phoneEmailListener?: (userObj: { user_json_url: string }) => void;
  }
}

export function PhoneEmailAuth({ onSuccess, onError, className }: PhoneEmailAuthProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Avoid duplicate script loading
    if (scriptLoadedRef.current) return;

    // Define the callback for phone verification
    window.phoneEmailListener = (userObj: { user_json_url: string }) => {
      const { user_json_url } = userObj;
      console.log("Phone verification successful, user_json_url:", user_json_url);
      onSuccess(user_json_url);
    };

    // Load the Phone.Email script
    const script = document.createElement("script");
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    
    script.onload = () => {
      setIsLoading(false);
      scriptLoadedRef.current = true;
    };

    script.onerror = () => {
      const errorMsg = "Failed to load Phone.Email authentication service";
      setError(errorMsg);
      setIsLoading(false);
      if (onError) onError(errorMsg);
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Remove the listener when component unmounts
      if (window.phoneEmailListener) {
        delete window.phoneEmailListener;
      }
      
      // Optional: Remove script if needed (though it's usually fine to keep it)
      // Note: Removing might cause issues if multiple components use it
      // script.remove();
    };
  }, [onSuccess, onError]);

  if (error) {
    return (
      <div className={cn("rounded-lg border border-red-200 bg-red-50 p-4 text-center", className)}>
        <p className="text-sm text-red-600">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => {
            setError(null);
            setIsLoading(true);
            scriptLoadedRef.current = false;
            window.location.reload();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 p-4">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Loading phone verification...
          </span>
        </div>
      )}
      
      <div
        ref={containerRef}
        className={cn(
          "pe_signin_button_container",
          isLoading && "hidden"
        )}
      >
        {/* Phone.Email button will be injected here */}
        <div 
          className="pe_signin_button" 
          data-client-id="11230043630311578801"
        />
      </div>
    </div>
  );
}

/**
 * Custom styled version with GSFC branding
 */
export function PhoneEmailAuthButton({ onSuccess, onError, className }: PhoneEmailAuthProps) {
  const [verifying, setVerifying] = useState(false);

  const handleSuccess = (userJsonUrl: string) => {
    setVerifying(true);
    onSuccess(userJsonUrl);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-center">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          Or verify with phone
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <PhoneEmailAuth
        onSuccess={handleSuccess}
        onError={onError}
        className="w-full"
      />

      {verifying && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            Verifying phone number...
          </span>
        </div>
      )}
    </div>
  );
}
