import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import DoorAnimation from "@/components/DoorAnimation";
import CartDrawer from "@/components/CartDrawer";
import Announcement from "@/components/Announcement";
import PageTransition from "@/components/PageTransition";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <DoorAnimation />
      <Announcement />
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}
