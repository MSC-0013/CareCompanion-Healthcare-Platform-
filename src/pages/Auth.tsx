import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

/**
 * AuthPage - Production-ready, AWS-style animated gradient, polished UI
 * Requirements: TailwindCSS, framer-motion, lucide-react, sonner
 * Replace or wire-up useAuth for real backend auth.
 */

// Verified static Unsplash image (high-quality healthcare hero)
const HERO_IMAGE = 'https://plus.unsplash.com/premium_photo-1698421947098-d68176a8f5b2?q=80&w=752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading, clearError } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Block back navigation
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handler = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handler);

    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Redirect if already logged in
  const { user } = useAuth();
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError?.();
    if (!loginForm.email || !loginForm.password) return toast.error('Please fill in all fields');

    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError?.();
    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) return toast.error('Please fill in all fields');
    if (signupForm.password !== signupForm.confirmPassword) return toast.error('Passwords do not match');
    if (signupForm.password.length < 6) return toast.error('Password must be at least 6 characters');

    try {
      await register(signupForm.name, signupForm.email, signupForm.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">

      {/* Inline critical CSS for animations (or move to global CSS) */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Animated gradient similar to AWS hero */
        @keyframes hueShift { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(30deg);} 100% { filter: hue-rotate(0deg);} }
        .animate-hue { animation: hueShift 14s ease-in-out infinite; }

        /* soft floating orbs */
        @keyframes floaty { 0% { transform: translateY(0px) } 50% { transform: translateY(-14px) } 100% { transform: translateY(0px) } }
        .float-slow { animation: floaty 8s ease-in-out infinite; }

        /* card tilt on hover */
        .tilt { transition: transform 300ms ease, box-shadow 300ms ease; transform-origin: center; }
        .tilt:hover { transform: perspective(800px) rotateX(4deg) rotateY(-6deg) translateY(-6px); box-shadow: 0 30px 60px rgba(15,23,42,0.45); }

        /* glass border */
        .glass { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(8px); }

        /* responsive hero image height */
        @media (max-width: 768px) { .hero-h { height: 220px; } }
      ` }} />

      {/* Gradient background with subtle motion */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-[#0ea5e9] to-[#7c3aed] opacity-60 blur-3xl animate-hue float-slow" />
        <div className="absolute right-[-8%] bottom-[-6%] w-[48%] h-[48%] rounded-full bg-gradient-to-br from-[#06b6d4] to-[#8b5cf6] opacity-50 blur-3xl animate-hue" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#030712]/80 via-[#061126]/50 to-[#07112a]/90" />
      </motion.div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 p-6 items-center">

        {/* Left panel: Hero image + headline (desktop only) */}
        <motion.section initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="hidden md:flex flex-col gap-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img src={HERO_IMAGE} alt="Healthcare professionals" className="w-full h-[520px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-4xl font-semibold">Care Companion</h3>
              <p className="mt-2 max-w-sm text-lg text-white/80">AI-assisted health management — secure records, reminders, and telehealth-ready workflows for modern clinics and patients.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-4 bg-white/6 rounded-xl glass w-1/2">
              <h4 className="text-xl font-medium">HIPAA-ready</h4>
              <p className="text-sm text-white/70 mt-1">Encryption and role-based access control.</p>
            </div>
            <div className="p-4 bg-white/6 rounded-xl glass w-1/2">
              <h4 className="text-xl font-medium">Clinician-friendly</h4>
              <p className="text-sm text-white/70 mt-1">Fast charting, secure messaging, and analytics.</p>
            </div>
          </div>
        </motion.section>

        {/* Right panel: Auth card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="p-6 md:p-10 rounded-3xl glass tilt">

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 justify-center mb-2">
              <div className="p-2 rounded-full bg-white/6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Care Companion</h1>
            </div>
            <p className="text-white/80">Private health management for patients and providers</p>
          </div>

          <Card className="bg-white/4 border border-white/8 shadow-md">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Get started</CardTitle>
              <CardDescription className="text-white/70">Create an account or sign in</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('login')} className={`px-4 py-2 rounded-md ${activeTab === 'login' ? 'bg-white text-black' : 'bg-white/6 text-white'}`}>Login</button>
                  <button onClick={() => setActiveTab('signup')} className={`px-4 py-2 rounded-md ${activeTab === 'signup' ? 'bg-white text-black' : 'bg-white/6 text-white'}`}>Sign up</button>
                </div>

                <div className="text-sm text-white/60">or continue with</div>
              </div>

              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4" aria-label="login form">
                  <div>
                    <Label htmlFor="login-email" className="text-white">Email</Label>
                    <Input id="login-email" type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required className="bg-black/20 text-white placeholder-white/60 border-white/10" />
                  </div>

                  <div>
                    <Label htmlFor="login-password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required className="bg-black/20 text-white placeholder-white/60 border-white/10 pr-10" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 text-white" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-white text-black hover:opacity-95" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4" aria-label="signup form">
                  <div>
                    <Label htmlFor="signup-name" className="text-white">Full name</Label>
                    <Input id="signup-name" type="text" placeholder="John Doe" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} required className="bg-black/20 text-white placeholder-white/60 border-white/10" />
                  </div>

                  <div>
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required className="bg-black/20 text-white placeholder-white/60 border-white/10" />
                  </div>

                  <div>
                    <Label htmlFor="signup-password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required className="bg-black/20 text-white placeholder-white/60 border-white/10 pr-10" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 text-white" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm" className="text-white">Confirm password</Label>
                    <div className="relative">
                      <Input id="signup-confirm" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} required className="bg-black/20 text-white placeholder-white/60 border-white/10 pr-10" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 text-white" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff /> : <Eye />}</Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-white text-black hover:opacity-95" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create account'}</Button>
                </form>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                <a href="#" className="underline">Privacy</a>
                <a href="#" className="underline">Terms</a>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-white/70">Need help? <a href="#" className="underline">Contact support</a></div>
        </motion.div>

      </div>
    </div>
  );
};

export default Auth;
