// public/SolarLogo.tsx
import Image from "next/image";

export const SolarLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/typelogo.svg"
    alt="Areculateir Logo"
    width={110}   // was 140
    height={38}   // was 48
    priority
    className={className}
  />
);
