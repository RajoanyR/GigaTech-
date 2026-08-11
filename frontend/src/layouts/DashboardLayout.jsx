import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

/** Layout principal de l'application authentifiee. */
export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080F1C] transition-colors duration-300">
      <Sidebar open={open} collapsed={collapsed} onClose={() => setOpen(false)} />
      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'}`}>
        <Navbar onToggleSidebar={() => setOpen(true)} onCollapse={() => setCollapsed((c) => !c)} />
        <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
