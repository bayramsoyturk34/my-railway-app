import { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export default function Logout() {
  useEffect(() => {
    // Call logout API to clear cookie and redirect
    const performLogout = async () => {
      try {
        await apiRequest('/api/auth/logout', 'POST');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear any remaining client-side data and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    };
    
    performLogout();
  }, []);

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center">
      <div className="text-white">Çıkış yapılıyor...</div>
    </div>
  );
}