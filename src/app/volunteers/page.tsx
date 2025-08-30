
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
  DialogTrigger,
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
import { MoreHorizontal, UserPlus, Edit, Trash2, Phone, FileText, CheckCircle, XCircle, Shield } from "lucide-react";
import { volunteers as initialVolunteers, Volunteer, appSettings } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const volunteerFormSchema = z.object({
  id: z.number().optional(),
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
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(initialVolunteers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const { toast } = useToast();

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      hours: 0,
      phone: "",
      twitter: "",
      facebook: "",
      instagram: "",
      formCompleted: false,
      formUrl: "",
      isAdmin: false,
    },
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

  const handleDeleteClick = (volunteerId: number) => {
    setVolunteers(volunteers.filter((v) => v.id !== volunteerId));
    toast({
      title: "Volunteer Deleted",
      description: "The volunteer has been removed successfully.",
    });
  };

  const onSubmit = (data: VolunteerFormValues) => {
    if (editingVolunteer) {
      // Edit existing volunteer
      const updatedVolunteers = volunteers.map((v) =>
        v.id === editingVolunteer.id ? { ...v, ...data } : v
      );
      setVolunteers(updatedVolunteers);
      toast({
        title: "Volunteer Updated",
        description: "The volunteer's information has been updated.",
      });
    } else {
      // Add new volunteer
      const newVolunteer: Volunteer = {
        ...data,
        id: Math.max(...volunteers.map(v => v.id), 0) + 1,
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
      };
      setVolunteers([...volunteers, newVolunteer]);
      toast({
        title: "Volunteer Added",
        description: `${data.name} has been added to the list.`,
      });
    }
    setIsFormOpen(false);
    form.reset();
  };

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
                        <Input placeholder="volunteer@example.com" {...field} />
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
                  <Button type="submit">{editingVolunteer ? "Save Changes" : "Add Volunteer"}</Button>
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
              {volunteers.sort((a,b) => a.name.localeCompare(b.name)).map((volunteer) => (
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
                        {volunteer.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-3 h-3 text-muted-foreground" /> <span>{volunteer.phone}</span></div>}
                        <div className="flex items-center gap-2 text-sm">
                           {volunteer.twitter && <a href={`https://twitter.com/${volunteer.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Twitter</a>}
                           {volunteer.facebook && <a href={`https://facebook.com/${volunteer.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Facebook</a>}
                           {volunteer.instagram && <a href={`https://instagram.com/${volunteer.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Instagram</a>}
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                    {volunteer.formCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{volunteer.hours} hrs</TableCell>
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
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(volunteer.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
