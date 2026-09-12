import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Watch, CheckCircle, RotateCcw } from "lucide-react";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register, verifyRegisterOtp } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let interval: any;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Valid email required";
    if (!form.phone.match(/^(\+92|0|92)[0-9]{10}$/))
      e.phone = "Valid Pakistani phone required (e.g. 03001234567)";
    if (!form.city.trim()) e.city = "City required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form);
    if (result.success) {
      setStep("otp");
      setTimer(120);
      setCanResend(false);
      toast.success("Registration OTP sent!");
    } else {
      toast.error(result.message);
    }
  };

  const handleResend = async () => {
    const result = await register(form);
    if (result.success) {
      setTimer(600);
      setCanResend(false);
      toast.success("OTP Resent!");
    } else {
      toast.error(result.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    if (timer === 0) {
      toast.error("OTP Expired. Please resend.");
      return;
    }
    const result = await verifyRegisterOtp(otp);
    if (result.success) {
      toast.success("Registration successful!");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  if (step === "otp")
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="font-playfair text-2xl font-bold text-white mb-2">
              Verify Email
            </h2>
            <p className="text-gray-400 text-sm">OTP sent to</p>
            <p className="text-amber-400 font-medium">{form.email}</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label className="text-gray-400 text-xs">
                Enter 6-Digit Code
              </label>
              <span
                className={`text-xs font-mono ${timer < 60 ? "text-red-400" : "text-amber-400"}`}
              >
                Expires in: {formatTime(timer)}
              </span>
            </div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-gray-800 border border-gray-700 text-white text-center text-2xl font-mono tracking-widest rounded-xl px-4 py-4 outline-none focus:border-amber-500 mb-4"
              placeholder="• • • • • •"
            />
          </div>

          <button
            onClick={handleVerifyOtp}
            className="w-full bg-amber-500 text-gray-950 py-3 rounded-xl font-semibold hover:bg-amber-400 mb-3 disabled:opacity-50"
            disabled={timer === 0}
          >
            Verify & Create Account
          </button>

          {canResend ? (
            <button
              onClick={handleResend}
              className="w-full flex items-center justify-center gap-2 text-amber-400 text-sm hover:text-amber-300 py-2"
            >
              <RotateCcw className="w-4 h-4" /> Resend OTP
            </button>
          ) : (
            <p className="text-gray-600 text-center text-xs">
              Resend available after timer ends
            </p>
          )}

          <button
            onClick={() => setStep("form")}
            className="w-full text-gray-400 text-sm mt-4 hover:text-white"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="/assets/pexels-15261585.jpeg"
          className="w-full h-full object-cover"
          alt="Luxury Watches"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/60 to-transparent" />
        <div className="absolute bottom-12 left-12">
          <h2 className="font-playfair text-4xl font-bold text-white mb-3">
            Join ChronoLux
          </h2>
          <p className="text-gray-300 max-w-xs">
            Create your account to explore Pakistan's finest watch collection
            and enjoy exclusive member benefits.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gray-950">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-amber-500 rounded-full p-2">
              <Watch className="w-5 h-5 text-gray-950" />
            </div>
            <span className="font-bold text-xl text-white">
              Chrono<span className="text-amber-500">Lux</span>
            </span>
          </div>

          <h1 className="font-playfair text-3xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-400 hover:text-amber-300">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">
                  Full Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={`w-full bg-gray-800 border ${errors.name ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                  placeholder="Danish Ali"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">
                  Phone Number *
                </label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className={`w-full bg-gray-800 border ${errors.phone ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                  placeholder="03001234567"
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className={`w-full bg-gray-800 border ${errors.email ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                placeholder="danish@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">
                  City *
                </label>
                <select
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className={`w-full bg-gray-800 border ${errors.city ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                >
                  <option value="">Select City</option>
                  {[
                    "Karachi",
                    "Lahore",
                    "Islamabad",
                    "Rawalpindi",
                    "Faisalabad",
                    "Multan",
                    "Peshawar",
                    "Quetta",
                    "Sialkot",
                    "Gujranwala",
                    "Lodhran",
                    "Other",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500"
                  placeholder="Street, Area"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className={`w-full bg-gray-800 border ${errors.password ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-amber-500`}
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">
                Confirm Password *
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                className={`w-full bg-gray-800 border ${errors.confirmPassword ? "border-red-500" : "border-gray-700"} text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                placeholder="Repeat password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 text-gray-950 py-3 rounded-xl font-semibold hover:bg-amber-400 transition-colors mt-2"
            >
              Create Account & Get OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
