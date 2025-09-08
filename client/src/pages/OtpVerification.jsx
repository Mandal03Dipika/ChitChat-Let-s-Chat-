import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2, MessageSquare, Shield } from "lucide-react";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/Register/AuthImagePattern";

function OtpVerification({ email }) {
  const [otp, setOtp] = useState("");
  const { verifyOtp, resendOtp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter OTP");
    setIsLoading(true);
    verifyOtp({ email, otp });
    setIsLoading(false);
  };

  const handleResendOtp = () => {
    resendOtp(email, (res) => {
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
              <h1 className="mt-2 text-2xl font-bold">Verify Your Email</h1>
              <p className="text-base-content/60">
                We’ve sent a 6-digit OTP to{" "}
                <span className="font-semibold">{email}</span>
              </p>
            </div>
          </div>
          <form onSubmit={handleVerify} className="space-y-6">
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
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin size-5" />
                  Loading...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                onClick={handleResendOtp}
                disabled={isLoading || resendTimer > 0}
              >
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : "Resend OTP"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <AuthImagePattern
        title={"Welcome!"}
        subtitle={
          "Enter the OTP sent to your email to get back to your conversations securely."
        }
      />
    </div>
  );
}

export default OtpVerification;
