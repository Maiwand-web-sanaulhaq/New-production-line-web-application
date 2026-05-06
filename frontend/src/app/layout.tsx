import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Production Line Planning",
  description: "MRP, forecasting, and production planning web application",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppLayout>{children}</AppLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}
