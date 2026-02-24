/**
 * AdminLogin: login for Admin and Club Admin.
 * User chooses "Admin" or "Club Admin" then signs in with email/password.
 * Access in the panel is determined by user_roles in Supabase.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RIG from "@/assets/RIG.png";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type LoginType = "admin" | "club_admin";

const AdminLogin = () => {
  const [loginType, setLoginType] = useState<LoginType>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate("/admin-panel");
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg border border-border">
            <div className="flex flex-col items-center mb-8">
              <img
                src={RIG}
                alt="Rangsit University Logo"
                className="w-24 h-24 mb-4"
              />
              <h2 className="text-3xl font-bold text-foreground">Admin Login</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Choose your login type and sign in
              </p>
            </div>

            {/* Admin vs Club Admin choice */}
            <div className="flex rounded-lg border border-border p-1 mb-6 bg-muted/50">
              <button
                type="button"
                onClick={() => setLoginType("admin")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors",
                  loginType === "admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setLoginType("club_admin")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors",
                  loginType === "club_admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="h-4 w-4" />
                Club Admin
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full shadow-md">
                {loginType === "admin" ? "Admin Login" : "Club Admin Login"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLogin;
