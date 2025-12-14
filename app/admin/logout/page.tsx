"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutPage() {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">Logging out...</div>
  );
}
