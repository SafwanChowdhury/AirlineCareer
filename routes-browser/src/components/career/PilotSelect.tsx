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
import { Plus } from "lucide-react";
import { usePilot } from "@/lib/contexts/pilot-context";
import { PilotProfile } from "@/lib/types";
import Link from "next/link";

export function PilotSelect() {
  const { pilotId, setPilotId } = usePilot();
  const [pilots, setPilots] = useState<PilotProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/career/pilots")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setPilots(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching pilots:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="h-10 w-[200px] animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={pilotId?.toString()}
        onValueChange={(value) => setPilotId(parseInt(value, 10))}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a pilot" />
        </SelectTrigger>
        <SelectContent>
          {pilots.map((pilot) => (
            <SelectItem key={pilot.pilot_id} value={pilot.pilot_id.toString()}>
              {pilot.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" asChild>
        <Link href="/career/pilots/new">
          <Plus className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
