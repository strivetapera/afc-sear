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

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Local API sign-in endpoint
      const response = await fetch('http://localhost:4000/api/v1/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Invalid credentials' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const { data } = await response.json();
      
      // Store the session ID as the access token for local development
      if (data?.session?.id) {
        localStorage.setItem('afc_access_token', data.session.id);
      }
      
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <p className="text-sm text-center text-gray-500">
            Enter your church credentials to access the portal
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="Login / Email" 
              value={login} 
              onChange={(e) => setLogin(e.target.value)}
              placeholder="admin@afc.local"
              required
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
