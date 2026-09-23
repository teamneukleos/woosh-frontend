export const brand = {
  colors: {
    electricBlue: "#003AF4",
    darkNavy: "#091B68",
    brightTeal: "#0DE3AF",
    black: "#000000",
    dullBlack: "#161616",
    softGrey: "#BCBCBC",
    white: "#FFFFFF",
  },
  fonts: {
    primary: "Geist",
    display: "Geist",
    sans: "Geist",
    sansNote: "Geist via next/font/google for UI and display.",
  },
  promise: "The creator marketplace Naija always needed",
  tagline: "The creator marketplace Naija always needed",
  personality: [
    "Swift",
    "Modern",
    "Efficient",
    "Tech driven",
    "Professional",
  ] as const,
  mvpChannels: ["INSTAGRAM", "TIKTOK", "YOUTUBE"] as const,
  mvpCurrencies: ["NGN"] as const,
  paymentProvider: "paystack" as const,
} as const;
