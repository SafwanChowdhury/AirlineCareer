import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface FallbackErrorProps {
  error: Error;
  reset: () => void;
}

export function FallbackError({ error, reset }: FallbackErrorProps) {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Error Occurred
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
}
