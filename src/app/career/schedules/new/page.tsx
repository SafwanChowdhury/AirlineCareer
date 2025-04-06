"use client";

import { ScheduleForm } from "@/components/career/ScheduleForm";
import { usePilot } from "@/lib/contexts/pilot-context";
import { Card, CardContent } from "@/components/ui/card";

export default function NewSchedulePage() {
  const { pilotId } = usePilot();

  if (!pilotId) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Schedule</h1>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No pilot profile selected. Please create or select a pilot profile
              to continue.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Schedule</h1>
      <div className="max-w-2xl mx-auto">
        <ScheduleForm />
      </div>
    </div>
  );
}
