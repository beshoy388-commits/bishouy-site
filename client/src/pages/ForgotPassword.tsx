import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: data => {
      setIsSuccess(true);
      toast.success(data.message);
    },
    onError: error => {
      toast.error(error.message || "Failed to process request");
    },
  });

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    forgotPasswordMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0E] flex flex-col font-sans text-[#F2F0EB]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C1C1A] border border-[#2A2A28] rounded-sm p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-headline text-[#E8A020] mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-[#8A8880]">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Mail className="text-green-500" size={32} />
                </div>
              </div>
              <h2 className="text-xl font-medium text-[#F2F0EB] mb-2">
                Check your email
              </h2>
              <p className="text-[#8A8880] mb-8">
                If an account exists for that email, we have sent password reset
                instructions.
              </p>
              <Link href="/login">
                <button className="w-full bg-[#2A2A28] hover:bg-[#333330] text-[#E8A020] font-ui text-xs font-semibold uppercase tracking-widest py-3 px-4 rounded-sm transition-colors border border-[#E8A020]/20">
                  Return to Login
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-ui uppercase font-semibold text-[#8A8880] tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  {...form.register("email")}
                  className="w-full bg-[#0F0F0E] border border-[#2A2A28] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-[#E8A020] transition-colors"
                  placeholder="name@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-sm p-4 flex items-start gap-3">
                <ShieldAlert
                  className="text-[#E8A020] flex-shrink-0 mt-0.5"
                  size={16}
                />
                <p className="text-xs text-[#8A8880] leading-relaxed">
                  For security reasons, you can only request a password reset a
                  limited number of times per hour. The reset link will expire
                  in 30 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full bg-[#E8A020] hover:bg-[#F2F0EB] text-[#0F0F0E] font-ui text-xs font-semibold uppercase tracking-widest py-3 px-4 rounded-sm transition-colors flex justify-center items-center"
              >
                {forgotPasswordMutation.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center pt-4 border-t border-[#2A2A28]">
                <Link href="/login">
                  <span className="text-sm text-[#8A8880] hover:text-[#E8A020] cursor-pointer flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft size={16} />
                    Back to login
                  </span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
