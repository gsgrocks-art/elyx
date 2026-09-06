import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";

const heading = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const settings = getSettings();
  return {
    title: settings?.businessName || "Jewellery Catalog",
    description: `Browse the ${settings?.businessName || "jewellery"} product catalog.`,
  };
}

export default function RootLayout({ children }) {
  const settings = getSettings();
  const themeVars = {
    "--color-primary": settings?.primaryColor || "#3D1560",
    "--color-accent": settings?.accentColor || "#E6007E",
  };

  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans" style={themeVars}>
        {children}
      </body>
    </html>
  );
}
