// components/AdminLink.tsx
import Link from 'next/link';

export const AdminLink = () => (
  <Link href="/admin">
    <a className="admin-link">Админ-панель</a>
  </Link>
);