
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Volunteer, StoreItem, Transaction } from "@/lib/data";
import { ShoppingCart, PlusCircle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVolunteers, getStoreItems, addStoreItem, getTransactions, addTransaction } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const transactionFormSchema = z.object({
  volunteerId: z.string().min(1, "Please select a volunteer."),
  itemId: z.string().min(1, "Please select an item."),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

const addItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  cost: z.coerce.number().min(1, "Cost must be at least 1 hour."),
});

type AddItemFormValues = z.infer<typeof addItemFormSchema>;

export default function StorePage() {
  const { toast } = useToast();
  const [volunteerList, setVolunteerList] = useState<Volunteer[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const fetchData = async () => {
    setLoadingData(true);
    const [volunteers, items, transactions] = await Promise.all([
      getVolunteers(),
      getStoreItems(),
      getTransactions(),
    ]);
    setVolunteerList(volunteers);
    setStoreItems(items);
    setTransactionHistory(transactions.sort((a, b) => b.date.getTime() - a.date.getTime()));
    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  

  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    mode: "onChange",
  });
  
  const addItemForm = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemFormSchema),
    mode: "onChange",
  });

  const { watch } = transactionForm;
  const selectedVolunteerId = watch("volunteerId");
  const selectedItemId = watch("itemId");

  const selectedVolunteer = volunteerList.find(v => v.id.toString() === selectedVolunteerId);
  const selectedItem = storeItems.find(i => i.id === selectedItemId);

  async function onTransactionSubmit(data: TransactionFormValues) {
    if (!selectedVolunteer || !selectedItem) {
      toast({
        title: "Error",
        description: "Invalid selection. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVolunteer.hours < selectedItem.cost) {
      toast({
        title: "Insufficient Hours",
        description: `${selectedVolunteer.name} does not have enough hours for this item.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingTransaction(true);
    try {
      const newVolunteerHours = selectedVolunteer.hours - selectedItem.cost;
      await addTransaction(selectedVolunteer.id, selectedItem.id, selectedItem.cost, newVolunteerHours);
      toast({
        title: "Transaction Successful",
        description: `Deducted ${selectedItem.cost} hours from ${selectedVolunteer.name} for a ${selectedItem.name}.`,
      });
      await fetchData(); // Refresh all data
      transactionForm.reset({volunteerId: '', itemId: ''});
    } catch(error) {
       toast({
        title: "Transaction Failed",
        description: "Could not complete the transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTransaction(false);
    }
  }

  async function onAddItemSubmit(data: AddItemFormValues) {
    const newItem: Omit<StoreItem, 'id'> = {
      name: data.name,
      cost: data.cost,
    };
    
    const existingId = data.name.toLowerCase().replace(/\s+/g, '-');
    if (storeItems.some(item => item.id === existingId)) {
      toast({
        title: "Item Exists",
        description: "An item with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingItem(true);
    try {
      await addStoreItem(newItem);
      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to the store.`,
      });
      await fetchData(); // Refresh store items
      addItemForm.reset({ name: "", cost: 0 });
    } catch (error) {
      toast({
        title: "Error Adding Item",
        description: "Could not add the new item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingItem(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Volunteer Store</h1>
        <p className="text-muted-foreground">Exchange volunteer hours for goods.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Transaction</CardTitle>
              <CardDescription>Select a volunteer and an item to complete a transaction.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-8">
                  <FormField
                    control={transactionForm.control}
                    name="volunteerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volunteer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ''} disabled={loadingData}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingData ? "Loading volunteers..." : "Select a volunteer"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {volunteerList.map(v => (
                              <SelectItem key={v.id} value={v.id.toString()}>
                                {v.name} ({Math.round(v.hours)} hours)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transactionForm.control}
                    name="itemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ''} disabled={loadingData}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingData ? "Loading items..." : "Select an item"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storeItems.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.cost} hours)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedVolunteer && selectedItem && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm">
                          This transaction will deduct <strong>{selectedItem.cost} hours</strong> from {selectedVolunteer.name}.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Their new balance will be <strong>{Math.round(selectedVolunteer.hours - selectedItem.cost)} hours</strong>.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Button type="submit" disabled={!selectedVolunteer || !selectedItem || isSubmittingTransaction}>
                    {isSubmittingTransaction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                    Complete Transaction
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Add New Store Item</CardTitle>
              <CardDescription>Add a new item that volunteers can exchange hours for.</CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...addItemForm}>
                <form onSubmit={addItemForm.handleSubmit(onAddItemSubmit)} className="space-y-8">
                   <FormField
                    control={addItemForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Water Bottle" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addItemForm.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost (in hours)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmittingItem}>
                    {isSubmittingItem ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Add Item
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <Card>
           <CardHeader>
             <CardTitle>Recent Transactions</CardTitle>
             <CardDescription>A log of the latest exchanges.</CardDescription>
           </CardHeader>
           <CardContent>
            {loadingData ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
            ) : transactionHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
            ) : (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionHistory.slice(0, 10).map((t) => {
                    const volunteer = volunteerList.find(v => v.id === t.volunteerId);
                    const item = storeItems.find(i => i.id === t.itemId);
                    return (
                      <TableRow key={t.id}>
                        <TableCell>
                          <div className="font-medium">{volunteer?.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{item?.name || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">-{t.hoursDeducted} hrs</TableCell>
                      </TableRow>
                    );
                  })}
                 </TableBody>
              </Table>
            )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
