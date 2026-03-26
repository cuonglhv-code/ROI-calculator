import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROI Calculator - Phân tích tài chính khóa học",
  description: "Công cụ tính toán ROI chuyên nghiệp cho trung tâm tiếng Anh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col selection:bg-indigo-100 font-sans">
        {children}
      </body>
    </html>
  );
}
