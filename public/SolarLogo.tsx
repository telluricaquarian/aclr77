// public/SolarLogo.tsx
import Image from "next/image";

export const SolarLogo = ({ className }: { className?: string }) => (
  <Image
    src="/images/aclr77.svg"
    alt="Areculateir Logo"
    width={140}
    height={48}
    priority
    className={className}
  />
);
