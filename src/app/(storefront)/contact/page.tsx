import type { Metadata } from "next";
import ContactClient from "@/components/contact/ContactClient";

export const metadata: Metadata = {
  title: "Contact — Call, WhatsApp or Message Us",
  description:
    "Visit Madhuli Namkeen & Sweets at Ishwar Icon, Nikol, Ahmedabad, or send a message. We reply on WhatsApp fastest.",
};

export default function ContactPage() {
  return <ContactClient />;
}
