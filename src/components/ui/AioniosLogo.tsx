import { Zap } from "lucide-react";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, { box: string; icon: string; text: string }> = {
  sm: { box: "w-8 h-8 rounded-lg",   icon: "w-4 h-4", text: "text-lg" },
  md: { box: "w-8 h-8 rounded-lg",   icon: "w-4 h-4", text: "text-xl" },
  lg: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5", text: "text-2xl" },
};

interface AioniosLogoProps {
  size?: LogoSize;
  textColor?: string;
}

export default function AioniosLogo({ size = "lg", textColor = "text-white" }: AioniosLogoProps) {
  const s = sizeMap[size];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} bg-indigo-600 flex items-center justify-center flex-shrink-0`}>
        <Zap className={`${s.icon} text-white`} strokeWidth={2.5} />
      </div>
      <span className={`${s.text} font-bold tracking-tight ${textColor}`}>Aionios</span>
    </div>
  );
}
