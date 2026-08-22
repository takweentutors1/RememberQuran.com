import { LayoutSync } from "@/components/layout/LayoutSync"
import { ArrowRight, Fingerprint, Mail } from "lucide-react"

export default function FlowLoginPage() {
  return (
    <div className="fixed inset-0 bg-[#050505] text-white font-sans flex flex-col overflow-hidden items-center justify-center">
      <LayoutSync layoutMode="flow" />
      
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent blur-[100px] mix-blend-screen opacity-50"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md p-8">
        
        <div className="flex flex-col items-center mb-12">
          <div className="size-16 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-xl shadow-2xl">
            <Fingerprint className="size-8 text-white/80" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center mb-2">Welcome Back</h1>
          <p className="text-white/50 text-center font-medium">Sign in to sync your reading flow.</p>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-white text-black py-4 px-6 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-3">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          
          <button className="w-full bg-white/5 border border-white/10 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Continue with Facebook
          </button>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#050505] px-4 text-xs font-bold text-white/30 uppercase tracking-widest">Or</span>
            </div>
          </div>

          <button className="w-full bg-transparent border border-white/10 text-white/70 py-4 px-6 rounded-2xl font-bold text-lg hover:text-white hover:border-white/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <Mail className="size-5" />
            Continue with Email
          </button>
        </div>

      </div>
    </div>
  )
}
