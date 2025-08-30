'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogIn, LogOut, MapPin, CheckCircle, Timer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateClock();
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

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

  const handleToggleClock = () => {
    if (isClockedIn) {
      // Clocking out
      setIsClockedIn(false);
      const endTime = new Date();
      if (startTime) {
        const duration = (endTime.getTime() - startTime.getTime());
        toast({
          title: "Clocked Out",
          description: `You have successfully clocked out. Your session duration was ${formatDuration(duration)}.`,
          variant: "default"
        });
      }
      setElapsedTime(0);
      setStartTime(null);
    } else {
      // Clocking in
      setIsClockedIn(true);
      setStartTime(new Date());
      toast({
        title: "Clocked In",
        description: "You have successfully clocked in. Your time is now being tracked.",
        variant: "default"
      });
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
            className={`w-full h-16 text-xl rounded-full transition-all duration-300 transform hover:scale-105 ${isClockedIn ? 'bg-destructive hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            onClick={handleToggleClock}
            style={!isClockedIn ? { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' } : {}}
          >
            {isClockedIn ? (
              <>
                <LogOut className="mr-2 h-6 w-6" />
                Clock Out
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-6 w-6" />
                Clock In
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
