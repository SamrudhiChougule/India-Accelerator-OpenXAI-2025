import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./InterVariable.ttf",
});

export const metadata: Metadata = {
  title: "Global fraud detection for Companies ",
  description:
    "A global fraud detection system that monitors company activities, identifies suspicious behavior, and prevents potential security breaches across branches.",
  keywords:
    "Fraud Detection, Security Monitoring, Access Metrics, Suspicious Activity, Branch Analytics, Real-Time Analysis, Risk Management, Data Visualization, Enterprise Security, Anomaly Detection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-black text-white">{children}</div>
      </body>
    </html>
  );
}
