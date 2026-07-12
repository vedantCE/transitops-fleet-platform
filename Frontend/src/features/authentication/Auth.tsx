import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, isAuthenticated } = useAuth()
  
  // Auth Mode: Sign In or Sign Up
  const [isSignUp, setIsSignUp] = useState(false)
  
  // Field States
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'FLEET_MANAGER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST'>('FLEET_MANAGER')
  const [showPassword, setShowPassword] = useState(false)

  // Validation states
  const [nameError, setNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [authError, setAuthError] = useState('')

  // Submission/loading states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Already logged in (e.g. token still valid on refresh) — skip the form.
  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setNameError(false)
    setEmailError(false)
    setPasswordError(false)
    setAuthError('')

    let hasError = false

    if (isSignUp && name.trim().length < 2) {
      setNameError(true)
      hasError = true
    }

    if (!email.includes('@')) {
      setEmailError(true)
      hasError = true
    }

    if (isSignUp) {
      if (password.length < 6) {
        setPasswordError(true)
        hasError = true
      }
    } else {
      if (password.length === 0) {
        setPasswordError(true)
        hasError = true
      }
    }

    if (hasError) return

    setIsSubmitting(true)

    try {
      if (isSignUp) {
        await register(name, email, password, role)
      } else {
        await login(email, password)
      }
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 600)
    } catch (err) {
      setAuthError(getApiErrorMessage(err, isSignUp ? 'Registration failed' : 'Invalid email or password'))
      setIsSubmitting(false)
    }
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row overflow-x-hidden w-full font-sans">
      {/* LEFT SECTION: Platform Information */}
      <section className="hidden md:flex md:w-1/2 lg:w-[45%] bg-background relative flex-col justify-center p-12 lg:p-16 text-white border-r border-white/5">
        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Branding */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                alt="TransitOps Logo"
                className="w-8 h-8 object-contain filter brightness-0 invert"
                src="https://lh3.googleusercontent.com/aida/AP1WRLvtl5lSS7yPs6g3mf9fcPEUyebTK0phLR84-tsaGwTJSSZt3kqiXGPL-Vz3lWsqieqDUZHyewmhyqYXDETRl1KQBdJRhXHwk-NyN6D-L_y7wN4WansBoQ13UfdzDXPCSUZ8zMZaXVsA2VyieG2UY4QVTeTHYitNAatnrJ-fYrrXMJuAMSqd4XJaE7qRaoPDndC6VZqDz0pOT90x8fc131Ik9ykXdwAW2vuw5V8Kzun0xjboTlJNETKMg"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-none tracking-tight">TransitOps</h1>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Global Command</p>
            </div>
          </div>
          
          {/* Roles Section */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Operations Ecosystem</p>
            <h2 className="text-2xl font-bold font-headline-md">Our Main Roles</h2>
            <div className="grid grid-cols-1 gap-y-1">
              <div className="group flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-white/5 -ml-4">
                <span className="material-symbols-outlined text-white/40 group-hover:text-white">dashboard</span>
                <div>
                  <p className="text-sm font-semibold text-white">Fleet Manager</p>
                  <p className="text-[12px] text-white/40">Strategic oversight of global vehicle assets.</p>
                </div>
              </div>
              <div className="group flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-white/5 -ml-4">
                <span className="material-symbols-outlined text-white/40 group-hover:text-white">route</span>
                <div>
                  <p className="text-sm font-semibold text-white">Dispatcher</p>
                  <p className="text-[12px] text-white/40">Real-time routing and driver communication.</p>
                </div>
              </div>
              <div className="group flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-white/5 -ml-4">
                <span className="material-symbols-outlined text-white/40 group-hover:text-white">verified_user</span>
                <div>
                  <p className="text-sm font-semibold text-white">Safety Officer</p>
                  <p className="text-[12px] text-white/40">Compliance monitoring and risk mitigation.</p>
                </div>
              </div>
              <div className="group flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-white/5 -ml-4">
                <span className="material-symbols-outlined text-white/40 group-hover:text-white">account_balance_wallet</span>
                <div>
                  <p className="text-sm font-semibold text-white">Financial Analyst</p>
                  <p className="text-[12px] text-white/40">Opex tracking and fuel analytics.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest">
            <span>© TransitOps • Admin</span>
            <div className="flex gap-4">
              <a className="hover:text-white transition-colors" href="#">Privacy</a>
              <a className="hover:text-white transition-colors" href="#">Terms</a>
            </div>
          </footer>
        </div>
      </section>

      {/* RIGHT SECTION: Auth Form */}
      <main className="w-full md:w-1/2 lg:w-[55%] flex flex-col justify-center items-center p-8 bg-dashboard-canvas md:rounded-l-[40px] z-20">
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="md:hidden mb-10 flex flex-col items-center">
          <img
            alt="TransitOps Logo"
            className="w-12 h-12 object-contain mb-3"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvtl5lSS7yPs6g3mf9fcPEUyebTK0phLR84-tsaGwTJSSZt3kqiXGPL-Vz3lWsqieqDUZHyewmhyqYXDETRl1KQBdJRhXHwk-NyN6D-L_y7wN4WansBoQ13UfdzDXPCSUZ8zMZaXVsA2VyieG2UY4QVTeTHYitNAatnrJ-fYrrXMJuAMSqd4XJaE7qRaoPDndC6VZqDz0pOT90x8fc131Ik9ykXdwAW2vuw5V8Kzun0xjboTlJNETKMg"
          />
          <h1 className="text-xl font-bold text-on-surface">TransitOps</h1>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface mb-1 font-headline-lg">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="text-sm text-on-surface-variant/70 font-body-md">
              {isSignUp ? 'Sign up to register a new user profile' : 'Enter your credentials to continue to the dashboard'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleAuthSubmit}>
            {/* Name Field (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="name">
                  Full Name
                </label>
                <input
                  className={`w-full px-4 py-3 bg-white/60 border ${
                    nameError ? 'border-error-red/50 ring-1 ring-error-red/50' : 'border-black/5'
                  } rounded-lg focus:ring-1 focus:ring-on-background/10 focus:border-on-background/20 outline-none transition-all text-sm text-on-surface placeholder-on-surface-variant/30`}
                  id="name"
                  placeholder="John Doe"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameError && (
                  <p className="text-error-red text-[11px] mt-1" id="nameError">
                    Name must be at least 2 characters.
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <input
                className={`w-full px-4 py-3 bg-white/60 border ${
                  emailError ? 'border-error-red/50 ring-1 ring-error-red/50' : 'border-black/5'
                } rounded-lg focus:ring-1 focus:ring-on-background/10 focus:border-on-background/20 outline-none transition-all text-sm text-on-surface placeholder-on-surface-variant/30`}
                id="email"
                placeholder="name@company.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <p className="text-error-red text-[11px] mt-1" id="emailError">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* Role Field (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Assigned Operational Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/60 border border-black/5 rounded-lg focus:ring-1 focus:ring-on-background/10 focus:border-on-background/20 outline-none transition-all text-sm text-on-surface cursor-pointer"
                >
                  <option value="FLEET_MANAGER">Fleet Manager</option>
                  <option value="DRIVER">Driver</option>
                  <option value="SAFETY_OFFICER">Safety Officer</option>
                  <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                </select>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  className={`w-full px-4 py-3 bg-white/60 border ${
                    passwordError ? 'border-error-red/50 ring-1 ring-error-red/50' : 'border-black/5'
                  } rounded-lg focus:ring-1 focus:ring-on-background/10 focus:border-on-background/20 outline-none transition-all text-sm text-on-surface pr-12 placeholder-on-surface-variant/30`}
                  id="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                  type="button"
                  onClick={togglePassword}
                >
                  <span className="material-symbols-outlined text-[20px]" id="passwordIcon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {passwordError && (
                <p className="text-error-red text-[11px] mt-1" id="passwordError">
                  {isSignUp ? 'Password must be at least 6 characters.' : 'Password is required.'}
                </p>
              )}
            </div>

            {authError && (
              <p className="text-error-red text-xs bg-error-red/10 border border-error-red/20 rounded-lg px-3 py-2" id="authError">
                {authError}
              </p>
            )}

            {/* Remember & Toggle Link */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-black/10 bg-white/60 checked:bg-on-background checked:border-on-background transition-all"
                    type="checkbox"
                  />
                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[12px] font-bold">
                    check
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              
              <button
                type="button"
                className="text-xs font-semibold text-on-background hover:underline cursor-pointer"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setAuthError('')
                  setNameError(false)
                  setEmailError(false)
                  setPasswordError(false)
                }}
              >
                {isSignUp ? 'Back to Sign In' : 'Create an Account'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              className={`w-full text-white text-sm font-semibold py-3.5 rounded-lg active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-sm mt-2 ${
                isSuccess
                  ? 'bg-success-green hover:bg-success-green/90'
                  : 'bg-on-background hover:opacity-90'
              } ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
              disabled={isSubmitting || isSuccess}
              type="submit"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2" id="loadingIndicator">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  <span>{isSignUp ? 'Creating Profile...' : 'Authenticating...'}</span>
                </div>
              ) : isSuccess ? (
                <span>Success</span>
              ) : (
                <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* SSO Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/[0.03]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-dashboard-canvas px-4 text-on-surface-variant/30">Corporate SSO</span>
            </div>
          </div>

          {/* Microsoft Login */}
          <button
            type="button"
            className="w-full border border-black/5 bg-white/40 text-on-surface text-sm font-medium py-3 rounded-lg hover:bg-white/80 transition-all flex items-center justify-center gap-3 cursor-pointer"
            onClick={() => setAuthError('SSO registration/login is not available — please use email and password.')}
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <rect fill="#f25022" height="10" width="10"></rect>
              <rect fill="#7fba00" height="10" width="10" x="11"></rect>
              <rect fill="#00a4ef" height="10" width="10" y="11"></rect>
              <rect fill="#ffb900" height="10" width="10" x="11" y="11"></rect>
            </svg>
            Continue with Microsoft 365
          </button>

          {/* Support Link */}
          <p className="text-center text-xs text-on-surface-variant/60 mt-10">
            Need help?{' '}
            <a className="text-on-background font-bold hover:underline" href="#">
              Contact Fleet Support
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
