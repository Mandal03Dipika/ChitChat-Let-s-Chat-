import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import AuthImagePattern from "../components/Register/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return toast.error("Invalid Email Format");
    }
    if (!formData.password) {
      return toast.error("Password is required");
    }
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const success = validateForm();
    if (success) {
      login(formData);
    }
  };

  return (
    <>
      <div className="grid h-screen lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="mb-8 text-center">
              <div className="flex flex-col items-center gap-2 group">
                <div className="flex items-center justify-center w-12 h-12 transition-colors rounded-xl bg-primary/10 group-hover:bg-primary/20">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h1 className="mt-2 text-2xl font-bold">Welcome Back</h1>
                <p className="text-base-content/60">Sign in to your account</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full pl-10 input input-bordered"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="font-medium label-text">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 input input-bordered"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
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
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
            <div className="text-center">
              <p className="text-base-content/60">
                Don&apos;t have an account?
                <Link to="/register" className="link link-primary">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
        <AuthImagePattern
          title={"Welcome back!"}
          subtitle={
            "Sign in to continue your conversations and catch up with your messages."
          }
        />
      </div>
    </>
  );
}

export default Login;
