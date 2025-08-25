'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
}

export function PageHeader({ title, subtitle, backUrl }: PageHeaderProps) {
  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-4">
          {backUrl && (
            <Link 
              href={backUrl}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
