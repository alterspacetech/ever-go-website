import SiteShell from "@/components/SiteShell";
import { CatalogProvider } from "@/context/CatalogContext";
import { StoreProvider } from "@/context/StoreContext";
import { getSiteData } from "@/lib/data";
import "./globals.css";

const DESCRIPTION = "Arabian perfumes, perfume oils, bukhoor and body care, delivered across Botswana. Fill your bag and order on WhatsApp.";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "EVER-GO Fragrance", template: "%s | EVER-GO Fragrance" },
  description: DESCRIPTION,
  icons: { icon: "/favicon.svg" },
  openGraph: { siteName: "EVER-GO Fragrance", title: "EVER-GO Fragrance", description: DESCRIPTION, type: "website" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }) {
  const data = await getSiteData();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap"
        />
      </head>
      <body>
        <CatalogProvider data={data}>
          <StoreProvider>
            <SiteShell>{children}</SiteShell>
          </StoreProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
