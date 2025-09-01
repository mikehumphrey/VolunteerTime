
'use client';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2 } from "lucide-react";
import { Volunteer } from "@/lib/data";
import { generateVolunteerSummary } from '@/ai/flows/generate-volunteer-summary';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { getVolunteers } from '@/lib/firestore';

export default function SummaryPage() {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    async function fetchVolunteers() {
      setDataLoading(true);
      const volunteerList = await getVolunteers();
      setVolunteers(volunteerList);
      setDataLoading(false);
    }
    fetchVolunteers();
  }, []);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setSummary('');

    try {
      const volunteerDataForAI = volunteers.map((v: Volunteer) => ({
        name: v.name,
        hours: v.hours,
      }));
      
      const result = await generateVolunteerSummary({
        volunteerData: JSON.stringify(volunteerDataForAI),
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

  const renderSkeleton = () => (
     <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">AI-Powered Summary</h1>
          <p className="text-muted-foreground">Generate an AI summary with insights on volunteer hours.</p>
        </div>
        <Button onClick={handleGenerateSummary} disabled={loading || dataLoading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="mr-2 h-4 w-4" />
          )}
          Generate AI Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Data</CardTitle>
            <CardDescription>The data used to generate the AI summary.</CardDescription>
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
                {dataLoading ? (
                  <>
                  {renderSkeleton()}
                  {renderSkeleton()}
                  {renderSkeleton()}
                  </>
                ) : (
                  volunteers.map((volunteer) => (
                  <TableRow key={volunteer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={volunteer.avatar} alt={volunteer.name} data-ai-hint="person" />
                          <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{volunteer.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{Math.round(volunteer.hours)} hrs</TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Summary & Insights</CardTitle>
            <CardDescription>AI-generated analysis of the volunteer data.</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            {loading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}
            {summary ? (
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            ) : (
              !loading && <p className="text-muted-foreground">Click the button to generate an AI summary.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
