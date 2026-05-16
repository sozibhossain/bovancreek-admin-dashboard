"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Car,
  Route,
  CreditCard,
  LogOut,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Passenger Bookings", icon: Users, href: "/dashboard/bookings" },
  { label: "Vehicle List", icon: Car, href: "/dashboard/vehicles" },
  { label: "Driver List", icon: UserCircle, href: "/dashboard/drivers" },
  { label: "Routes", icon: Route, href: "/dashboard/routes" },
  { label: "Parent List", icon: Users, href: "/dashboard/parents" },
  { label: "Payment History", icon: CreditCard, href: "/dashboard/payments" },
];

type ApiUser = {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  avatar?: { url?: string; public_id?: string };
};

type UserResponse = {
  success: boolean;
  message: string;
  data: ApiUser;
};

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const { data: sessionData, status } = useSession();
  const userId = sessionData?.user?.id;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const avatarSrc = useMemo(() => {
    const url = user?.avatar?.url?.trim();
    return url;
  }, [user]);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    let isMounted = true;

    async function loadUser() {
      setIsUserLoading(true);
      try {
        // ✅ IMPORTANT: call NEXT proxy route (same-origin)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/users/users/${userId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch user (HTTP ${res.status})`);
        }

        const json = (await res.json()) as UserResponse;

        if (!json?.success || !json?.data) {
          throw new Error(json?.message || "Invalid user response");
        }

        if (isMounted) setUser(json.data);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch user"
        );
      } finally {
        if (isMounted) setIsUserLoading(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [status, userId]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/auth/login" });
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-[#F9F7F9] flex flex-col p-6 transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-40 h-20">
            <Image
              src="/logo.png"
              alt="BBPOOL"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="bg-white rounded-[32px] p-4 shadow-sm flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive
                        ? "bg-[#F0F2FF] text-[#8E97FD]"
                        : "text-[#4A4A4A] hover:bg-gray-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon
                      size={22}
                      className={isActive ? "text-[#8E97FD]" : "text-[#A1A1A1]"}
                    />
                    <span className="text-[15px] font-semibold">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + Logout */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 bg-[#EEF0FF] py-2 px-4 rounded-full justify-center">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary overflow-hidden relative flex items-center justify-center shrink-0">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="User"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
              ) : (
                <span className="text-white font-bold text-xs select-none">
                  {(user?.name ?? sessionData?.user?.name ?? "A")[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <span className="text-[#4A4A4A] font-semibold text-sm">
              {isUserLoading
                ? "Loading..."
                : user?.name || sessionData?.user?.name || "Unknown"}
            </span>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-full border-2 border-[#FF7E7E] text-[#FF7E7E] hover:bg-[#FF7E7E] hover:text-white h-12 text-md font-bold transition-all"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
