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
import { PilotProfile } from "@/lib/types";
import Link from "next/link";
import { toast } from "sonner";

export function PilotSelect() {
  const { pilotId, pilot, setPilotId } = usePilot();
  const [pilots, setPilots] = useState<PilotProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For debugging - log when component renders and what pilotId is
  useEffect(() => {
    console.log(`[pilot-select] Component rendered with pilotId: ${pilotId}`);
  }, [pilotId]);

  useEffect(() => {
    console.log("[pilot-select] Fetching pilots list");
    fetch("/api/career/pilots")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch pilots: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("[pilot-select] Raw API response:", data);

        // Handle response based on format
        // Check if data has success property (new format)
        if (data && typeof data === "object") {
          if (data.success && Array.isArray(data.data)) {
            console.log(
              `[pilot-select] Loaded ${data.data.length} pilots (success format)`
            );
            setPilots(data.data);
          }
          // Check if data is directly an array (old format)
          else if (Array.isArray(data)) {
            console.log(
              `[pilot-select] Loaded ${data.length} pilots (direct array)`
            );
            setPilots(data);
          }
          // Handle error response
          else if (data.error) {
            console.error("[pilot-select] API returned error:", data.error);
            toast.error(`Failed to load pilots: ${data.error}`);
            setPilots([]);
          }
          // Unexpected format
          else {
            console.error(
              "[pilot-select] Unexpected API response format:",
              data
            );
            toast.error("Received unexpected data format from server");
            setPilots([]);
          }
        } else {
          console.error("[pilot-select] Invalid API response:", data);
          toast.error("Received invalid data from server");
          setPilots([]);
        }
      })
      .catch((error) => {
        console.error("[pilot-select] Error fetching pilots:", error);
        toast.error(`Error loading pilots: ${error.message}`);
        setPilots([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handlePilotChange = (value: string) => {
    const newPilotId = parseInt(value, 10);
    console.log(
      `[pilot-select] Changing pilot ID from ${pilotId} to ${newPilotId}`
    );
    setPilotId(newPilotId);
  };

  // Find the selected pilot in the list
  const selectedPilot = pilots.find((p) => p.id === pilotId);

  if (isLoading) {
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
