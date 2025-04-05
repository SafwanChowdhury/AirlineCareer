"use client";

import { ScheduleForm } from "@/components/career/ScheduleForm";

export default function NewSchedulePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Schedule</h1>
      <div className="max-w-2xl mx-auto">
        <ScheduleForm />
      </div>
    </div>
  );
}
