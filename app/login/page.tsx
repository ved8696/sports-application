"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);

  function handleBlur(field: "email" | "password") {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(email, password));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setTouched({ email: true, password: true });
    if (Object.keys(nextErrors).length > 0) return;

    // No backend this sprint -- once the form is valid, route into the app.
    // The email is kept only for a genuine (not fabricated) dashboard
    // greeting; nothing is sent anywhere and nothing is persisted server-side.
    sessionStorage.setItem("willow_user_email", email.trim());
    setSubmitting(true);
    router.push("/dashboard");
  }

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-5"
      style={{ paddingTop: "calc(var(--safe-top) + 20px)", paddingBottom: "calc(var(--safe-bottom) + 20px)" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-9 flex items-center justify-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-wood to-walnut shadow-[0_0_24px_rgba(200,155,109,0.25)]">
            <div className="h-4 w-4 rounded-full bg-background" />
          </div>
          <span className="text-[22px] font-extrabold tracking-wide">WILLOW</span>
        </div>

        <h1 className="text-center text-[26px] font-extrabold">Welcome back</h1>
        <p className="mt-1.5 text-center text-[13.5px] text-muted">Sign in to your Cricket Operations Platform</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-muted">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@yourclub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              error={touched.email ? errors.email : undefined}
              aria-invalid={Boolean(touched.email && errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {touched.email && errors.email && (
              <p id="email-error" className="mt-1.5 text-xs text-red">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-muted">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              error={touched.password ? errors.password : undefined}
              aria-invalid={Boolean(touched.password && errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {touched.password && errors.password && (
              <p id="password-error" className="mt-1.5 text-xs text-red">
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="mt-2" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-2">
          <Sparkles size={13} />
          Premium AI-first Cricket Operating System
        </p>
      </div>
    </div>
  );
}
