import * as z from "zod";

export const volunteerBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must not be longer than 50 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const volunteerAdminSchema = volunteerBaseSchema.extend({
  hours: z.coerce.number().min(0, "Hours cannot be negative."),
  formCompleted: z.boolean().default(false),
  formUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  isAdmin: z.boolean().default(false),
  privacySettings: z.object({
    showPhone: z.boolean().default(true),
    showSocial: z.boolean().default(true),
  }).optional(),
});

export const profileFormSchema = volunteerBaseSchema.pick({
  name: true,
  email: true,
  phone: true,
  twitter: true,
  facebook: true,
  instagram: true,
}).extend({
  privacySettings: z.object({
    showPhone: z.boolean().default(true),
    showSocial: z.boolean().default(true),
  })
});