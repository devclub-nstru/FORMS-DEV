import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { X, ArrowRight, Loader2 } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

const RECOVERY_MESSAGES = [
  "Verifying account status...",
  "Generating reset token...",
  "Preparing recovery dispatch...",
  "Sending secure email link...",
  "Finalizing security handshake..."
];

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(RECOVERY_MESSAGES[0]);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsg(RECOVERY_MESSAGES[Math.floor(Math.random() * RECOVERY_MESSAGES.length)]);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { error } = await apiClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;

      toast.success("Recovery link sent.", {
        description: "Please check your email inbox and spam folder.",
      });
      onClose();
    } catch (error: any) {
      toast.error("Recovery failed.", {
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !loading && !v && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-white border border-black/10 rounded-2xl shadow-xl p-8 overflow-hidden font-sans [&>button:last-child]:hidden">
        
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 z-50 w-8 h-8 rounded-full border border-black/10 bg-white flex items-center justify-center text-black/40 hover:text-black/75 hover:bg-black/[0.03] transition-all disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-[28px] font-semibold tracking-[-0.03em] leading-tight text-foreground font-sans">
              Forgot password<span className="text-accent">.</span>
            </DialogTitle>
            <DialogDescription className="text-[14px] text-black/40 mt-3 leading-relaxed font-sans normal-case">
              Enter the email address associated with your account, and we will send you a recovery link to reset your password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/40">
                Email address
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full bg-white border border-black/12 rounded-xl px-4 py-3.5 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-black/25 shadow-sm font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background rounded-xl px-5 py-4 text-[15px] font-medium hover:bg-accent hover:text-white transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-sans mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                   <Loader2 className="w-4 h-4 animate-spin text-current" />
                   <span className="text-[13px] font-mono uppercase tracking-wider">{loadingMsg}</span>
                </div>
              ) : (
                <>
                  <span>Send recovery link</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02] z-0" 
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
