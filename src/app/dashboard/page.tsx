
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogIn, LogOut, MapPin, CheckCircle, Timer, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { clockIn, clockOut, getClockEventById } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { volunteer, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Timer interval
  useEffect(() => {
    if (isClockedIn && startTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        setElapsedTime(now.getTime() - startTime.getTime());
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isClockedIn, startTime]);

  // Check for active session on load
  const checkActiveSession = useCallback(async () => {
    if (volunteer && volunteer.currentClockEventId) {
      const event = await getClockEventById(volunteer.currentClockEventId);
      if (event && event.status === 'active') {
        setIsClockedIn(true);
        setActiveEventId(event.id);
        setStartTime(event.startTime);
      }
    }
    setIsLoading(false);
  }, [volunteer]);

  useEffect(() => {
    if (!authLoading && volunteer) {
      checkActiveSession();
    } else if (!authLoading && !volunteer) {
        // If auth is done but there's no volunteer, stop loading.
        setIsLoading(false);
    }
  }, [authLoading, volunteer, checkActiveSession]);


  const handleToggleClock = async () => {
    if (!volunteer) return;
    setIsSubmitting(true);

    if (isClockedIn) {
      // Clocking out
      if (!activeEventId) {
        toast({ title: "Error", description: "No active session found to clock out from.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      try {
        await clockOut(volunteer.id, activeEventId, volunteer.hours);
        toast({
          title: "Clocked Out",
          description: `You have successfully clocked out. Your hours have been updated.`,
        });
        setIsClockedIn(false);
        setElapsedTime(0);
        setStartTime(null);
        setActiveEventId(null);
      } catch (error) {
        toast({ title: "Clock Out Failed", description: "Could not clock out. Please try again.", variant: "destructive" });
      }

    } else {
      // Clocking in
      try {
        const newEventId = await clockIn(volunteer.id);
        toast({
          title: "Clocked In",
          description: "You have successfully clocked in. Your time is now being tracked.",
        });
        setIsClockedIn(true);
        setActiveEventId(newEventId);
        setStartTime(new Date());
      } catch (error) {
        toast({ title: "Clock In Failed", description: "Could not clock in. Please try again.", variant: "destructive" });
      }
    }
    setIsSubmitting(false);
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-16 w-full rounded-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
            <Clock className="w-8 h-8" />
            Volunteer Clock
          </CardTitle>
          <CardDescription>{currentTime}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Location: Community Center</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          
          {isClockedIn && (
            <Card className="w-full bg-secondary">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2 text-primary">
                  <Timer className="w-6 h-6"/>
                  Session Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-5xl font-mono font-bold tracking-widest">
                  {formatDuration(elapsedTime)}
                </p>
              </CardContent>
            </Card>
          )}

          <Button 
            size="lg" 
            className="w-full h-16 text-xl rounded-full transition-all duration-300 transform hover:scale-105"
            variant={isClockedIn ? 'destructive' : 'default'}
            onClick={handleToggleClock}
            disabled={isSubmitting || !volunteer}
          >
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              isClockedIn ? (
                <>
                  <LogOut className="mr-2 h-6 w-6" />
                  Clock Out
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-6 w-6" />
                  Clock In
                </>
              )
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
