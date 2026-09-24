import en from "./en.json";
import gu from "./gu.json";
import { useLangStore } from "@/store/langStore";

type Dict = Record<string, string>;

/** Tiny JSON i18n — returns a t(key) bound to the active language. */
export function useT(): (key: string) => string {
  const lang = useLangStore((s) => s.lang);
  return (key: string) =>
    lang === "gu"
      ? ((gu as Dict)[key] ?? (en as Dict)[key] ?? key)
      : ((en as Dict)[key] ?? key);
}
