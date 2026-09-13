import {
  LayoutDashboard,
  Wand2,
  Layers,
  Calendar,
  Bookmark,
  Briefcase,
  CreditCard,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab, UsageData } from '../types';
import { UsageCounter } from './UsageCounter';

interface SidebarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  usage: UsageData;
  onUpgradeClick: () => void;
}

export function Sidebar({ activeTab, onNavigate, usage, onUpgradeClick }: SidebarProps) {
  const menuItems: Array<{ id: ActiveTab; label: string; icon: any; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Create Content', icon: Wand2, badge: 'AI' },
    { id: 'ai-tools', label: 'AI Tools', icon: Layers, badge: '10 Tools' },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'history', label: 'History', icon: Bookmark },
    { id: 'brand', label: 'Brand Profile', icon: Briefcase },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="dashboard-sidebar"
      className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 justify-between"
    >
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Usage Quota & Upgrade Card */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <UsageCounter usage={usage} onUpgradeClick={onUpgradeClick} />

        <div
          id="sidebar-upgrade-promo"
          onClick={onUpgradeClick}
          className="p-3.5 rounded-xl bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-900 text-white cursor-pointer hover:shadow-lg transition-all group border border-indigo-700/50"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Upgrade to Pro
            </span>
            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Get 100 generations/month, full calendar planner & priority speed for ₹299.
          </p>
        </div>
      </div>
    </aside>
  );
}
