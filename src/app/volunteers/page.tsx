
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, UserPlus, Edit, Trash2, Phone, FileText, CheckCircle, XCircle, Shield, Loader2, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { Volunteer, appSettings } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getVolunteers, updateVolunteer, createVolunteer, deleteVolunteer, addHours } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const volunteerFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  hours: z.coerce.number().min(0, "Hours cannot be negative."),
  phone: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  formCompleted: z.boolean().default(false),
  formUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  isAdmin: z.boolean().default(false),
  privacySettings: z.object({
      showPhone: z.boolean().default(true),
      showSocial: z.boolean().default(true),
    }).optional(),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

const addHoursFormSchema = z.object({
  hoursToAdd: z.coerce.number().positive("Hours must be a positive number."),
  date: z.date({
    required_error: "A date for the entry is required.",
  }),
});
type AddHoursFormValues = z.infer<typeof addHoursFormSchema>;


export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddHoursOpen, setIsAddHoursOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const { toast } = useToast();

  const fetchVolunteers = async () => {
    setLoading(true);
    const volunteerList = await getVolunteers();
    setVolunteers(volunteerList);
    setLoading(false);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
  });

  const addHoursForm = useForm<AddHoursFormValues>({
    resolver: zodResolver(addHoursFormSchema),
    defaultValues: {
      date: new Date(),
    }
  });


  const handleAddClick = () => {
    setEditingVolunteer(null);
    form.reset({ name: "", email: "", hours: 0, phone: "", twitter: "", facebook: "", instagram: "", formCompleted: false, formUrl: "", isAdmin: false });
    setIsFormOpen(true);
  };

  const handleEditClick = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    form.reset(volunteer);
    setIsFormOpen(true);
  };
  
  const handleAddHoursClick = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    addHoursForm.reset({ hoursToAdd: 0, date: new Date() });
    setIsAddHoursOpen(true);
  };

  const handleDeleteClick = async (volunteerId: string) => {
    if (confirm("Are you sure you want to delete this volunteer? This action cannot be undone.")) {
      try {
        await deleteVolunteer(volunteerId);
        toast({
          title: "Volunteer Deleted",
          description: "The volunteer has been removed successfully.",
        });
        fetchVolunteers();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete volunteer.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data: VolunteerFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingVolunteer) {
        // Edit existing volunteer
        await updateVolunteer(editingVolunteer.id, data);
        toast({
          title: "Volunteer Updated",
          description: "The volunteer's information has been updated.",
        });
      } else {
        // Add new volunteer
        await createVolunteer(data);
        toast({
          title: "Volunteer Added",
          description: `${data.name} has been added to the list.`,
        });
      }
      setIsFormOpen(false);
      fetchVolunteers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while saving the volunteer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddHoursSubmit = async (data: AddHoursFormValues) => {
    if (!editingVolunteer) return;
    setIsSubmitting(true);
    try {
      const roundedHours = Math.ceil(data.hoursToAdd * 4) / 4;
      
      await addHours(editingVolunteer.id, roundedHours, data.date);

      toast({
        title: "Hours Added",
        description: `${roundedHours} hours for ${format(data.date, "PPP")} have been added to ${editingVolunteer.name}.`,
      });
      setIsAddHoursOpen(false);
      fetchVolunteers();
    } catch (error) {
       toast({
        title: "Update Failed",
        description: "An error occurred while adding hours.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }


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
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Manage Volunteers</h1>
          <p className="text-muted-foreground">
            Add, edit, or remove volunteers from your organization.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingVolunteer ? "Edit Volunteer" : "Add New Volunteer"}
              </DialogTitle>
              <DialogDescription>
                {editingVolunteer
                  ? "Update the details for this volunteer."
                  : "Enter the details for the new volunteer."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="volunteer@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Hours</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="@username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="@username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Administrator</FormLabel>
                        <FormDescription>
                          Grants admin privileges to this user.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Volunteer Form</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="formCompleted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Form Completed</FormLabel>
                            <FormDescription>
                              Has the volunteer completed the application form?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="formUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Form Data URL</FormLabel>
                          <FormControl>
                            <Input placeholder="Link to submitted form data" {...field} />
                          </FormControl>
                           <FormDescription>
                            Link to the volunteer's submitted form data (e.g., a pre-filled Google Form link).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" asChild>
                           <Link href={appSettings.volunteerFormUrl} target="_blank"><FileText className="mr-2 h-4 w-4"/>View Blank Form</Link>
                        </Button>
                        {form.watch("formUrl") && (
                           <Button type="button" variant="outline" size="sm" asChild>
                              <Link href={form.watch("formUrl")!} target="_blank"><FileText className="mr-2 h-4 w-4"/>View Submitted Data</Link>
                           </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
                <DialogFooter className="sticky bottom-0 bg-background pt-4">
                  <DialogClose asChild>
                     <Button type="button" variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingVolunteer ? "Save Changes" : "Add Volunteer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Add Hours Dialog */}
        <Dialog open={isAddHoursOpen} onOpenChange={setIsAddHoursOpen}>
          <DialogContent className="sm:max-w-md">
             <DialogHeader>
              <DialogTitle>Add Hours for {editingVolunteer?.name}</DialogTitle>
              <DialogDescription>
                Manually add volunteer hours. Current total: {Math.round(editingVolunteer?.hours || 0)} hours.
              </DialogDescription>
            </DialogHeader>
            <Form {...addHoursForm}>
              <form onSubmit={addHoursForm.handleSubmit(onAddHoursSubmit)} className="space-y-4">
                 <FormField
                  control={addHoursForm.control}
                  name="hoursToAdd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours to Add</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2.5" {...field} step="0.25" />
                      </FormControl>
                      <FormDescription>
                        Value will be rounded up to the nearest 15-min increment.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={addHoursForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Hours</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <DialogFooter>
                  <DialogClose asChild>
                     <Button type="button" variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Hours
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volunteer Roster</CardTitle>
          <CardDescription>
            A list of all active volunteers in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Form Completed</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {renderSkeleton()}
                  {renderSkeleton()}
                  {renderSkeleton()}
                </>
              ) : (
              volunteers.sort((a,b) => a.name.localeCompare(b.name)).map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={volunteer.avatar}
                          alt={volunteer.name}
                          data-ai-hint="person"
                        />
                        <AvatarFallback>
                          {volunteer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {volunteer.name}
                          {volunteer.isAdmin && (
                            <Badge variant="secondary" className="gap-1">
                              <Shield className="h-3 w-3"/>
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {volunteer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-1">
                        {volunteer.phone && (volunteer.privacySettings?.showPhone ?? true) && <div className="flex items-center gap-2 text-sm"><Phone className="w-3 h-3 text-muted-foreground" /> <span>{volunteer.phone}</span></div>}
                        {(volunteer.privacySettings?.showSocial ?? true) && <div className="flex items-center gap-2 text-sm">
                           {volunteer.twitter && <a href={`https://twitter.com/${volunteer.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Twitter</a>}
                           {volunteer.facebook && <a href={`https://facebook.com/${volunteer.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Facebook</a>}
                           {volunteer.instagram && <a href={`https://instagram.com/${volunteer.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Instagram</a>}
                        </div>}
                     </div>
                  </TableCell>
                  <TableCell>
                    {volunteer.formCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{Math.round(volunteer.hours)} hrs</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(volunteer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddHoursClick(volunteer)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>Add Hours</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(volunteer.id)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
