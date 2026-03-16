import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, KeyRound, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Step = 'request' | 'verify' | 'reset' | 'done';

interface ResetPayload {
  email: string;
  code: string;
  expiresAt: string;
}

const RESET_KEY = 'medical-platform-password-reset';

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const resetCode = generateCode();
    const payload: ResetPayload = {
      email,
      code: resetCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
    localStorage.setItem(RESET_KEY, JSON.stringify(payload));
    setIsLoading(false);
    toast({
      title: 'Verification code sent',
      description: `Demo mode: your code is ${resetCode}`,
    });
    setStep('verify');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem(RESET_KEY);
    if (!stored) {
      toast({
        title: 'Code expired',
        description: 'Please request a new code.',
        variant: 'destructive',
      });
      setStep('request');
      return;
    }
    const payload = JSON.parse(stored) as ResetPayload;
    if (payload.email !== email) {
      toast({
        title: 'Email mismatch',
        description: 'Use the same email you requested the code for.',
        variant: 'destructive',
      });
      return;
    }
    if (new Date(payload.expiresAt).getTime() < Date.now()) {
      toast({
        title: 'Code expired',
        description: 'Please request a new code.',
        variant: 'destructive',
      });
      setStep('request');
      return;
    }
    if (payload.code !== code.trim()) {
      toast({
        title: 'Invalid code',
        description: 'Please check the code and try again.',
        variant: 'destructive',
      });
      return;
    }
    setStep('reset');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Use at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    const registered = JSON.parse(
      localStorage.getItem('medical-platform-registered-users') || '[]'
    ) as Array<{ email: string; password: string }>;

    const index = registered.findIndex((u) => u.email === email);
    if (index === -1) {
      toast({
        title: 'Account not found',
        description: 'This email is not registered.',
        variant: 'destructive',
      });
      return;
    }

    registered[index] = { ...registered[index], password: newPassword };
    localStorage.setItem('medical-platform-registered-users', JSON.stringify(registered));
    localStorage.removeItem(RESET_KEY);
    setStep('done');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MedData</span>
          </Link>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              {step === 'request' && 'Enter your email to receive a verification code.'}
              {step === 'verify' && 'Enter the code we sent to your email.'}
              {step === 'reset' && 'Set your new password.'}
              {step === 'done' && 'Your password has been updated.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'request' && (
              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground"
                  disabled={isLoading}
                >
                  Send Code
                </Button>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      placeholder="6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                  Verify Code
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('request')}>
                  Resend code
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                  Reset Password
                </Button>
              </form>
            )}

            {step === 'done' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You can now sign in with your new password.
                </p>
                <Button
                  className="w-full gradient-primary text-primary-foreground"
                  onClick={() => navigate('/signin')}
                >
                  Back to Sign In
                </Button>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Remembered your password?{' '}
              <Link to="/signin" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
