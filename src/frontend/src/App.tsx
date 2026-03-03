import { Toaster } from "@/components/ui/sonner";
import AdminDashboard from "@/pages/AdminDashboard";
import LoginPage from "@/pages/LoginPage";
import UserDashboard from "@/pages/UserDashboard";
import { clearSession, getSession } from "@/store/eventStore";
import { useEffect, useState } from "react";

type Page = "login" | "admin" | "user";

export default function App() {
  const [page, setPage] = useState<Page>("login");

  useEffect(() => {
    const session = getSession();
    if (session?.role === "admin") {
      setPage("admin");
    } else if (session?.role === "user") {
      setPage("user");
    } else {
      setPage("login");
    }
  }, []);

  function handleLogin(role: "admin" | "user") {
    setPage(role);
  }

  function handleLogout() {
    clearSession();
    setPage("login");
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      {page === "login" && <LoginPage onLogin={handleLogin} />}
      {page === "admin" && <AdminDashboard onLogout={handleLogout} />}
      {page === "user" && <UserDashboard onLogout={handleLogout} />}
    </>
  );
}
