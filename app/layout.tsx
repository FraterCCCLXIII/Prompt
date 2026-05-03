import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { getAppSettings } from "@/lib/app-settings";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt",
  description: "Minimal anonymous text posts with shareable links.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appSettings = await getAppSettings();
  const googleAnalyticsMeasurementId = appSettings.googleAnalyticsEnabled
    ? appSettings.googleAnalyticsMeasurementId
    : null;

  return (
    <html lang="en">
      <body className={`${inter.variable} ${newsreader.variable} antialiased`}>
        <GoogleAnalytics measurementId={googleAnalyticsMeasurementId} />
        {children}
      </body>
    </html>
  );
}
