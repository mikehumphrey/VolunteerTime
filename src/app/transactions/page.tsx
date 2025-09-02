
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { Volunteer, StoreItem, Transaction } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVolunteers, getStoreItems, getTransactions } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function TransactionsPage() {
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [transactions, volunteerList, itemList] = await Promise.all([
        getTransactions(),
        getVolunteers(),
        getStoreItems()
      ]);
      setTransactionHistory(transactions.sort((a, b) => b.date.getTime() - a.date.getTime()));
      setVolunteers(volunteerList);
      setStoreItems(itemList);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleDownloadReport = () => {
    if (transactionHistory.length === 0) {
      toast({
        title: "No Data",
        description: "There are no transactions to download.",
      });
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Volunteer Name', 'Volunteer Email', 'Item Name', 'Hours Deducted'];
    const csvContent = [
      headers.join(','),
      ...transactionHistory.map(t => {
        const volunteer = volunteers.find(v => v.id === t.volunteerId);
        const item = storeItems.find(i => i.id === t.itemId);
        return [
          t.id,
          t.date.toISOString().split('T')[0],
          `"${volunteer?.name || 'N/A'}"`,
          volunteer?.email || 'N/A',
          `"${item?.name || 'N/A'}"`,
          t.hoursDeducted
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transaction_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSkeleton = () => (
     <TableRow>
        <TableCell>
           <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Transaction History</h1>
          <p className="text-muted-foreground">A complete log of all store transactions.</p>
        </div>
        <Button onClick={handleDownloadReport} disabled={loading}>
          <FileDown className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A list of all items exchanged for volunteer hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Hours Deducted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {renderSkeleton()}
                  {renderSkeleton()}
                  {renderSkeleton()}
                  {renderSkeleton()}
                </>
              ) : transactionHistory.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
              ) : (
                transactionHistory.map((transaction) => {
                  const volunteer = volunteers.find(v => v.id === transaction.volunteerId);
                  const item = storeItems.find(i => i.id === transaction.itemId);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={volunteer?.avatar} alt={volunteer?.name} data-ai-hint="person" />
                            <AvatarFallback>{volunteer?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{volunteer?.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{volunteer?.email || ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                          <div className="font-medium">{item?.name || 'Unknown Item'}</div>
                      </TableCell>
                       <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-lg text-destructive">-{transaction.hoursDeducted} hrs</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
