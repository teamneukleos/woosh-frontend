import { Geist } from "next/font/google";

/**
 * One family for UI and display. Variable Geist loads as a single file
 * so weight arrays cannot break the font-face.
 */
export const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-woosh-sans",
  display: "swap",
});

export const geistDisplay = geistSans;

/** @deprecated aliases for existing imports */
export const interSans = geistSans;
export const manropeDisplay = geistDisplay;
export const notoSans = geistSans;
export const notoSansDisplay = geistDisplay;
export const metropolis = geistSans;
export const proDunex = geistDisplay;
export const inter = geistSans;
export const googleSans = geistSans;
export const googleSansDisplay = geistDisplay;
export const wooshDisplay = geistDisplay;
