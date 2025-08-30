
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Facebook } from "lucide-react";
import Link from 'next/link';

export default function CalendarPage() {
  const calendarSrc = "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FLos_Angeles&bgcolor=%23000000&title=Off%20the%20Chain%20Events&showTz=0&showPrint=0&showCalendars=0&showDate=1&src=b2ZmdGhlY2hhaW5hbGFza2FAZ21haWwuY29t&color=%23B38B00";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Event Calendar</h1>
        <p className="text-muted-foreground">View upcoming events and volunteer opportunities.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Facebook className="w-6 h-6" />
                        <CardTitle>Stay Updated on Facebook</CardTitle>
                    </div>
                    <CardDescription>
                        Follow our Facebook page for the latest news, event updates, and volunteer calls.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button asChild className="w-full">
                        <Link href="https://www.facebook.com/offthechainak" target="_blank">
                            <Facebook className="mr-2 h-4 w-4" />
                            Visit Facebook Page
                        </Link>
                    </Button>
                    <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                        <p>A live feed of recent posts will be displayed here in a future update.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
