import React from 'react';
import { Clock, Monitor, User, Wrench } from 'lucide-react';
import { Seat } from '../types/library';

interface SeatCardProps {
  seat: Seat;
  onSelectReserve: (seat: Seat) => void;
  onQuickCancelRequest?: (seat: Seat) => void;
}

export const SeatCard: React.FC<SeatCardProps> = ({
  seat,
  onSelectReserve,
  onQuickCancelRequest,
}) => {
  const isAvailable = seat.status === '이용가능';
  const isReserved = seat.status === '예약중';
  const isMaintenance = seat.status === '점검중';

  // Status-specific design system:
  // 이용가능: emerald / cyan tint
  // 예약중: amber / rose tint
  // 점검중: slate / gray tint
  const borderClass = isAvailable
    ? 'border-emerald-200 hover:border-emerald-400 bg-white shadow-xs hover:shadow-sm'
    : isReserved
    ? 'border-amber-200 bg-amber-50/30'
    : 'border-slate-200 bg-slate-50/60 opacity-80';

  const statusTextColor = isAvailable
    ? 'text-emerald-700'
    : isReserved
    ? 'text-amber-700'
    : 'text-slate-500';

  return (
    <div
      className={`relative flex flex-col justify-between rounded-lg border p-4 transition-all duration-150 ${borderClass}`}
    >
      <div>
        {/* Top Header: Seat Number & Zone */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-slate-900 tracking-tight">
                {seat.seatNo}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-500">{seat.zone}</span>
            </div>
          </div>

          {/* Status Label (Clean typographic metadata) */}
          <div className="text-right">
            <span className={`text-xs font-semibold ${statusTextColor}`}>
              {seat.status}
            </span>
          </div>
        </div>

        {/* Dynamic Occupancy Details */}
        <div className="mt-3 min-h-[52px] text-xs">
          {isAvailable && (
            <p className="text-slate-500 leading-relaxed">
              지금 바로 예약하고 이용할 수 있는 좌석입니다.
            </p>
          )}

          {isReserved && (
            <div className="space-y-1.5 text-slate-700">
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{seat.userName ? `${seat.userName} 님` : '예약자 확인 중'}</span>
              </div>
              {(seat.startTime || seat.endTime) && (
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {seat.startTime || '시작미정'} ~ {seat.endTime || '종료미정'}
                  </span>
                </div>
              )}
            </div>
          )}

          {isMaintenance && (
            <div className="flex items-center gap-2 text-slate-500">
              <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>정기 시설 보수 및 기기 점검 중</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {isAvailable ? (
          <button
            onClick={() => onSelectReserve(seat)}
            className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
          >
            좌석 예약하기
          </button>
        ) : isReserved ? (
          <div className="w-full flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">이용 중인 좌석</span>
            {onQuickCancelRequest && (
              <button
                onClick={() => onQuickCancelRequest(seat)}
                className="text-[11px] font-medium text-amber-700 hover:text-amber-900 hover:underline"
              >
                본인 예약 취소
              </button>
            )}
          </div>
        ) : (
          <span className="w-full text-center py-1 text-xs text-slate-400">
            현재 이용 불가
          </span>
        )}
      </div>
    </div>
  );
};
