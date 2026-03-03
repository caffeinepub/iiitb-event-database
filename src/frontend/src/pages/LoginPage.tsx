import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setSession } from "@/store/eventStore";
import { Eye, EyeOff, ShieldCheck, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "IIITB@1802";
const USER_PASSWORD = "IIITB@1998";

interface LoginPageProps {
  onLogin: (role: "admin" | "user") => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [adminPassword, setAdminPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [showUserPw, setShowUserPw] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [userError, setUserError] = useState("");

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setSession("admin");
      toast.success("Welcome, Administrator");
      onLogin("admin");
    } else {
      setAdminError("Invalid password. Please try again.");
    }
  }

  function handleUserLogin(e: React.FormEvent) {
    e.preventDefault();
    if (userPassword === USER_PASSWORD) {
      setSession("user");
      toast.success("Welcome to IIITB Event Database");
      onLogin("user");
    } else {
      setUserError("Invalid password. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary opacity-5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent opacity-5" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-primary tracking-tight">
            IIIT Bangalore
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">
            Event Management System
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Secure Access
            </span>
            <div className="h-px w-12 bg-border" />
          </div>
        </div>

        {/* Login card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden">
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border bg-secondary/50 h-12 p-0">
              <TabsTrigger
                value="user"
                className="flex-1 h-full rounded-none data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:shadow-none gap-2 font-body text-sm"
                data-ocid="login.user.tab"
              >
                <Users className="w-4 h-4" />
                User Login
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="flex-1 h-full rounded-none data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none gap-2 font-body text-sm"
                data-ocid="login.admin.tab"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Login
              </TabsTrigger>
            </TabsList>

            {/* User Login */}
            <TabsContent value="user" className="p-6 mt-0">
              <form onSubmit={handleUserLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground font-body">
                        Staff / Faculty Portal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        View and access IIITB events
                      </p>
                    </div>
                  </div>
                  <Label htmlFor="user-password" className="text-sm font-body">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="user-password"
                      type={showUserPw ? "text" : "password"}
                      value={userPassword}
                      onChange={(e) => {
                        setUserPassword(e.target.value);
                        setUserError("");
                      }}
                      placeholder="Enter your password"
                      className="pr-10 font-mono"
                      data-ocid="login.user.input"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showUserPw ? "Hide password" : "Show password"
                      }
                    >
                      {showUserPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {userError && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="login.user.error_state"
                    >
                      {userError}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 font-body font-semibold"
                  data-ocid="login.user.submit_button"
                >
                  Sign In as User
                </Button>
              </form>
            </TabsContent>

            {/* Admin Login */}
            <TabsContent value="admin" className="p-6 mt-0">
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground font-body">
                        Administrator Portal
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Manage events, view analytics
                      </p>
                    </div>
                  </div>
                  <Label htmlFor="admin-password" className="text-sm font-body">
                    Admin Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showAdminPw ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setAdminError("");
                      }}
                      placeholder="Enter admin password"
                      className="pr-10 font-mono"
                      data-ocid="login.admin.input"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showAdminPw ? "Hide password" : "Show password"
                      }
                    >
                      {showAdminPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {adminError && (
                    <p
                      className="text-destructive text-xs mt-1"
                      data-ocid="login.admin.error_state"
                    >
                      {adminError}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 font-body font-semibold bg-primary hover:bg-primary/90"
                  data-ocid="login.admin.submit_button"
                >
                  Sign In as Administrator
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © <span className="font-semibold">IIIT Bangalore</span>. All rights
          reserved.
        </p>
      </motion.div>
    </div>
  );
}
