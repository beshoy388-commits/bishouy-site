import { UserPlus, Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
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
    subscribeToNewsletter: false,
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
    if (pass.length === 0) return { label: "", color: "transparent", width: "0%" };
    if (pass.length < 8) return { label: "Weak", color: "#ef4444", width: "33%" };
    const hasNumbers = /\d/.test(pass);
    const hasChars = /[a-zA-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    if (hasNumbers && hasChars && hasSpecial && pass.length >= 10) 
      return { label: "Strong", color: "#22c55e", width: "100%" };
    if ((hasNumbers && hasChars) || pass.length >= 8) 
      return { label: "Medium", color: "#E8A020", width: "66%" };
    return { label: "Weak", color: "#ef4444", width: "33%" };
  };

  const strength = getPasswordStrength(formData.password);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: data => {
      toast.success("Account created!", { description: "Verification code sent via email." });
      setLocation(`/verify?email=${encodeURIComponent(formData.email)}`);
    },
    onError: error => {
      toast.error("Registration error: " + (error.message || "Please try again later."));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Make sure both password fields contain the same value."
      });
      return;
    }

    if (!agreedToTerms) {
      toast.error("Terms of Service", {
        description: "You must accept the Terms of Service and Privacy Policy to create an account."
      });
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      subscribeToNewsletter: formData.subscribeToNewsletter ? 1 : 0
    });
  };

  return (
    <div className="flex flex-col min-h-0">
      <SEO title="Create Account | BISHOUY" description="Join the global news collective of bishouy.com." />

      <main className="container pb-16 flex items-center justify-center">
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
              Create your editorial profile on bishouy.com
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block uppercase">
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
                  placeholder="Full Name"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block uppercase">
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
                        <Loader2 className="animate-pulse text-[#555550]" size={14} />
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
                <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block uppercase">
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
                    placeholder="Minimum 8 characters"
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
                        <span className="text-[#555550]">Security:</span>
                        <span style={{ color: strength.color }} className="opacity-80">{strength.label}</span>
                    </div>
                    <div className="h-0.5 w-full bg-[#222220] rounded-full overflow-hidden">
                        <div 
                            className="h-full transition-all duration-500" 
                            style={{ width: strength.width, backgroundColor: strength.color }}
                        />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-ui text-[10px] font-600 text-[#E8A020] tracking-widest block uppercase">
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
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-3 py-1">
                <input 
                    type="checkbox"
                    id="newsletter"
                    checked={formData.subscribeToNewsletter}
                    onChange={(e) => setFormData(prev => ({ ...prev, subscribeToNewsletter: e.target.checked }))}
                    className="mt-1 accent-[#E8A020] bg-[#0F0F0E] border-[#222220] rounded-sm"
                />
                <label htmlFor="newsletter" className="text-[10px] text-[#8A8880] font-ui leading-tight tracking-tighter">
                    I want to receive the daily editorial briefing and news alerts.
                </label>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-3 py-1">
                <input 
                    type="checkbox"
                    id="tos"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 accent-[#E8A020] bg-[#0F0F0E] border-[#222220] rounded-sm"
                />
                <label htmlFor="tos" className="text-[10px] text-[#8A8880] font-ui leading-tight tracking-tighter">
                    I accept the <Link href="/terms-of-service" className="text-[#E8A020] hover:underline">Terms of Service</Link> and the <Link href="/privacy-policy" className="text-[#E8A020] hover:underline">Privacy Policy</Link>.
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
                <Loader2 className="animate-pulse" size={16} />
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

    </div>
  );
}
