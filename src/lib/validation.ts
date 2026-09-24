import { z } from "zod";

export const UNITS = [
  "per kg",
  "per piece",
  "per box",
  "per plate",
  "per packet",
  "per thali",
] as const;

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const maybeText = (max: number) =>
  z.string().max(max).nullable().optional().or(z.literal(""));

export const productSchema = z.object({
  name: z.string().min(1, "Item name is required").max(80),
  nameGu: maybeText(80),
  description: maybeText(300),
  descriptionGu: maybeText(300),
  price: z.number({ message: "Price must be a number" }).positive("Price must be positive").max(1000000),
  unit: z.enum(UNITS, { message: "Pick a valid unit" }),
  categoryId: objectId,
  image: z.string().url("Image must be a valid URL").nullable().optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10).default([]),
  order: z.number().int().min(0).default(0),
});
export type ProductInput = z.infer<typeof productSchema>;

export const priceSchema = z.object({
  price: z.number().positive("Price must be positive").max(1000000),
});

export const stockSchema = z.object({ isAvailable: z.boolean() });

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderCreateSchema = z
  .object({
    customerName: z.string().min(2, "Please enter your name").max(60),
    customerPhone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    orderType: z.enum(["delivery", "pickup"]),
    customerAddress: maybeText(200),
    landmark: maybeText(120),
    pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode").nullable().optional().or(z.literal("")),
    paymentMethod: z.enum(["cod", "upi"]),
    deliverySlot: z.enum(["asap", "morning", "afternoon", "evening"]),
    notes: maybeText(400),
    items: z
      .array(
        z.object({
          productId: objectId,
          quantity: z.number().positive().max(50),
        })
      )
      .min(1, "Your cart is empty"),
  })
  .superRefine((d, ctx) => {
    if (d.orderType === "delivery") {
      if (!d.customerAddress) {
        ctx.addIssue({ code: "custom", path: ["customerAddress"], message: "Address is required for home delivery" });
      }
      if (!d.pincode) {
        ctx.addIssue({ code: "custom", path: ["pincode"], message: "Pincode is required for home delivery" });
      }
    }
  });
export type OrderInput = z.infer<typeof orderCreateSchema>;

export const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

export const categorySchema = z.object({
  name: z.string().min(1, "Category name required").max(40),
  nameGu: maybeText(40),
  icon: z.string().max(4).default("🍬"),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const settingsSchema = z.object({
  shopName: z.string().min(1).max(80).optional(),
  shopNameGu: z.string().max(80).optional(),
  phones: z.array(z.string().regex(/^\d{10}$/, "Phone must be 10 digits")).max(6).optional(),
  address: z.string().min(5).max(220).optional(),
  instagram: z.string().max(60).optional(),
  deliveryRadius: z.number().int().min(1).max(50).optional(),
  minOrder: z.number().min(0).max(100000).optional(),
  deliveryFee: z.number().min(0).max(1000).optional(),
  freeDeliveryAbove: z.number().min(0).max(100000).optional(),
  isOpen: z.boolean().optional(),
  operatingHours: z.string().max(600).optional(),
  contactEmail: z.string().email("Enter a valid email").max(80).or(z.literal("")).optional(),
  announcement: z.string().max(200).nullable().optional(),
  announcementActive: z.boolean().optional(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(60),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  message: z.string().min(5, "Message is a little short").max(600),
});

export const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(6, "New password needs at least 6 characters").max(80),
    confirm: z.string().min(1),
  })
  .refine((d) => d.next === d.confirm, { message: "New passwords do not match", path: ["confirm"] });
