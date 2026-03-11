import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, go to dashboard
  if (profile) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
    // On success: the App-level useAuth listener picks up the auth change,
    // loads the profile, then this component re-renders with profile set
    // and the check above redirects to /dashboard
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-1">NyumbaIQ</h1>
        <p className="text-xs text-gray mb-4">Danco Analytics</p>
        <form className="space-y-3" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
          </div>
          {error && <p className="text-red text-sm">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="flex justify-between text-sm text-gray mt-4">
          <button className="text-blue font-medium" onClick={() => navigate('/forgot-password')}>
            Forgot password?
          </button>
          <button className="text-blue font-medium" onClick={() => navigate('/register')}>
            Create account
          </button>
        </div>
        <p className="text-xs text-gray text-center mt-6">&copy; 2026 Danco Analytics &middot; NyumbaIQ &middot; Nairobi, Kenya</p>
      </div>
    </div>
  );
}
