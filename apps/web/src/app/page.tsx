import { redirect } from 'next/navigation';

/** Root route — redirect to dashboard (AuthGuard handles unauthenticated users) */
export default function RootPage() {
  redirect('/dashboard');
}
