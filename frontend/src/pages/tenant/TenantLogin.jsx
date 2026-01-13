import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from '../../hooks/useAuth';
import HomeButton from "@/components/ui/HomeButton";

const TenantLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginTenant } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginTenant(email, password); //  this will update user state
      navigate("/tenant/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]">
      <HomeButton />
      <div className="w-full max-w-md bg-[#020617]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
        
        <h2 className="text-2xl font-bold text-white mb-1">
          Tenant Login
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Sign in to your tenant account
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="tenant@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TenantLogin;
