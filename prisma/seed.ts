/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  nameGu: string;
  price: number;
  unit: string;
  bestseller?: boolean;
  tags?: string[];
  description: string;
  image?: string; // FIXED: Added image property here!
};

const SWEETS: SeedProduct[] = [
  { name: "Jalebi", nameGu: "જલેબી", price: 300, unit: "per kg", bestseller: true, tags: ["fresh-daily"], description: "Crisp-springy spirals fried fresh every morning, soaked in hot kesar-gulkand syrup.", image: 'https://static.toiimg.com/thumb/53099699.cms?width=1200&height=900' },
  { name: "Kaju Katli", nameGu: "કાજુ કતલી", price: 900, unit: "per kg", bestseller: true, description: "Silky diamond slabs of pure cashew paste, finished with a whisper of silver varq.", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-4bC5656Lvtu5Sn-CtCxscNUiWa2dqPWSXXoqDhAikm8T8FapKLz6-HHV&s=10' },
  { name: "Gulab Jamun", nameGu: "ગુલાબ જાંબુ", price: 400, unit: "per kg", bestseller: true, description: "Soft khoya dumplings served warm in rose-cardamom syrup.", image: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Gulab-jamun-wallpaper-1.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original' },
  { name: "Rasgulla", nameGu: "રસગુલ્લા", price: 350, unit: "per kg", description: "Cloud-light chhena sponges in gently sweetened kesar water.", image: 'https://www.kuchpakrahahai.in/wp-content/uploads/2020/05/Rasgulla-2BRecipe-2Bin-2BPressure-2BCooker-e1626148996679.jpg' },
  { name: "Besan Ladoo", nameGu: "બેસન લાડુ", price: 500, unit: "per kg", bestseller: true, description: "Gram-flour ladoos with ghee and dry fruits, rolled the old way." },
  { name: "Motichoor Ladoo", nameGu: "મોતીચૂર લાડુ", price: 550, unit: "per kg", description: "Fine besan pearls bound with ghee, pistachio and kesar.", image: 'https://i.pinimg.com/736x/77/23/7a/77237ab834becf3fc6f72bc58e87f672.jpg' },
  { name: "Barfi (Plain)", nameGu: "બરફી", price: 450, unit: "per kg", description: "Classic milk-and-sugar barfi, cut clean and studded with pistachio." },
  { name: "Pista Barfi", nameGu: "પિસ્તા બરફી", price: 700, unit: "per kg", description: "Thick milk barfi loaded with ground pistachio." },
  { name: "Peda", nameGu: "પેંડા", price: 500, unit: "per kg", description: "Slow-reduced khoya peda with proper mawa richness.", image: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Indian_Sweet_Dessert_Peda_in_a_white_bone_china_plate.jpg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original' },
  { name: "Ghari", nameGu: "ઘારી", price: 600, unit: "per kg", bestseller: true, description: "Amber milk ghari — crisp outside, soft and melting inside." },
  { name: "Soan Papdi", nameGu: "સોન પાપડી", price: 350, unit: "per kg", description: "Feather-light, paper-soft squares. Perfect with evening chai." },
  { name: "Mysore Pak", nameGu: "મૈસૂર પાક", price: 500, unit: "per kg", description: "Rich, fudgy gram-flour cake cooked slowly in pure ghee." },
  { name: "Rasmalai", nameGu: "રસમલાઈ", price: 450, unit: "per kg", description: "Saffron-soaked chhena discs in lightened malai, fresh from the tawa." },
  { name: "Cham Cham", nameGu: "ચમચમ", price: 400, unit: "per kg", description: "Flaky milk floss that melts into kesar sugar." },
];

const NAMKEEN: SeedProduct[] = [
  { name: "Sev Gathiya", nameGu: "સેવ ગાંઠિયા", price: 200, unit: "per kg", bestseller: true, description: "Thin sev with crisp gathiya, roasted in pure peanut oil.", image: 'https://www.nehascookbook.com/wp-content/uploads/2022/11/Tikha-gathiya-WS-500x375.jpg' },
  { name: "Vanela Gathiya", nameGu: "વનેલા ગાંઠિયા", price: 220, unit: "per kg", description: "Chewy-crisp vanli gathiya, a Nikol favourite with chai.", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmJQ5t2r9wBIXp17teVgryMkaNYQ0eL4ueRpT6U5MScXQLtYeELYkxn4I&s=10' },
  { name: "Chakli", nameGu: "ચકરી", price: 250, unit: "per kg", bestseller: true, description: "Snail-shaped chaklis, crunchy with ajwain and chilli.", image: 'https://ministryofcurry.com/wp-content/uploads/2019/10/bhajani-chakli-2.jpg' },
  { name: "Mathiya", nameGu: "મઠિયા", price: 200, unit: "per kg", description: "Flaky corn mathiya — light, crisp and addictive." },
  { name: "Fafda", nameGu: "ફાફડા", price: 180, unit: "per kg", bestseller: true, description: "The crisp half you always reach for with your jam." },
  { name: "Chevdo", nameGu: "ચેવડો", price: 250, unit: "per kg", description: "Spicy potato sev with a proper Gujarati punch." },
  { name: "Moong Dal", nameGu: "મૂંગ દાળ", price: 280, unit: "per kg", description: "Roasted moong dal, salted the way we like it." },
  { name: "Aloo Bhujia", nameGu: "આલૂ ભુજિયા", price: 220, unit: "per kg", description: "Fine potato bhujia, slow-fried till golden.", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNLxT63wRpRyr6WRt7_Xb8MT1UrgHFEXu5ABXU1y9iwlAlsAZwzQamDnUf&s=10' },
  { name: "Mixed Namkeen", nameGu: "મિક્સ નમકીન", price: 200, unit: "per kg", description: "Our house mix — sev, gathiya, chakli and more on one thali." },
  { name: "Dal Moth", nameGu: "દાળ મોઠ", price: 230, unit: "per kg", description: "Crisp moth with roasted dal, best with green chutney." },
  { name: "Papdi", nameGu: "પાપડી", price: 180, unit: "per kg", description: "Paper-thin papdi for your evening chat." },
  { name: "Khara Boondi", nameGu: "ખારા બૂંદી", price: 200, unit: "per kg", description: "Boondi with a sharp, satisfying spice kick." },
];

const FARSAN: SeedProduct[] = [
  { name: "Khaman", nameGu: "ખમણ", price: 150, unit: "per kg", bestseller: true, description: "Soft, fresh khaman dhokla, steamed this morning." },
  { name: "Dhokla", nameGu: "ઢોકળા", price: 150, unit: "per kg", bestseller: true, description: "Airy gram-flour dhokla tempered with mustard and curry leaves." },
  { name: "Patra", nameGu: "પાતરા", price: 200, unit: "per kg", description: "Fool-patra rolled with spiced filling, the Kathiawad way." },
  { name: "Handvo", nameGu: "હાંડવો", price: 180, unit: "per piece", description: "Steamed rice-and-mung handvo topped with peanuts and tomato." },
  { name: "Muthiya", nameGu: "મુઠિયા", price: 200, unit: "per kg", description: "Steamed muthiya with lemon and ghee tempering." },
  { name: "Khandvi", nameGu: "ખાંડવી", price: 250, unit: "per kg", bestseller: true, description: "Ribbon-soft khandvi, tangy and fresh." },
  { name: "Idada", nameGu: "ઇડાદા", price: 150, unit: "per kg", description: "Crumbly, spiced idada — a street-style classic." },
  { name: "Dal Vada", nameGu: "દાળ વડા", price: 200, unit: "per kg", description: "Crisp lentil vadas, soft inside." },
];

const SEASONAL: SeedProduct[] = [
  { name: "Kathiyawadi Undhiyu", nameGu: "કાઠિયાવાડી ઊંધિયું", price: 250, unit: "per packet", bestseller: true, tags: ["festival", "winter"], description: "Winter's crown — mixed-vegetable undhiyu with fresh fenugreek leaves." },
  { name: "Gujiya", nameGu: "ગુજિયા", price: 400, unit: "per kg", tags: ["festival"], description: "Festive gujiya with dry-fruit filling, ready for frying." },
  { name: "Shakarpara", nameGu: "શકરપારા", price: 200, unit: "per kg", tags: ["festival"], description: "Crackling sweet shakarpara for your diya and chai." },
  { name: "Namak Pare", nameGu: "નમક પારે", price: 180, unit: "per kg", tags: ["festival"], description: "Crisp savoury namak pare to balance the mithai." },
  { name: "Diwali Gift Box", nameGu: "દિવાળી ગિફ્ટ બોક્સ", price: 1200, unit: "per box", bestseller: true, tags: ["diwali", "gift"], description: "A curated box of our top mithai, gift-wrapped and ready to give." },
  { name: "Holi Special Thali", nameGu: "હોળી સ્પેશિયલ થાળી", price: 800, unit: "per thali", tags: ["festival", "holi"], description: "Gulal-bright thali of Holi sweets — gujiya, malpua and more." },
];

const CATEGORIES = [
  { name: "Sweets", nameGu: "મીઠાઈ", slug: "sweets", icon: "🍬", order: 1, products: SWEETS },
  { name: "Namkeen", nameGu: "નાસ્તો", slug: "namkeen", icon: "🥨", order: 2, products: NAMKEEN },
  { name: "Farsan", nameGu: "ફરસાણ", slug: "farsan", icon: "🍽️", order: 3, products: FARSAN },
  { name: "Seasonal", nameGu: "સીઝનલ", slug: "seasonal", icon: "🎉", order: 4, products: SEASONAL },
];

const TESTIMONIALS = [
  {
    name: "Rameshbhai Patel, Nikol",
    text: "My whole family eats Madhuli's jalebi every Sunday. It is always fresh, never oily, and the syrup is just right. You can tell it was made this morning.",
    textGu: "રવિવારે આખું પરિવાર માધુલીની જલેબી ખાવાનું પસંદ કરે છે. હંમેશા તાજી, તેલની ચોટ વધારે નથી, અને સિરપ બરાબર. સમજાય છે કે આજે સવારે બનેલી છે.",
    rating: 5,
  },
  {
    name: "Hetal Mistry, Bopal",
    text: "Ordered Diwali gift boxes for my whole office. The packing was beautiful and the kaju katli was better than shops twice the price. Everyone asked where they came from.",
    textGu: "ઓફિસ માટે દિવાળીના ગિફ્ટ બોક્સ ઓર્ડર કર્યા હતા. પેકિંગ ખૂબ ગડબડીયું હતું અને કાજુ કતલી એટલી સુંદર કે બે ગણી કિંમતના દુકાન કરતાં વધુ. બધાએ પૂછ્યું — આ ક્યાંથી મળ્યા?",
    rating: 5,
  },
  {
    name: "Kunverbhai Shah, Aslaliya",
    text: "Their khaman tastes like my nani's. Soft, tangy, and you can feel it is made at home, not in a factory. The pure peanut oil makes a difference.",
    textGu: "તેમનું ખમણ મારી નાનીમાતા જેવું લાગે છે. નરમ, તાંડવું, અને સમજાય છે કે ઘરે બનેલું છે, ફેક્ટરીનું નહીં. શુદ્ધ મૂંગનું તેલ આખો તફાવત પાડે છે.",
    rating: 5,
  },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  console.log("🧹 Cleaning previous seed data…");
  await prisma.product.deleteMany();
  await prisma.order.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.category.deleteMany();

  console.log("🍬 Seeding categories…");
  const catIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.create({
      data: { name: c.name, nameGu: c.nameGu, slug: c.slug, icon: c.icon, order: c.order, isActive: true },
    });
    catIds[c.slug] = cat.id;
  }

  console.log("🍥 Seeding products…");
  let n = 0;
  for (const c of CATEGORIES) {
    for (const p of c.products) {
      await prisma.product.create({
        data: {
          name: p.name,
          nameGu: p.nameGu,
          slug: slugify(p.name),
          description: p.description,
          price: p.price,
          unit: p.unit,
          categoryId: catIds[c.slug],
          image: p.image || null, // FIXED: Now passing p.image to MongoDB!
          isAvailable: true,
          isFeatured: !!p.bestseller,
          isBestseller: !!p.bestseller,
          tags: p.tags ?? [],
          order: n,
        },
      });
      n++;
    }
  }

  console.log("👩 Seeding admin user…");
  const passwordHash = bcrypt.hashSync("madhuli2025", 10);
  await prisma.admin.upsert({
    where: { username: "madhuli" },
    update: { password: passwordHash },
    create: { username: "madhuli", password: passwordHash, role: "superadmin" },
  });

  console.log("⚙️  Seeding settings…");
  const existing = await prisma.settings.findFirst();
  if (!existing) {
    await prisma.settings.create({
      data: {
        shopName: "Madhuli Namkeen & Sweets",
        shopNameGu: "માધુલી નમકીન એન્ડ સ્વીટ્સ",
        phones: ["9924122746", "9723910062", "7284839843"],
        address: "Shop No. 17-18, Ishwar Icon, near Jivan Twins Bungalow, opposite Ishwar Bungalows, Nikol Gam, Nikol, Ahmedabad, Gujarat 382350",
        instagram: "madhulinamkeen_sweets2022",
        deliveryRadius: 5,
        minOrder: 100,
        deliveryFee: 30,
        freeDeliveryAbove: 500,
        isOpen: true,
        operatingHours: JSON.stringify({
          mon: "09:00-21:00",
          tue: "09:00-21:00",
          wed: "09:00-21:00",
          thu: "09:00-21:00",
          fri: "09:00-21:00",
          sat: "09:00-21:00",
          sun: "10:00-18:00",
        }),
        contactEmail: "",
        announcement: "🎉 Diwali orders now open! Pre-book your gift boxes.",
        announcementActive: true,
      },
    });
  }

  console.log("⭐ Seeding testimonials…");
  for (const t of TESTIMONIALS) {
    await prisma.testimonial.create({ data: t });
  }

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    admins: await prisma.admin.count(),
    settings: await prisma.settings.count(),
    testimonials: await prisma.testimonial.count(),
  };
  console.log("✅ Seed complete:", counts);
  console.log("   Admin login → username: madhuli / password: madhuli2025");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });