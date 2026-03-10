import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { setSession, setUser, setProfile, setActiveShop, setShops } = useAuthStore();
  const [email, setEmail] = useState("demo@dukaerp.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      setSession(data.session);
      setUser(data.user);

      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (profile) setProfile(profile);

      // Load shops
      const { data: shops } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", data.user.id);
      if (shops && shops.length > 0) {
        setShops(shops);
        setActiveShop(shops[0]);
      }

      toast.success("Welcome back!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <div className="card w-full max-w-md p-6 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">DukaERP</p>
          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500">Run your whole shop from your phone.</p>
        </div>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Continue"}
          </Button>
        </form>
        <p className="text-sm text-slate-500">
          No account? <Link className="text-brand-700 font-semibold" to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
