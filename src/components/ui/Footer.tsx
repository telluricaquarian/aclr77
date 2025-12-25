import {
  RiGithubFill,
  RiSlackFill,
  RiTwitterXFill,
  RiYoutubeFill,
} from "@remixicon/react";
import Link from "next/link";
import { SolarLogo } from "../../../public/SolarLogo";

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  const sections = {
    solutions: {
      title: "Solutions",
      items: [
        { label: "High-End UI", href: "#" },
        { label: "Media Buying", href: "#" },
        { label: "Funnel Optimization", href: "#" },
      ],
    },

    resources: {
      title: "Resources",
      items: [
        { label: "Design Sensibilities – Notable Design Figures", href: "#" },
        {
          label: "Web design",
          href: "https://resourceareculateir.vercel.app/web-design",
        },
        { label: "U.X & U.I Psychology", href: "#" },
        { label: "Media Buying Mental Models", href: "#" },
        { label: "Copywriting Formulas", href: "#" },
        { label: "V.S.L Formulas", href: "#" },
        { label: "Optimizing Cursor", href: "#" },
        { label: "Using Resend for Email", href: "#" },
        { label: "Lead Generation", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  } as const;

  return (
    <div className="px-4 xl:px-0">
      <footer
        id="footer"
        className="relative mx-auto flex max-w-6xl flex-wrap pt-4"
      >
        {/* Vertical Lines */}
        <div className="pointer-events-none inset-0">
          {/* Left */}
          <div
            className="absolute inset-y-0 -my-20 w-px"
            style={{ maskImage: "linear-gradient(transparent, white 5rem)" }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-gray-300"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>

          {/* Right */}
          <div
            className="absolute inset-y-0 right-0 -my-20 w-ppx"
            style={{ maskImage: "linear-gradient(transparent, white 5rem)" }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-gray-300"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
        </div>

        {/* Decorative Pattern Divider */}
        <svg className="mb-10 h-20 w-full border-y border-dashed border-gray-300 stroke-gray-300">
          <defs>
            <pattern
              id="diagonal-footer-pattern"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8;
                return (
                  <path
                    key={i}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    stroke=""
                    strokeWidth="1"
                  />
                );
              })}
            </pattern>
          </defs>
          <rect
            stroke="none"
            width="100%"
            height="100%"
            fill="url(#diagonal-footer-pattern)"
          />
        </svg>

        {/* Logo + Socials */}
        <div className="mr-auto flex w-full justify-between lg:w-fit lg:flex-col">
          <Link
            href="/"
            className="flex items-center select-none font-medium text-gray-700 sm:text-sm"
          >
            <SolarLogo className="ml-2 w-20" />
            <span className="sr-only">Solar Logo (go home)</span>
          </Link>

          <div>
            <div className="mt-4 flex items-center">
              <Link
                href="https://x.com/areculateir"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Areculateir on X (Twitter)"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiTwitterXFill className="size-5" />
              </Link>
              <Link
                href="https://www.youtube.com/@Areculateir"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Areculateir on YouTube"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiYoutubeFill className="size-5" />
              </Link>
              <Link
                href="https://github.com/telluricaquarian"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub: telluricaquarian"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiGithubFill className="size-5" />
              </Link>
              <Link
                href="https://uibuilds.slack.com/team/U09S3G22Q81"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Slack profile"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiSlackFill className="size-5" />
              </Link>
            </div>
            <div className="ml-2 hidden text-sm text-gray-700 lg:inline">
              &copy; {CURRENT_YEAR} Made with Areculateirium⁷⁷.
            </div>
          </div>
        </div>

        {/* Footer Sections */}
        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="mt-10 min-w-44 pl-2 lg:mt-0 lg:pl-0">
            <h3 className="mb-4 font-medium text-gray-900 sm:text-sm">
              {section.title}
            </h3>
            <ul className="space-y-4">
              {section.items.map((item) => (
                <li key={item.label} className="text-sm">
                  <Link
                    href={item.href}
                    className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
    </div>
  );
};

export default Footer;
