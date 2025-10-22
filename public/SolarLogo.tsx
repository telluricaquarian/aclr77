import Image from "next/image";

export const SolarLogo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <Image src="/images/aclr77.svg" alt="Areculateir Logo" width={140} height={48} priority {...props} />
);
