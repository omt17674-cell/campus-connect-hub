import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '@/lib/auth-service';
import { CampusAccount } from '@/lib/campus-store';

interface SimpleAuthPageProps {
  onLoginSuccess?: (account: CampusAccount) => void;
}

export function SimpleAuthPage({ onLoginSuccess }: SimpleAuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await authService.loginWithEmail(email, password);

      if (!result.success) {
        setError(result.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (!result.data?.user) {
        setError('Invalid response from auth server');
        setLoading(false);
        return;
      }

      setSuccess('Login successful! Redirecting...');

      // Convert auth user to CampusAccount format
      const account: CampusAccount = {
        role: result.data.user.role,
        roleTitle: result.data.user.role === 'admin' ? 'Dean' : result.data.user.role === 'organizer' ? 'Placement Coordinator' : 'Student',
        roleBadge: result.data.user.role.toUpperCase(),
        name: result.data.user.name,
        idOrRoll: result.data.user.id,
        email: result.data.user.email,
        password: '', // Password not stored
        profile: {
          id: result.data.user.id,
          name: result.data.user.name,
          rollNo: result.data.user.id,
          email: result.data.user.email,
          role: result.data.user.role,
          department: 'GSFC University',
          school: 'GSFC University',
          degree: '',
          semester: 0,
          residenceType: 'dayscholar',
          attendanceRate: 100,
          points: 100,
          streakDays: 1,
          volunteerHours: 0,
          badges: [],
          avatar: result.data.user.name.slice(0, 2).toUpperCase(),
          isVerified: true,
        },
      };

      setTimeout(() => {
        onLoginSuccess?.(account);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.initiateGoogleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <LogIn className="w-6 h-6 text-slate-900" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Campus Connect Hub</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 backdrop-blur-sm">
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin.dean@gsfcuniversity.ac.in"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mb-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-blue-300">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: admin.dean@gsfcuniversity.ac.in / 9558413347@Om</p>
            <p>TPC: tpc.admin@gsfcuniversity.ac.in / 7043313347@Om</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Google OAuth */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fill="currentColor">
              G
            </text>
          </svg>
          Continue with Google
        </Button>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Auth Server: {import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:5001'}
        </p>
      </div>
    </div>
  );
}
