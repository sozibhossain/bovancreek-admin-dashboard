import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "sonner"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "BPOOL Admin Dashboard",
  description: "School bus booking system admin dashboard",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen bg-[#F9F7F9]">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-72 transition-all duration-300">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
