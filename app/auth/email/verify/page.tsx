'use client'
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import React, { useState } from "react";
type Message = { type: "success" | "error"; text: string };
type Props = {
  verificationEmail: string;
  //   message: Message  | null;
  verificationCode: string;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;
  handleVerification: () => Promise<void>;
  loading: boolean;
  resendVerification: () => Promise<void>;
};

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  status: number;
}
const page = () => {
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<Message | null>(null);
  const verificationEmail = "pepelajohn@gmail.com";

  const [verificationCode, setVerificationCode] = useState("");
  const handleVerification = async () => {
    setLoading(true);
    if (verificationCode.length !== 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit code" });
      return;
    }

    setMessage(null);

    try {
      const response = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Email verified successfully! You can now login.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Verification failed",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(true);
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/email/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Verification code sent!" });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to resend code",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 scale-100 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-slate-300">
            We sent a verification code to
            <br />
            <span className="font-semibold text-orange-400">
              {verificationEmail}
            </span>
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-2xl tracking-widest text-white placeholder-slate-400"
              maxLength={6}
            />
          </div>

          <button
            type="button"
            onClick={handleVerification}
            disabled={verificationCode.length !== 6}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Verify Email"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={resendVerification}
              disabled={loading}
              className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default page;
