
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { SiteHeader } from '@/components/site-header';
import { AuthProvider, AuthGuard } from '@/contexts/auth';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Using a client component, we can't export metadata directly.
// This is a workaround for this specific case.
// For a real app, you'd move this to a server component parent if possible.
const metadata: Metadata = {
  title: "Mo' Mitti",
  description: 'AI-powered guidance for modern agriculture.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
              <InnerLayout>
                  {children}
              </InnerLayout>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isAuthPage) {
        return <main className="flex-1 p-4 md:p-8">{children}</main>;
    }

    return (
        <AuthGuard>
            <SidebarProvider>
                <MainSidebar />
                <div className="flex flex-col w-full min-h-screen">
                    <SiteHeader />
                    <main className="flex-1 p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </AuthGuard>
    )
}
