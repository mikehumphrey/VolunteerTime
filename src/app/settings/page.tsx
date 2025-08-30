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
import { useToast } from "@/hooks/use-toast";

const settingsFormSchema = z.object({
  volunteerFormUrl: z.string().url("Please enter a valid URL."),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      volunteerFormUrl: "https://www.offthechainak.org/wordpress/sample-page/volunteer/volunteer-form/",
    },
    mode: "onChange",
  });

  function onSubmit(data: SettingsFormValues) {
    // In a real app, you would save this to a backend or config file.
    console.log("Settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Application Settings</h1>
        <p className="text-muted-foreground">Configure application-wide settings here.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Form Links</CardTitle>
          <CardDescription>Manage external form links for your application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="volunteerFormUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volunteer Application Form URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-form-link.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the link to the Google Form for volunteer applications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
