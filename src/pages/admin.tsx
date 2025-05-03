import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Проверка прав администратора
    const checkAdmin = async () => {
      const response = await fetch('/api/check-admin');
      if (!response.ok) router.push('/');
    };
    checkAdmin();
  }, [router]);

  return (
    <div className="admin-panel">
      <h1>Админ-панель</h1>
      {/* Админ-функционал */}
    </div>
  );
}