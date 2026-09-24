export interface Category {
  id: string;
  name: string;
  nameGu: string | null;
  slug: string;
  icon: string;
  order: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  nameGu: string | null;
  slug: string;
  description: string | null;
  descriptionGu: string | null;
  price: number;
  unit: string;
  categoryId: string;
  category?: Category;
  image: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
] as const;
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItemRow {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  priceAtTime: number;
  subtotal: number;
}

export interface StatusUpdateRow {
  status: OrderStatus;
  time: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  landmark: string | null;
  pincode: string | null;
  items: OrderItemRow[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  orderType: string;
  deliverySlot: string;
  notes: string | null;
  statusHistory: StatusUpdateRow[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  shopName: string;
  shopNameGu: string;
  phones: string[];
  address: string;
  instagram: string;
  deliveryRadius: number;
  minOrder: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  isOpen: boolean;
  operatingHours: string;
  contactEmail: string;
  announcement: string | null;
  announcementActive: boolean;
  updatedAt: string;
}

export interface Activity {
  id: string;
  action: string;
  message: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  textGu: string | null;
  rating: number;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-warn/15 text-warn",
  confirmed: "bg-ysoft text-deepgold",
  preparing: "bg-jalebi/25 text-deepgold",
  out_for_delivery: "bg-linemed text-ink",
  delivered: "bg-ok/15 text-[#15803d]",
  cancelled: "bg-bad/10 text-bad",
};

export const SLOT_LABEL: Record<string, string> = {
  asap: "ASAP",
  morning: "Morning 9–12",
  afternoon: "Afternoon 12–4",
  evening: "Evening 4–8",
};
