import { UserPlus, Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailDebounced, setEmailDebounced] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setEmailDebounced(formData.email), 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const { data: availability, isFetching: isCheckingEmail } = trpc.auth.checkEmailAvailability.useQuery(
    { email: emailDebounced },
    { enabled: emailDebounced.length > 5 && emailDebounced.includes("@") }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } as any }
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: "", color: "bg-transparent", width: "0%" };
    if (pass.length < 6) return { label: "Weak", color: "bg-red-500", width: "33%" };
    const hasNumbers = /\d/.test(pass);
    const hasChars = /[a-zA-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    if (hasNumbers && hasChars && hasSpecial && pass.length >= 10) 
      return { label: "Strong", color: "bg-green-500", width: "100%" };
    if ((hasNumbers && hasChars) || pass.length >= 8) 
      return { label: "Medium", color: "bg-[#E8A020]", width: "66%" };
    return { label: "Weak", color: "bg-red-500", width: "33%" };
  };

  const strength = getPasswordStrength(formData.password);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: data => {
      toast.success("Account created!", { description: data.message });
      setLocation(`/verify?email=${encodeURIComponent(formData.email)}`);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please ensure both password fields contain the same value."
      });
      return;
    }

    if (!agreedToTerms) {
      toast.error("Terms of Service", {
        description: "You must agree to the Terms of Service and Privacy Policy to create an account."
      });
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />

      <main className="container pt-44 lg:pt-52 pb-16 flex items-center justify-center">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md bg-[#1C1C1A] border border-[#2A2A28] p-8 rounded-sm overflow-hidden relative"
        >
          {/* Top progress bar simulation for tech vibe */}
          <div className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8A020] to-transparent w-full animate-pulse" />
          
            <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="font-display text-3xl text-[#F2F0EB] mb-2 tracking-widest uppercase">
              CREATE ACCOUNT
            </h1>
            <p className="font-ui text-[10px] text-[#8A8880] tracking-tighter">
              Create your profile on bishouy.com
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                  size={16}
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-4 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                  size={16}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }
                  className={`w-full bg-[#0F0F0E] border ${availability?.available === false ? 'border-red-500' : 'border-[#222220]'} rounded-sm py-2 pl-10 pr-10 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-all`}
                  placeholder="name@example.com"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isCheckingEmail ? (
                        <Loader2 className="animate-spin text-[#555550]" size={14} />
                    ) : availability && formData.email.includes('@') ? (
                        availability.available ? (
                            <CheckCircle className="text-green-500" size={14} />
                        ) : (
                            <XCircle className="text-red-500" size={14} />
                        )
                    ) : null}
                </div>
              </div>
              <AnimatePresence>
                {availability?.available === false && (
                    <motion.p 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-[9px] text-red-500 font-600 uppercase tracking-tighter"
                    >
                        Email already registered.
                    </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="space-y-2">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                    size={16}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-10 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555550] hover:text-[#E8A020] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter font-bold">
                        <span className="text-[#555550]">Strength:</span>
                        <span style={{ color: strength.color.replace('bg-', '') }} className="opacity-80">{strength.label}</span>
                    </div>
                    <div className="h-0.5 w-full bg-[#222220] rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${strength.color} transition-all duration-500`} 
                            style={{ width: strength.width }}
                        />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                    size={16}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="w-full bg-[#0F0F0E] border border-[#222220] rounded-sm py-2 pl-10 pr-10 text-[#F2F0EB] font-ui text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                    placeholder="Repeat your password"
                    required
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-3 py-2">
                <input 
                    type="checkbox"
                    id="tos"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 accent-[#E8A020] bg-[#0F0F0E] border-[#222220]"
                />
                <label htmlFor="tos" className="text-[10px] text-[#8A8880] font-ui leading-tight tracking-tighter">
                    I agree to the <Link href="/terms-of-service" className="text-[#E8A020] hover:underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-[#E8A020] hover:underline">Privacy Policy</Link>.
                </label>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={registerMutation.isPending || availability?.available === false}
              className="w-full bg-[#F2F0EB] hover:bg-[#E8A020] hover:text-[#0F0F0E] disabled:opacity-50 text-[#0F0F0E] font-ui text-[10px] font-600 uppercase tracking-widest py-3 rounded-sm flex items-center justify-center gap-2 transition-all duration-300"
            >
              {registerMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <UserPlus size={16} />
              )}
              Register
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="mt-8 text-center font-ui text-[10px] tracking-widest text-[#555550]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#E8A020] hover:underline font-600"
            >
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
