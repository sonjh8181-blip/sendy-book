import React from 'react';
import { Monitor, Laptop, BookOpen, Users, Compass } from 'lucide-react';
import { Seat } from '../types/library';

interface FloorPlanViewProps {
  seats: Seat[];
  onSelectSeat: (seat: Seat) => void;
}

export const FloorPlanView: React.FC<FloorPlanViewProps> = ({ seats, onSelectSeat }) => {
  const getSeatsByZone = (zone: string) => seats.filter(s => s.zone === zone);

  const getStatusColor = (status: Seat['status']) => {
    switch (status) {
      case '이용가능':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs';
      case '예약중':
        return 'bg-amber-400 hover:bg-amber-500 text-slate-900';
      case '점검중':
        return 'bg-slate-300 text-slate-600 cursor-not-allowed';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
      {/* Floor Plan Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">도서관 실시간 좌석 배치도</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            구역별 좌석 위치를 평면도에서 확인하고 직접 클릭하여 예약할 수 있습니다.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>이용가능</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
            <span>예약중</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
            <span>점검중</span>
          </div>
        </div>
      </div>

      {/* Interactive Architectural Canvas */}
      <div className="relative bg-slate-50 border border-slate-200 rounded-lg p-6 overflow-x-auto">
        {/* Entrance & Compass */}
        <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-700">
              🚪 중앙 출입구 및 키오스크
            </span>
            <span className="hidden sm:inline text-slate-400">· 좌석 발권 후 입실</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>2층 열람실 플로어</span>
          </div>
        </div>

        {/* 4 Quadrants Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quadrant 1: 디지털열람실 (A구역) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-xs text-slate-800">디지털열람실 (A 구역)</span>
              </div>
              <span className="text-[11px] text-slate-400">PC 탑재 5석</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {getSeatsByZone('디지털열람실').map((seat) => (
                <button
                  key={seat.seatNo}
                  onClick={() => onSelectSeat(seat)}
                  disabled={seat.status === '점검중'}
                  className={`flex flex-col items-center justify-center p-2 rounded-md font-mono transition-all text-center ${getStatusColor(
                    seat.status
                  )}`}
                  title={`${seat.seatNo} - ${seat.status}${seat.userName ? ` (${seat.userName})` : ''}`}
                >
                  <span className="text-xs font-bold">{seat.seatNo}</span>
                  <span className="text-[10px] opacity-90 truncate max-w-full">
                    {seat.status === '이용가능' ? '예약' : seat.status === '예약중' ? '사용' : '점검'}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>🖥️ 멀티미디어 검색대 위치</span>
              <span>헤드셋 구비</span>
            </div>
          </div>

          {/* Quadrant 2: 노트북존 (B구역) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-xs text-slate-800">노트북존 (B 구역)</span>
              </div>
              <span className="text-[11px] text-slate-400">콘센트 구비 5석</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {getSeatsByZone('노트북존').map((seat) => (
                <button
                  key={seat.seatNo}
                  onClick={() => onSelectSeat(seat)}
                  disabled={seat.status === '점검중'}
                  className={`flex flex-col items-center justify-center p-2 rounded-md font-mono transition-all text-center ${getStatusColor(
                    seat.status
                  )}`}
                  title={`${seat.seatNo} - ${seat.status}${seat.userName ? ` (${seat.userName})` : ''}`}
                >
                  <span className="text-xs font-bold">{seat.seatNo}</span>
                  <span className="text-[10px] opacity-90 truncate max-w-full">
                    {seat.status === '이용가능' ? '예약' : seat.status === '예약중' ? '사용' : '점검'}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>⚡ 개별 2구 전원 콘센트</span>
              <span>Wi-Fi 6 커버리지</span>
            </div>
          </div>

          {/* Quadrant 3: 자유열람실 (C구역) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-xs text-slate-800">자유열람실 (C 구역)</span>
              </div>
              <span className="text-[11px] text-slate-400">집중 정숙형 5석</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {getSeatsByZone('자유열람실').map((seat) => (
                <button
                  key={seat.seatNo}
                  onClick={() => onSelectSeat(seat)}
                  disabled={seat.status === '점검중'}
                  className={`flex flex-col items-center justify-center p-2 rounded-md font-mono transition-all text-center ${getStatusColor(
                    seat.status
                  )}`}
                  title={`${seat.seatNo} - ${seat.status}${seat.userName ? ` (${seat.userName})` : ''}`}
                >
                  <span className="text-xs font-bold">{seat.seatNo}</span>
                  <span className="text-[10px] opacity-90 truncate max-w-full">
                    {seat.status === '이용가능' ? '예약' : seat.status === '예약중' ? '사용' : '점검'}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>🤫 절대 정숙 집중 구역</span>
              <span>조도 조절 스탠드</span>
            </div>
          </div>

          {/* Quadrant 4: 스터디존 (D구역) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-xs text-slate-800">스터디존 (D 구역)</span>
              </div>
              <span className="text-[11px] text-slate-400">그룹 협업형 5석</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {getSeatsByZone('스터디존').map((seat) => (
                <button
                  key={seat.seatNo}
                  onClick={() => onSelectSeat(seat)}
                  disabled={seat.status === '점검중'}
                  className={`flex flex-col items-center justify-center p-2 rounded-md font-mono transition-all text-center ${getStatusColor(
                    seat.status
                  )}`}
                  title={`${seat.seatNo} - ${seat.status}${seat.userName ? ` (${seat.userName})` : ''}`}
                >
                  <span className="text-xs font-bold">{seat.seatNo}</span>
                  <span className="text-[10px] opacity-90 truncate max-w-full">
                    {seat.status === '이용가능' ? '예약' : seat.status === '예약중' ? '사용' : '점검'}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>💬 적정 소음 토의 가능</span>
              <span>화이트보드 비치</span>
            </div>
          </div>
        </div>

        {/* Footer Area with Book Stacks landmark */}
        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span>📚 일반 도서 자료 서가 (100~900번대)</span>
            <span>·</span>
            <span>🖨️ 무인 복사기/프린터기 부스</span>
          </div>
          <div>
            <span>* 좌석 클릭 시 즉시 상세 정보 확인 및 예약 폼으로 연결됩니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
