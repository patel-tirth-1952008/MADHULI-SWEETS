import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins, Noto_Sans_Gujarati } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});
const notoGujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-notoguj",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Madhuli Namkeen & Sweets — Our Quality is Our Speciality | Nikol, Ahmedabad",
    template: "%s — Madhuli Namkeen & Sweets",
  },
  description:
    "Handmade mithai and namkeen in 100% pure peanut oil, fresh every morning. Shop No. 17-18, Ishwar Icon, Nikol, Ahmedabad. Order online for home delivery or store pickup.",
  openGraph: {
    title: "Madhuli Namkeen & Sweets",
    description:
      "100% pure peanut oil. Fresh daily. Woman-owned. Nikol, Ahmedabad — order jalebi, kaju katli, dhokla and more online.",
    locale: "en_IN",
    type: "website",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FACC15",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Madhuli Namkeen & Sweets",
  slogan: "Our Quality is Our Speciality",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Shop No. 17-18, Ishwar Icon, near Jivan Twins Bungalow, opposite Ishwar Bungalows, Nikol Gam",
    addressLocality: "Ahmedabad",
    addressRegion: "Gujarat",
    postalCode: "382350",
    addressCountry: "IN",
  },
  telephone: ["+91-9924122746", "+91-9723910062", "+91-7284839843"],
  geo: { "@type": "GeoCoordinates", latitude: 23.0744, longitude: 72.6788 },
  servesCuisine: "Gujarati",
  priceRange: "₹₹",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${notoGujarati.variable}`}>
      <body className="bg-white font-body text-ink antialiased">
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
