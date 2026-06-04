import { getSession } from '@/lib/auth';
import Header from '../components/Header';

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <>
      <Header session={session} />
      
      <main className="page">
        {children}
      </main>

      <footer className="footer mt-auto">
        <div className="footer-inner">
          <span>© 2026 IGLA+ · International Group of LGBTQIA+ Aquatics · Est. 1987</span>
          <span>Prototype · Relational Database Engine</span>
        </div>
      </footer>
    </>
  );
}
