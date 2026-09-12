import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

type Flow = "login" | "forgot" | "otp" | "reset";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, requestPasswordReset, resetPassword, isAuthenticated } =
    useStore();
  const [flow, setFlow] = useState<Flow>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await requestPasswordReset(email);
    if (result.success) {
      toast.success("Verification code sent to your email");
      setFlow("otp");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setFlow("reset");
    } else {
      toast.error("Please enter a valid 6-digit code");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      toast.success("Password reset successfully!");
      setFlow("login");
      setPassword("");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            to="/"
            className="font-playfair text-4xl font-bold text-amber-500 tracking-tighter"
          >
            ChronoLux
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-playfair font-bold text-white">
          {flow === "login" && "Sign in to your account"}
          {flow === "forgot" && "Forgot Password"}
          {flow === "otp" && "Verify Identity"}
          {flow === "reset" && "Create New Password"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-gray-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-800">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {flow === "login" && (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setFlow("forgot")}
                    className="font-medium text-amber-500 hover:text-amber-400"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-gray-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {flow === "forgot" && (
            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <p className="text-gray-400 text-sm text-center">
                Enter your email address and we'll send you a 6-digit code to
                reset your password.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFlow("login")}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-amber-500 text-gray-950 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Code"}
                </button>
              </div>
            </form>
          )}

          {flow === "otp" && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-4">
                  <KeyRound className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-white font-medium mb-1">Check your email</p>
                <p className="text-gray-400 text-sm">
                  We've sent a 6-digit code to{" "}
                  <span className="text-white">{email}</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="block w-full text-center tracking-[1em] text-2xl font-bold py-4 border border-gray-800 rounded-xl bg-gray-950 text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="000000"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFlow("forgot")}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-all"
                >
                  Change Email
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-amber-500 text-gray-950 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all"
                >
                  Verify Code
                </button>
              </div>
            </form>
          )}

          {flow === "reset" && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-gray-950 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-500">
                  New to ChronoLux?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-3 px-4 border border-gray-800 rounded-xl shadow-sm text-sm font-bold text-white bg-transparent hover:bg-gray-800 focus:outline-none transition-all"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
