import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Mail,
  Lock,
  Loader2,
  MessageSquare,
  Shield,
  EyeOff,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/Register/AuthImagePattern";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendOtp,
  } = useAuthStore();
  const [step, setStep] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) return toast.error("Email required");
    setLoading(true);
    forgotPassword(formData.email, (res) => {
      setLoading(false);
      if (res.success) setStep("otp");
    });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("OTP required");
    setLoading(true);
    verifyResetOtp({ email: formData.email, otp: formData.otp }, (res) => {
      setLoading(false);
      if (res.success) setStep("reset");
    });
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!formData.newPassword) return toast.error("New password required");
    if (formData.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    resetPassword(
      { email: formData.email, newPassword: formData.newPassword },
      (res) => {
        setLoading(false);
        if (res.success) {
          toast.success("Password reset successfully");
          setFormData({
            email: "",
            otp: "",
            newPassword: "",
            confirmPassword: "",
          });
          navigate("/login");
        }
      }
    );
  };

  const handleResendOtp = () => {
    if (!formData.email) return toast.error("Email missing");
    setLoading(true);
    resendOtp(formData.email, (res) => {
      setLoading(false);
      if (res.success) {
        toast.success("OTP resent successfully");
        setResendTimer(60);
      }
    });
  };

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  return (
    <div className="grid h-screen lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="mb-8 text-center">
            <div className="flex flex-col items-center gap-2 group">
              <div className="flex items-center justify-center w-12 h-12 transition-colors rounded-xl bg-primary/10 group-hover:bg-primary/20">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="mt-2 text-2xl font-bold">Forgot Password</h1>
              <p className="text-base-content/60">
                {step === "email"
                  ? "Enter email to receive the otp"
                  : step === "otp"
                  ? "Check you email for the OTP"
                  : "Enter and confirm your new password"}
              </p>
            </div>
          </div>
          {step === "email" && (
            <>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="font-medium label-text">Email</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="w-5 h-5 text-base-content/40" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 input input-bordered placeholder:text-base-content/40"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            </>
          )}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="font-medium label-text">OTP</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Shield className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="w-full pl-10 input input-bordered placeholder:text-base-content/40"
                    maxLength="6"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({ ...formData, otp: e.target.value })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Verify"
                )}
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                  onClick={handleResendOtp}
                  disabled={loading || resendTimer > 0}
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="font-medium label-text">New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 input input-bordered placeholder:text-base-content/40"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-base-content/40" />
                    ) : (
                      <Eye className="w-5 h-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="font-medium label-text">
                    Confirm Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 input input-bordered placeholder:text-base-content/40"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-base-content/40" />
                    ) : (
                      <Eye className="w-5 h-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
      <AuthImagePattern
        title={"Welcome!"}
        subtitle={
          "Don't worry, it happens! We'll help you reset your password and get back to your conversations."
        }
      />
    </div>
  );
}

export default ForgotPassword;
