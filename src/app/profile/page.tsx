
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { updateVolunteer } from "@/lib/firestore";
import { useEffect } from "react";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must not be longer than 50 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  privacySettings: z.object({
    showPhone: z.boolean().default(true),
    showSocial: z.boolean().default(true),
  })
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { volunteer, loading } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      twitter: '',
      facebook: '',
      instagram: '',
      privacySettings: {
        showPhone: true,
        showSocial: true,
      }
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    if (volunteer) {
        form.reset({
            name: volunteer.name,
            email: volunteer.email,
            phone: volunteer.phone || '',
            twitter: volunteer.twitter || '',
            facebook: volunteer.facebook || '',
            instagram: volunteer.instagram || '',
            privacySettings: {
              showPhone: volunteer.privacySettings?.showPhone ?? true,
              showSocial: volunteer.privacySettings?.showSocial ?? true,
            }
        })
    }
  }, [volunteer, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!volunteer) return;
    
    try {
        await updateVolunteer(volunteer.id, data);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
        });
    } catch (error) {
        toast({
            title: "Update Failed",
            description: "Could not update your profile. Please try again.",
            variant: "destructive"
        });
    }
  }

  if (loading || !volunteer) {
    return (
       <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6 mb-8">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold font-headline">User Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and settings.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6 mb-8">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
                    <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" type="button">Change Photo</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} readOnly disabled/>
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
                        <FormDescription>
                          Your phone number will not be shared publicly.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Social Profiles</CardTitle>
                <CardDescription>Add your social media links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Twitter</FormLabel>
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
                        <FormLabel>Facebook</FormLabel>
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
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                        <Input placeholder="@username" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Privacy & Sharing</CardTitle>
                <CardDescription>Control what information is visible to other volunteers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="privacySettings.showPhone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Phone Number</FormLabel>
                      <FormDescription>
                        Allow other volunteers to see your phone number.
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
                name="privacySettings.showSocial"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Social Profiles</FormLabel>
                      <FormDescription>
                        Allow other volunteers to see your social media links.
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
            </CardContent>
          </Card>

          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </div>
  );
}
