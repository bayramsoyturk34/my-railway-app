import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  // While loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <p className="text-gray-400">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    setLocation("/login");
    return null;
  }

  // Check if user is admin
  // Admin is defined as: role === "SUPER_ADMIN" OR isAdmin === true
  const isAdmin = 
    user.role === "SUPER_ADMIN" || 
    user.role === "ADMIN" ||
    (user as any).isAdmin === true;

  // If not admin, redirect to dashboard
  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  // User is admin, render children
  return <>{children}</>;
}