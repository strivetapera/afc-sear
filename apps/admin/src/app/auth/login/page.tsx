"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input
} from '@afc-sear/ui';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn.email({
        email,
        password,
      }, {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Login failed. Please check your credentials.');
          setIsLoading(false);
        },
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold tracking-tight">Admin Portal</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Enter your church credentials to access the portal
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <Input 
                id="email"
                type="email"
                label="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@apostolicfaith.example"
                required
                className="h-12"
                disabled={isLoading}
              />
              <Input 
                id="password"
                label="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}
            <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
                disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="pt-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium opacity-70">
                Default: admin@apostolicfaith.example / changeme-admin
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
