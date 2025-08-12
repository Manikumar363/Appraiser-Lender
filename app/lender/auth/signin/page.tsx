"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import AuthLayout from "../../../../components/auth-layout"
import { RoleSelector } from "../../../../components/role-selector"
import { AuthInput } from "../../../../components/auth-input"
import { useRouter } from "next/navigation"
import { userAuth } from "@/lib/api/userAuth"
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { Mail } from "lucide-react";

export default function LenderSignInPage() {
  const [selectedRole, setSelectedRole] = useState<"appraiser" | "lender">("lender")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [previousEmails, setPreviousEmails] = useState<string[]>([]);

  useEffect(() => {
    const emails = JSON.parse(localStorage.getItem("previousEmails") || "[]");
    setPreviousEmails(emails);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({});

    // Validate fields
    const errors: { [key: string]: string } = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password.trim()) errors.password = "Password is required"; 

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await userAuth.signIn(email, password);
      localStorage.setItem("authToken", res.token);

      // Save email to localStorage
      let emails = JSON.parse(localStorage.getItem("previousEmails") || "[]");
      if (!emails.includes(email)) {
        emails.push(email);
        localStorage.setItem("previousEmails", JSON.stringify(emails));
      }

      toast.success("Login successful");
      setTimeout(() => {
        router.push("/lender/dashboard");
      }, 1200);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Invalid credentials";
      setError(message);

      if (status === 401 || status === 403) {
        setPassword("");
        setTimeout(() => {
          passwordRef.current?.focus();
        }, 100);
        toast.error("Invalid email or password. Please try again.");
      } else if (status === 429) {
        toast.error("Too many attempts. Please wait a moment and try again.");
      } else if (status >= 500 && status <= 599) {
        toast.error("Server error. Please try again in a few minutes.");
      } else {
        toast.error(message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: "appraiser" | "lender") => {

    setSelectedRole(role)
    if (role === "appraiser") {
      const switchingToast = toast.loading("Switching to Appraiser Sign In...");
      setTimeout(() => {
        toast.dismiss(switchingToast);
        router.push("/appraiser/auth/signin");
      }, 1000);

    }
  }

  return (
    <AuthLayout>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "14px",
            maxWidth: "450px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />
      <div className="flex flex-col justify-center min-h-screen w-full items-center">
        <div className="w-full max-w-[765px]  px-6">
          <div className="mb-4 mt-0">
            <h1 className="text-3xl font-semibold text-gray-800">Sign In as</h1>
          </div>
          <div className="mb-6">
            <RoleSelector selectedRole={selectedRole} onRoleChange={handleRoleChange} />
          </div>
          <div className="mb-5">
           <h2
              className="text-[42px] font-semibold text-gray-800 leading-[100%] mb-1"
              style={{
              fontFamily: "Urbanist",
              fontWeight: 600,
              fontStyle: "normal",
              letterSpacing: "0%",
              }}
            >
              Welcome Back Lenders
            </h2>
            <p className="text-gray-500 text-sm">Log in to manage your jobs and updates.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative w-full">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <Mail size={20} className="text-gray-800" />
              </span>
              <input
                type="email"
                placeholder="Type your email here"
                value={email}
                onChange={e => setEmail(e.target.value)}

                name="email"
                autoComplete="email"
                autoFocus
                className="w-[765px] pl-14 pr-6 h-[56px] py-4 bg-white border border-neutral-600 rounded-full text-gray-700 placeholder-gray-700 focus:outline-none focus:border-[#2A020D] focus:ring-0 transition-all text-base shadow-sm"
              />
              <datalist id="emails">
                {previousEmails.map((eml) => (
                  <option value={eml} key={eml} />
                ))}
              </datalist>
            </div>
            {fieldErrors.email && (
              <p className="text-red-600 text-sm">{fieldErrors.email}</p>
            )}

            <div className="relative w-[765px]">
              <AuthInput
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="Type your password here"
                value={password}
                onChange={setPassword}
                icon="password"
                name="password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {fieldErrors.password && (
              <p className="text-red-600 text-sm">{fieldErrors.password}</p>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Align Forgot Password to end of input fields */}
            <div className=" w-[765px] mx-auto flex justify-end -mt-2">
              <Link
                href="/lender/auth/forgot-password"
                className="text-[#333333] font-semibold text-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-[765px] bg-[#2A020D] text-white py-4 rounded-full font-medium hover:bg-[#154c8c] transition-colors text-lg shadow-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Center Create One below the button */}
          <div className="w-[765px] mx-auto flex justify-center mt-8 text-medium">
            <span className="text-gray-600">{"Don't Have An Account ? "}</span>
            <Link href="/lender/auth/signup" className="text-[#333333] font-semibold ml-1">
              Create One
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}