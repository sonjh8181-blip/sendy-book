import React from 'react';
import { Search, LayoutGrid, Map, Filter } from 'lucide-react';
import { SeatStatus, SeatZone } from '../types/library';
import { ZONE_LIST } from '../constants/zones';

interface FilterBarProps {
  selectedZone: SeatZone | '전체';
  setSelectedZone: (zone: SeatZone | '전체') => void;
  selectedStatus: SeatStatus | '전체';
  setSelectedStatus: (status: SeatStatus | '전체') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'grid' | 'floorplan';
  setViewMode: (mode: 'grid' | 'floorplan') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedZone,
  setSelectedZone,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
      {/* Row 1: Zone Segmented Controls + View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Zone Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setSelectedZone('전체')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedZone === '전체'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            전체 구역 (20석)
          </button>
          {ZONE_LIST.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedZone === zone
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* View Switcher: Grid vs Floor Plan */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md shrink-0 self-start lg:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>카드형</span>
          </button>
          <button
            onClick={() => setViewMode('floorplan')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              viewMode === 'floorplan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>배치도</span>
          </button>
        </div>
      </div>

      {/* Row 2: Status Filter & Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-xs flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>상태:</span>
          </span>
          {(['전체', '이용가능', '예약중', '점검중'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                selectedStatus === status
                  ? 'font-semibold text-slate-900 bg-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="좌석번호 또는 이용자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:bg-white focus:border-slate-800 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
