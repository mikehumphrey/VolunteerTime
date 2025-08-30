
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  const calendarSrc = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FLos_Angeles&bgcolor=%23000000&title=Off%20the%20Chain%20Events&showTz=0&showPrint=0&showCalendars=0&showDate=1&src=b2ZmdGhlY2hhaW5hbGFza2FAZ21haWwuY29t&color=%23B38B00";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Event Calendar</h1>
        <p className="text-muted-foreground">View upcoming events and volunteer opportunities.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
             <CalendarIcon className="w-6 h-6" />
             <CardTitle>Upcoming Events</CardTitle>
          </div>
          <CardDescription>
            This calendar shows all upcoming events for Off the Chain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
           <iframe
              src={calendarSrc}
              style={{ borderWidth: 0 }}
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="no"
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
