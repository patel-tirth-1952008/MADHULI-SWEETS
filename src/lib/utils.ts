import { prisma } from "./prisma";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function uniqueSlug(
  base: string,
  taken: (s: string) => Promise<boolean>
): Promise<string> {
  let slug = base || "item";
  let i = 2;
  while (await taken(slug)) slug = `${base}-${i++}`;
  return slug;
}

/** Generates an order id like MAD-2026-4821 (unique, 4 random digits). */
export async function generateOrderId(): Promise<string> {
  const year = new Date().getFullYear();
  for (let i = 0; i < 8; i++) {
    const n = Math.floor(1000 + Math.random() * 9000);
    const id = `MAD-${year}-${n}`;
    const exists = await prisma.order.findUnique({ where: { orderId: id }, select: { id: true } });
    if (!exists) return id;
  }
  return `MAD-${year}-${String(Date.now()).slice(-4)}`;
}

const PRODUCT_EMOJI: Record<string, string> = {
  jalebi: "🍥",
  "kaju katli": "🍬",
  "gulab jamun": "🍮",
  rasgulla: "⚪",
  "besan ladoo": "🟠",
  "motichoor": "🟡",
  "barfi": "🍡",
  "pista": "🥜",
  peda: "🧈",
  ghari: "🍯",
  "soan papdi": "🥮",
  "mysore pak": "🍮",
  rasmalai: "🥛",
  "cham cham": "🍥",
  "sev": "🥨",
  "vanela": "🥨",
  chakli: "🌀",
  mathiya: "🌽",
  fafda: "🫓",
  chevdo: "🥔",
  "moong dal": "🫘",
  bhujia: "🌾",
  "dal moth": "🫘",
  papdi: "🥯",
  boondi: "🟤",
  khaman: "🍘",
  dhokla: "🥮",
  patra: "🌿",
  handvo: "🫔",
  muthiya: "🌶️",
  khandvi: "🍜",
  idada: "🥯",
  "dal vada": "🍩",
  undhiyu: "🍲",
  gujiya: "🥟",
  shakarpara: "🥨",
  "namak pare": "🍘",
  "gift box": "🎁",
  "holi": "🎨",
};

export function productEmoji(name: string, fallback: string): string {
  const k = name.toLowerCase();
  for (const [key, emoji] of Object.entries(PRODUCT_EMOJI)) {
    if (k.includes(key)) return emoji;
  }
  return fallback;
}

export function unitLabel(unit: string): string {
  switch (unit) {
    case "per kg":
      return "/kg";
    case "per piece":
      return "/piece";
    case "per box":
      return "/box";
    case "per plate":
      return "/plate";
    case "per packet":
      return "/packet";
    case "per thali":
      return "/thali";
    default:
      return unit;
  }
}

export function isFestival(tags: string[]): boolean {
  return tags.some((t) => ["festival", "diwali", "holi", "winter"].includes(t));
}

export function isNewProduct(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 30 * 86400000;
}

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAYS)[number];
export const DAY_LABEL: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export type DayHours = {
  [key in DayKey]?: string | null;
};

/** Parses the operatingHours JSON string (handles both per-day and "mon-sat" legacy formats). */
export function parseHours(raw: string): DayHours {
  let parsed: Record<string, string | null | undefined> = {};
  try {
    parsed = JSON.parse(raw) as Record<string, string | null | undefined>;
  } catch {
    return {};
  }
  const out: DayHours = {};
  for (const d of DAYS) out[d] = null;
  for (const [key, value] of Object.entries(parsed)) {
    if (value == null) continue;
    if (key === "mon-sat") {
      for (const d of ["mon", "tue", "wed", "thu", "fri", "sat"] as const) out[d] = value;
    } else if (key in out) {
      out[key as DayKey] = value;
    }
  }
  return out;
}

export function hoursLabel(raw: string): string[] {
  const h = parseHours(raw);
  const fmtTime = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}${mm ? ":" + String(mm).padStart(2, "0") : ""} ${ampm}`;
  };
  const fmt = (v: string) => {
    const [a, b] = v.split("-");
    return `${fmtTime(a)} – ${fmtTime(b)}`;
  };
  const lines: string[] = [];
  const groups: Array<{ from: DayKey; to: DayKey; time: string }> = [];
  for (const d of ["mon", "tue", "wed", "thu", "fri", "sat"] as const) {
    const t = h[d];
    const last = groups[groups.length - 1];
    if (t && last && last.time === t && last.to !== "sun") {
      last.to = d;
    } else if (t) {
      groups.push({ from: d, to: d, time: t });
    }
  }
  for (const g of groups) {
    const label = g.from === g.to ? DAY_LABEL[g.from] : `${DAY_LABEL[g.from]} – ${DAY_LABEL[g.to]}`;
    lines.push(`${label}: ${fmt(g.time)}`);
  }
  if (h.sun) lines.push(`Sunday: ${fmt(h.sun)}`);
  return lines;
}
