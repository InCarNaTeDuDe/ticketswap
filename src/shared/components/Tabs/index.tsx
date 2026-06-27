import React from 'react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
}

export default function Tabs({ activeTab, onTabChange, tabs }: TabsProps) {
  return (
    <div className="flex border-b border-gray-850 w-full mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-3.5 text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === tab.id
              ? 'border-pink-500 text-pink-500 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
