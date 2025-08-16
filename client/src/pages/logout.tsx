import { useEffect } from 'react';

export default function Logout() {
  useEffect(() => {
    // Clear localStorage and redirect
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center">
      <div className="text-white">Çıkış yapılıyor...</div>
    </div>
  );
}