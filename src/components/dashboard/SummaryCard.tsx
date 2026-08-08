import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "negative" | "brand";
}

export default function SummaryCard({ label, value, icon: Icon, tone = "default" }: SummaryCardProps) {
  const toneClasses: Record<string, string> = {
    default: "text-gray-900",
    positive: "text-green-600",
    negative: "text-red-600",
    brand: "text-brand-600",
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </div>
      <p className={clsx("mt-2 text-2xl font-semibold", toneClasses[tone])}>{value}</p>
    </div>
  );
}
