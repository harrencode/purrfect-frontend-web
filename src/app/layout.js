
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar.js"
import Head from "next/head";
import Footer from "./components/Footer";
import ClientLayoutWrapper from "./ClientLayoutWrapper";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Purr-Fect",
  description: "Connecting loving homes with pets in need. Rescue, adopt, or help locate missing pets in your area",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <Head>
        <script
            async
            defer
            src={`https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`}
          />
      </Head> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
