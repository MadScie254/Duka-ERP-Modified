import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', data.user.id);
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="card w-full max-w-md p-6 text-center">
          <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Account Created</h2>
          <p className="text-sm text-gray mb-4">Check your email to confirm your account, then sign in.</p>
          <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-1">Create Account</h1>
        <p className="text-sm text-gray mb-4">Join NyumbaIQ to manage your properties.</p>
        <form className="space-y-3" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Amina Ochieng"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
          </div>
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
            <label className="block text-sm font-medium mb-1">Phone (Kenyan)</label>
            <input
              type="tel"
              required
              placeholder="07XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
          </div>
          {error && <p className="text-red text-sm">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-gray mt-4 text-center">
          Already have an account?{' '}
          <button className="text-blue font-medium" onClick={() => navigate('/login')}>Sign in</button>
        </p>
      </div>
    </div>
  );
}
