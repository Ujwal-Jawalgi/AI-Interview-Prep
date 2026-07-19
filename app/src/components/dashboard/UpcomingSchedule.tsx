"use client";

import { Calendar, Clock, Video } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function UpcomingSchedule() {
  // Using mock data since we don't have a schedule schema yet.
  const schedule = [
    {
      id: 1,
      title: "Google Technical Mock",
      date: "Today",
      time: "5:00 PM",
      type: "Technical",
    },
    {
      id: 2,
      title: "Amazon Behavioral",
      date: "Tomorrow",
      time: "10:30 AM",
      type: "Behavioral",
    },
  ];

  return (
    <div className="space-y-4">
      {schedule.map((item) => (
        <Card key={item.id} variant="glass" className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="text-white font-medium text-sm">{item.title}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.date} at {item.time}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex rounded-full">
            <Video className="w-4 h-4 mr-1.5" />
            Join
          </Button>
        </Card>
      ))}

      {schedule.length === 0 && (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">No upcoming practice sessions.</p>
          <Button variant="outline" size="sm" className="mt-4">
            Schedule One
          </Button>
        </div>
      )}
    </div>
  );
}
