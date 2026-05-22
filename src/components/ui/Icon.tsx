import { icons, type LucideProps } from "lucide-react";

/**
 * אייקון דינמי מ-lucide-react לפי שם (PascalCase).
 * משמש את הניווט והקבועים — ראו constants.ts.
 */
export function Icon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) {
    return <icons.Circle {...props} />;
  }
  return <LucideIcon {...props} />;
}
