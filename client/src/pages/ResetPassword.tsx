import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Extract token from URL manually since wouter's useRoute might not grab query params directly
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      toast.error("Invalid or missing reset token.");
    }
  }, []);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: data => {
      setIsSuccess(true);
      toast.success(data.message);
      // Optional: Auto redirect after few seconds
      setTimeout(() => setLocation("/login"), 3000);
    },
    onError: error => {
      toast.error(
        error.message || "Failed to reset password. The link might be expired."
      );
    },
  });

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      toast.error("Missing reset token");
      return;
    }
    resetPasswordMutation.mutate({
      token,
      newPassword: values.password,
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-sans text-[#F2F0EB]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-headline text-red-500 mb-2">
              Invalid Link
            </h1>
            <p className="text-[#8A8880] mb-6">
              The password reset token is missing or invalid.
            </p>
            <Link href="/forgot-password">
              <button className="bg-[#E8A020] text-[#0F0F0E] px-6 py-2 rounded-sm font-ui text-xs font-600 uppercase tracking-widest">
                Request New Link
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-sans text-[#F2F0EB]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C1C1A] border border-[#2A2A28] rounded-sm p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-headline text-[#E8A020] mb-2">
              Create New Password
            </h1>
            <p className="text-sm text-[#8A8880]">
              Enter your new strong password below.
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="text-green-500" size={32} />
                </div>
              </div>
              <h2 className="text-xl font-medium text-[#F2F0EB] mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-[#8A8880] mb-8">
                Your password has been changed successfully. You will be
                redirected to the login page momentarily.
              </p>
              <Link href="/login">
                <button className="w-full bg-[#E8A020] hover:bg-[#F2F0EB] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-widest py-3 px-4 rounded-sm transition-colors">
                  Login Now
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-ui uppercase font-600 text-[#8A8880] tracking-widest">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                    size={16}
                  />
                  <input
                    type="password"
                    {...form.register("password")}
                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-ui uppercase font-600 text-[#8A8880] tracking-widest">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555550]"
                    size={16}
                  />
                  <input
                    type="password"
                    {...form.register("confirmPassword")}
                    className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  />
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-[#E8A020] hover:bg-[#F2F0EB] text-[#0F0F0E] font-ui text-xs font-600 uppercase tracking-widest py-3 px-4 rounded-sm transition-colors flex justify-center items-center"
              >
                {resetPasswordMutation.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
