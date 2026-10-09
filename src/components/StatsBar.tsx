import React from 'react';
import { Seat } from '../types/library';

interface StatsBarProps {
  seats: Seat[];
  lastUpdated: Date | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ seats, lastUpdated }) => {
  const total = seats.length;
  const available = seats.filter(s => s.status === '이용가능').length;
  const reserved = seats.filter(s => s.status === '예약중').length;
  const maintenance = seats.filter(s => s.status === '점검중').length;
  const occupancyRate = total > 0 ? Math.round((reserved / total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="pt-2 sm:pt-0 sm:px-3 first:pl-0">
          <div className="text-xs font-medium text-slate-500">전체 좌석</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{total}</span>
            <span className="text-xs text-slate-400">석</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">4개 전문 구역 운영</div>
        </div>

        <div className="pt-2 sm:pt-0 sm:px-3">
          <div className="text-xs font-medium text-emerald-700">이용 가능</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600">{available}</span>
            <span className="text-xs text-emerald-600/70">석</span>
          </div>
          <div className="text-xs text-emerald-700/80 mt-0.5">즉시 예약 가능</div>
        </div>

        <div className="pt-2 sm:pt-0 sm:px-3">
          <div className="text-xs font-medium text-amber-700">예약 중</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600">{reserved}</span>
            <span className="text-xs text-amber-600/70">석</span>
          </div>
          <div className="text-xs text-amber-700/80 mt-0.5">현재 이용 중</div>
        </div>

        <div className="pt-2 sm:pt-0 sm:px-3">
          <div className="text-xs font-medium text-slate-500">점검 중</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-600">{maintenance}</span>
            <span className="text-xs text-slate-400">석</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">장비 점검 및 보수</div>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 pt-2 sm:pt-0 sm:px-3">
          <div className="text-xs font-medium text-slate-500">실시간 이용률</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{occupancyRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-slate-800 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Google Apps Script 실시간 연동 중</span>
          <span className="font-mono tabular-nums">
            최근 동기화: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
};
