import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'floorplan' | 'my-reservations' | 'api-docs';
  setActiveTab: (tab: 'dashboard' | 'floorplan' | 'my-reservations' | 'api-docs') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              도서관 좌석 예약 시스템
            </span>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard' ? 'text-slate-950 font-semibold underline underline-offset-8 decoration-slate-900' : ''
              }`}
            >
              좌석 대시보드
            </button>
            <button
              onClick={() => setActiveTab('floorplan')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'floorplan' ? 'text-slate-950 font-semibold underline underline-offset-8 decoration-slate-900' : ''
              }`}
            >
              좌석 배치도
            </button>
            <button
              onClick={() => setActiveTab('my-reservations')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'my-reservations' ? 'text-slate-950 font-semibold underline underline-offset-8 decoration-slate-900' : ''
              }`}
            >
              내 예약 조회·취소
            </button>
            <button
              onClick={() => setActiveTab('api-docs')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'api-docs' ? 'text-slate-950 font-semibold underline underline-offset-8 decoration-slate-900' : ''
              }`}
            >
              API 스펙 및 가이드
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              title="실시간 좌석 정보 갱신"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>실시간 갱신</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto gap-4 py-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'dashboard' ? 'text-slate-900 font-bold bg-slate-100' : ''}`}
          >
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('floorplan')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'floorplan' ? 'text-slate-900 font-bold bg-slate-100' : ''}`}
          >
            배치도
          </button>
          <button
            onClick={() => setActiveTab('my-reservations')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'my-reservations' ? 'text-slate-900 font-bold bg-slate-100' : ''}`}
          >
            내 예약
          </button>
          <button
            onClick={() => setActiveTab('api-docs')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'api-docs' ? 'text-slate-900 font-bold bg-slate-100' : ''}`}
          >
            API 가이드
          </button>
        </div>
      </div>
    </header>
  );
};
