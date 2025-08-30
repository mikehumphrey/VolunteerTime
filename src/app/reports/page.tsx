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
import { FileDown } from "lucide-react";
import { volunteers } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Volunteer Reports</h1>
          <p className="text-muted-foreground">View and download reports of volunteer hours.</p>
        </div>
        <Button>
          <FileDown className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>
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
                <TableRow key={volunteer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={volunteer.avatar} alt={volunteer.name} data-ai-hint="person" />
                        <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{volunteer.name}</div>
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
