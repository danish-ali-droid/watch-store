import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Truck,
  Mail,
  Phone,
  MapPin,
  User,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

const formatPKR = (n: number) => "₨ " + n.toLocaleString("en-PK");

type Step = "details" | "payment" | "otp" | "success";

export default function CheckoutPage() {
  const { cart, currentUser, placeOrder, verifyOrderOtp } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Card">("COD");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    email: currentUser?.email || "",
    address: currentUser?.address || "",
    city: currentUser?.city || "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
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

  const subtotal = cart.reduce((s, i) => s + i.watch.price * i.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 500;
  const total = subtotal + shipping;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.phone.match(/^(\+92|0)[0-9]{10}$/))
      e.phone = "Valid Pakistani phone required (e.g. 03001234567)";
    if (!form.address.trim()) e.address = "Address required";
    if (!form.city.trim()) e.city = "City required";
    if (paymentMethod === "Card") {
      if (!form.cardNumber.replace(/\s/g, "").match(/^\d{16}$/))
        e.cardNumber = "Valid 16-digit card number required";
      if (!form.expiry.match(/^\d{2}\/\d{2}$/))
        e.expiry = "Valid expiry (MM/YY) required";
      if (!form.cvv.match(/^\d{3,4}$/)) e.cvv = "Valid CVV required";
      if (!form.cardName.trim()) e.cardName = "Cardholder name required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [placingOrder, setPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (placingOrder) return;
    setPlacingOrder(true);
    const result = await placeOrder({
      total,
      paymentMethod,
      shippingAddress: `${form.address}, ${form.city}`,
      phone: form.phone,
    });
    setPlacingOrder(false);
    if (result.success) {
      setStep("otp");
      setTimer(120);
      setCanResend(false);
      toast.success("Order OTP sent!");
    } else {
      toast.error(result.message);
    }
  };

  const handleResend = async () => {
    const result = await placeOrder({
      total,
      paymentMethod,
      shippingAddress: `${form.address}, ${form.city}`,
      phone: form.phone,
    });
    if (result.success) {
      setTimer(120);
      setCanResend(false);
      toast.success("OTP Resent!");
    } else {
      toast.error(result.message);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleVerifyOtp = async () => {
    if (enteredOtp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }
    if (timer === 0) {
      toast.error("OTP Expired. Please resend.");
      return;
    }
    if (submitting) return; // prevent double-submit
    setSubmitting(true);
    const result = await verifyOrderOtp(enteredOtp);
    setSubmitting(false);
    if (result.success) {
      setPlacedOrderId(result.orderId || "");
      setStep("success");
      toast.success("Order placed successfully!");
    } else {
      toast.error(result.message);
    }
  };

  if (step === "success")
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-green-500/30">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-white mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-400 mb-2">Your order has been confirmed</p>
          <p className="text-amber-400 font-mono font-bold text-lg mb-6">
            {placedOrderId}
          </p>
          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-gray-400 text-sm mb-1">
              Payment:{" "}
              <span className="text-white">
                {paymentMethod === "COD" ? "Cash on Delivery" : "Card"}
              </span>
            </p>
            <p className="text-gray-400 text-sm mb-1">
              Total:{" "}
              <span className="text-amber-400 font-bold">
                {formatPKR(total)}
              </span>
            </p>
            <p className="text-gray-400 text-sm">
              Delivery: <span className="text-white">3-5 working days</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 bg-amber-500 text-gray-950 py-3 rounded-xl font-semibold hover:bg-amber-400"
            >
              Track Order
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 border border-gray-700 text-white py-3 rounded-xl hover:bg-gray-800"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );

  if (step === "otp")
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-white text-center mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-400 text-center text-sm mb-2">
            An OTP has been sent to
          </p>
          <p className="text-amber-400 text-center font-medium mb-6">
            {currentUser?.email}
          </p>

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
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-gray-800 border border-gray-700 text-white text-center text-2xl font-mono tracking-widest rounded-xl px-4 py-4 outline-none focus:border-amber-500"
              placeholder="• • • • • •"
            />
          </div>

          <button
            onClick={handleVerifyOtp}
            className="w-full bg-amber-500 text-gray-950 py-3 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={timer === 0 || submitting}
          >
            {submitting ? "Placing Order…" : "Verify & Place Order"}
          </button>

          {canResend ? (
            <button
              onClick={handleResend}
              className="w-full flex items-center justify-center gap-2 text-amber-400 text-sm hover:text-amber-300 py-2 mt-2"
            >
              <RotateCcw className="w-4 h-4" /> Resend OTP
            </button>
          ) : (
            <p className="text-gray-600 text-center text-xs mt-3">
              Resend available after timer ends
            </p>
          )}

          <button
            onClick={() => setStep("payment")}
            className="w-full text-gray-400 text-sm mt-3 hover:text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-playfair text-3xl font-bold mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            ["details", "Shipping"],
            ["payment", "Payment"],
            ["otp", "Verify"],
          ].map(([s, label], i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`h-px w-8 ${["payment", "otp"].includes(step) && i <= ["details", "payment", "otp"].indexOf(step) ? "bg-amber-500" : "bg-gray-700"}`}
                />
              )}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${step === s ? "bg-amber-500 text-gray-950" : i < ["details", "payment", "otp"].indexOf(step) ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-400"}`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {i + 1}
                </span>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === "details" && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" /> Shipping Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: "name",
                      label: "Full Name",
                      placeholder: "Ahmed Khan",
                      type: "text",
                      icon: User,
                    },
                    {
                      key: "phone",
                      label: "Phone Number",
                      placeholder: "03001234567",
                      type: "tel",
                      icon: Phone,
                    },
                  ].map(({ key, label, placeholder, type, icon: Icon }) => (
                    <div key={key}>
                      <label className="text-gray-400 text-sm mb-1.5 block">
                        {label}
                      </label>
                      <div className="relative">
                        <Icon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={type}
                          value={form[key as keyof typeof form]}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, [key]: e.target.value }))
                          }
                          className={`w-full bg-gray-800 border ${errors[key] ? "border-red-500" : "border-gray-700"} text-white rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                          placeholder={placeholder}
                        />
                      </div>
                      {errors[key] && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-sm mb-1.5 block">
                      Street Address
                    </label>
                    <input
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      className={`w-full bg-gray-800 border ${errors.address ? "border-red-500" : "border-gray-700"} text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                      placeholder="House No., Street, Area"
                    />
                    {errors.address && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">
                      City
                    </label>
                    <select
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500"
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
                </div>
                <button
                  onClick={() => {
                    if (validate()) setStep("payment");
                  }}
                  className="w-full bg-amber-500 text-gray-950 py-3 rounded-xl font-semibold mt-6 hover:bg-amber-400"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" /> Payment
                  Method
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    {
                      val: "COD",
                      label: "Cash on Delivery",
                      desc: "Pay when you receive",
                      icon: Truck,
                    },
                    {
                      val: "Card",
                      label: "Debit/Credit Card",
                      desc: "Secure online payment",
                      icon: CreditCard,
                    },
                  ].map(({ val, label, desc, icon: Icon }) => (
                    <button
                      key={val}
                      onClick={() => setPaymentMethod(val as "COD" | "Card")}
                      className={`p-4 rounded-xl border text-left transition-colors ${paymentMethod === val ? "border-amber-500 bg-amber-500/10" : "border-gray-700 bg-gray-800 hover:border-gray-600"}`}
                    >
                      <Icon
                        className={`w-6 h-6 mb-2 ${paymentMethod === val ? "text-amber-400" : "text-gray-400"}`}
                      />
                      <p
                        className={`font-medium text-sm ${paymentMethod === val ? "text-white" : "text-gray-300"}`}
                      >
                        {label}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>

                {paymentMethod === "Card" && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">
                        Card Number
                      </label>
                      <input
                        value={form.cardNumber}
                        onChange={(e) => {
                          const v = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);
                          setForm((f) => ({
                            ...f,
                            cardNumber: v.replace(/(\d{4})/g, "$1 ").trim(),
                          }));
                        }}
                        className={`w-full bg-gray-800 border ${errors.cardNumber ? "border-red-500" : "border-gray-700"} text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500 font-mono`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">
                        Cardholder Name
                      </label>
                      <input
                        value={form.cardName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, cardName: e.target.value }))
                        }
                        className={`w-full bg-gray-800 border ${errors.cardName ? "border-red-500" : "border-gray-700"} text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                        placeholder="Ahmed Khan"
                      />
                      {errors.cardName && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.cardName}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm mb-1.5 block">
                          Expiry Date
                        </label>
                        <input
                          value={form.expiry}
                          onChange={(e) => {
                            let v = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            if (v.length >= 2)
                              v = v.slice(0, 2) + "/" + v.slice(2);
                            setForm((f) => ({ ...f, expiry: v }));
                          }}
                          className={`w-full bg-gray-800 border ${errors.expiry ? "border-red-500" : "border-gray-700"} text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {errors.expiry && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.expiry}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm mb-1.5 block">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={form.cvv}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              cvv: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4),
                            }))
                          }
                          className={`w-full bg-gray-800 border ${errors.cvv ? "border-red-500" : "border-gray-700"} text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-amber-500`}
                          placeholder="123"
                        />
                        {errors.cvv && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("details")}
                    className="flex-1 border border-gray-700 text-white py-3 rounded-xl hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="flex-1 bg-amber-500 text-gray-950 py-3 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {placingOrder ? "Sending OTP…" : "Send OTP & Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h3 className="text-white font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {cart.map(({ watch, quantity }) => (
                  <div key={watch.id} className="flex gap-3 items-center">
                    <img
                      src={watch.image}
                      alt={watch.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs line-clamp-1">
                        {watch.name}
                      </p>
                      <p className="text-gray-500 text-xs">×{quantity}</p>
                    </div>
                    <p className="text-amber-400 text-sm font-medium whitespace-nowrap">
                      {formatPKR(watch.price * quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-800 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span
                    className={shipping === 0 ? "text-green-400" : "text-white"}
                  >
                    {shipping === 0 ? "FREE" : formatPKR(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-800 pt-2 mt-2">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">{formatPKR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
