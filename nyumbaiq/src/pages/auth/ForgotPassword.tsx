import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="card w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
          <p className="text-sm text-gray mb-4">We sent a password reset link to {email}</p>
          <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
        <p className="text-sm text-gray mb-4">Enter your email to receive a reset link.</p>
        <form className="space-y-3" onSubmit={handleReset}>
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
          {error && <p className="text-red text-sm">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-sm text-gray mt-4 text-center">
          <button className="text-blue font-medium" onClick={() => navigate('/login')}>Back to Login</button>
        </p>
      </div>
    </div>
  );
}
