"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { usePilot } from "@/lib/contexts/pilot-context";
import { Pilot } from "@/lib/types";
import Link from "next/link";
import { toast } from "sonner";
import { useSwrFetch } from "@/lib/hooks/use-swr-fetch";

export function PilotSelect() {
  const { pilotId, setPilotId } = usePilot();
  const [isInitialized, setIsInitialized] = useState(false);

  // Use SWR for fetching the pilots list
  const {
    data: pilots = [],
    error,
    isLoading,
  } = useSwrFetch<Pilot[]>("/api/career/pilots");

  // For debugging - log when component renders and what pilotId is
  useEffect(() => {
    console.log(`[pilot-select] Component rendered with pilotId: ${pilotId}`);
    setIsInitialized(true);
  }, [pilotId]);

  // Show error toast if API request fails
  useEffect(() => {
    if (error) {
      console.error("[pilot-select] Error fetching pilots:", error);
      toast.error(`Error loading pilots: ${error.message}`);
    }
  }, [error]);

  const handlePilotChange = (value: string) => {
    const newPilotId = parseInt(value, 10);
    console.log(
      `[pilot-select] Changing pilot ID from ${pilotId} to ${newPilotId}`
    );
    setPilotId(newPilotId);
  };

  // Find the selected pilot in the list
  const selectedPilot = pilots.find((p) => p.id === pilotId);

  if (isLoading && !isInitialized) {
    return <div className="h-10 w-[200px] animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={pilotId?.toString() || ""}
        onValueChange={handlePilotChange}
        defaultValue={pilotId?.toString()}
      >
        <SelectTrigger className="w-[200px] bg-white text-slate-900">
          <SelectValue>
            {selectedPilot
              ? `${selectedPilot.name} (ID: ${selectedPilot.id})`
              : "Select a pilot"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {pilots.length > 0 ? (
            pilots.map((pilot) => (
              <SelectItem key={pilot.id} value={pilot.id.toString()}>
                {pilot.name} (ID: {pilot.id})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No pilots available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {pilotId && pilotId > 0 && (
        <Button
          variant="secondary"
          size="icon"
          asChild
          className="bg-white hover:bg-slate-200"
        >
          <Link href={`/career/pilots/${pilotId}`}>
            <Settings className="h-4 w-4 text-slate-900" />
          </Link>
        </Button>
      )}
      <Button
        variant="secondary"
        size="icon"
        asChild
        className="bg-white hover:bg-slate-200"
      >
        <Link href="/career/pilots/new">
          <Plus className="h-4 w-4 text-slate-900" />
        </Link>
      </Button>
    </div>
  );
}
