import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full border border-destructive/20 bg-destructive/5 p-8 rounded-lg text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive border border-destructive/20">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">404_NOT_FOUND</h1>
          <p className="text-muted-foreground font-mono text-sm">
            The requested resource sector could not be located. It may have been redacted or moved.
          </p>
        </div>

        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-mono uppercase tracking-wider">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
