
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, UserPlus, Edit, Trash2 } from "lucide-react";
import { volunteers as initialVolunteers, Volunteer } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const volunteerFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  hours: z.coerce.number().min(0, "Hours cannot be negative."),
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
    },
  });

  const handleAddClick = () => {
    setEditingVolunteer(null);
    form.reset({ name: "", email: "", hours: 0 });
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
          <DialogContent className="sm:max-w-[425px]">
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <DialogFooter>
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
                        <div className="font-medium">{volunteer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {volunteer.email}
                        </div>
                      </div>
                    </div>
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
