import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import logoImg from '../assets/PUBLIXEL2025min.png';
import { cn } from '@/utils/cn';

export function DefaultLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100/80 shadow-sm fixed w-full z-50">
        <div className="px-4">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -m-2.5 p-2.5 text-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="flex items-center space-x-2 ml-4">
                <img 
                  src={logoImg} 
                  alt="Publixel" 
                  className="h-7 w-auto"
                />
              </div>
            </div>
            <div className="flex items-center">
              <Header />
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onOpenChange={setSidebarOpen}
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
      />
      
      {/* Main Content */}
      <main className={cn(
        "pt-14 transition-all duration-300",
        isExpanded ? "lg:ml-56" : "lg:ml-14"
      )}>
        <div className="px-6 py-6 sm:px-8">
          <div className="mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}