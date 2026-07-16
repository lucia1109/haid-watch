import Link from 'next/link';
import { signOutModerator } from '@/app/admin/actions';

export default function AdminHeader() {
  return (
    <div className="admin-header">
      <Link href="/admin" className="admin-header-title">HAID WATCH ADMIN</Link>
      <form action={signOutModerator}>
        <button type="submit" className="btn btn-secondary">Sign Out</button>
      </form>
    </div>
  );
}
