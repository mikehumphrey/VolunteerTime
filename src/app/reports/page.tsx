
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, BrainCircuit, Loader2 } from "lucide-react";
import { volunteers, Volunteer } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateMotivation } from '@/ai/flows/generate-motivation-flow';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const { toast } = useToast();
  const currentUser = volunteers.find(v => v.email === 'michaelhumph@gmail.com')!;


  const handleGenerateSummary = async () => {
    setLoading(true);
    setSummary('');

    try {
      const volunteerDataForAI = volunteers.map((v: Volunteer) => ({
        name: v.name,
        hours: v.hours,
      }));
      
      const result = await generateMotivation({
        volunteerData: JSON.stringify(volunteerDataForAI),
        currentVolunteerName: currentUser.name,
      });

      if (result.summary) {
        setSummary(result.summary);
      } else {
        throw new Error("Failed to generate summary.");
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Summary",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Volunteer Reports</h1>
          <p className="text-muted-foreground">View and download reports of volunteer hours.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateSummary} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            Generate AI Motivation
          </Button>
          <Button>
            <FileDown className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      
      {(loading || summary) && (
        <Card>
          <CardContent className="pt-6">
            {loading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
            {summary && (
              <Alert>
                <BrainCircuit className="h-4 w-4" />
                <AlertTitle>Your Motivational Summary!</AlertTitle>
                <AlertDescription>
                  {summary}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Volunteer Hours Summary</CardTitle>
          <CardDescription>A list of all volunteers and their total contributed hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.sort((a,b) => b.hours - a.hours).map((volunteer) => (
                <TableRow key={volunteer.id} className={volunteer.id === currentUser.id ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={volunteer.avatar} alt={volunteer.name} data-ai-hint="person" />
                        <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{volunteer.name} {volunteer.id === currentUser.id ? '(You)' : ''}</div>
                        <div className="text-sm text-muted-foreground">{volunteer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-lg">{volunteer.hours} hrs</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
