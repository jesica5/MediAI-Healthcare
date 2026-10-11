import React from 'react';
import './globals.css';
import { Metadata } from 'next';
import { LanguageProvider } from '@/shared/context/LanguageContext';
import { AuthProvider } from '@/shared/context/AuthContext';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';

export const metadata: Metadata = {
  title: 'MediAI — Smart Patient Triage & Emergency Risk Prediction',
  description:
    'AI-assisted clinical decision-support prototype for structured patient intake, emergency risk stratification, and hospital triage management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
        <LanguageProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
