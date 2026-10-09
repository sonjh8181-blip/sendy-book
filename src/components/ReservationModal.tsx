import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Clock, User, Mail, ShieldCheck, Copy } from 'lucide-react';
import { Seat } from '../types/library';
import { reserveSeat } from '../services/gasApi';

interface ReservationModalProps {
  seat: Seat | null;
  onClose: () => void;
  onSuccess: (reservationId: string, seatNo: string) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  seat,
  onClose,
  onSuccess,
}) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [agreed, setAgreed] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ id: string; msg: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize start/end time with intelligent defaults
  useEffect(() => {
    if (seat) {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(Math.floor(now.getMinutes() / 10) * 10).padStart(2, '0');
      const startStr = `${currentHours}:${currentMinutes}`;
      setStartTime(startStr);

      // Default duration: 2 hours later
      const endHour = (now.getHours() + 2) % 24;
      const endStr = `${String(endHour).padStart(2, '0')}:${currentMinutes}`;
      setEndTime(endStr);

      setErrorMsg(null);
      setSuccessInfo(null);
    }
  }, [seat]);

  if (!seat) return null;

  const handlePresetDuration = (hours: number) => {
    if (!startTime) return;
    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + hours) % 24;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg('이용자명을 입력해 주세요.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg('이용 시작시간과 종료시간을 모두 설정해 주세요.');
      return;
    }
    if (!agreed) {
      setErrorMsg('도서관 이용 수칙에 동의해야 예약이 가능합니다.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await reserveSeat({
        seatNo: seat.seatNo,
        userName: userName.trim(),
        email: email.trim(),
        startTime,
        endTime,
      });

      if (res.status === 'success') {
        const resId = res.reservationId || '확인됨';
        setSuccessInfo({ id: resId, msg: res.message });
        onSuccess(resId, seat.seatNo);
      } else {
        setErrorMsg(res.message || '좌석 예약에 실패했습니다. 다른 좌석을 선택해 보세요.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || '통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (successInfo?.id) {
      navigator.clipboard.writeText(successInfo.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">도서관 좌석 예약 신청</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              <span>{seat.zone}</span>
              <span className="mx-1.5">·</span>
              <span className="font-mono font-semibold text-slate-800">{seat.seatNo} 좌석</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successInfo ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">예약이 완료되었습니다!</h3>
              <p className="text-xs text-slate-500 mt-1">{successInfo.msg}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">예약 번호</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{successInfo.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                    title="예약번호 복사"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-600">복사됨</span>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">지정 좌석</span>
                <span className="font-semibold text-slate-800">{seat.seatNo} ({seat.zone})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">이용 시간</span>
                <span className="font-mono tabular-nums text-slate-800">{startTime} ~ {endTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">예약자 이메일</span>
                <span className="text-slate-800">{email}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              * 예약 번호와 등록 이메일은 '내 예약 조회/취소' 메뉴에서 사용됩니다.
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Seat Summary Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="text-slate-500">예약 대상 좌석</div>
                <div className="font-mono font-bold text-slate-900 text-sm">{seat.seatNo}</div>
              </div>
              <div className="text-right space-y-0.5">
                <div className="text-slate-500">공간 구역</div>
                <div className="font-medium text-slate-800">{seat.zone}</div>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이용자명 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800 transition-colors"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이메일 주소 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="예: user@library.ac.kr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800 transition-colors"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                예약 내역 조회 및 취소 시 인증 수단으로 사용됩니다.
              </p>
            </div>

            {/* Time Configuration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이용 희망 시간 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">시작 시간</div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">종료 시간</div>
                </div>
              </div>

              {/* Quick Duration Preset Buttons */}
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">이용 시간 설정:</span>
                {[1, 2, 3, 4].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => handlePresetDuration(hrs)}
                    className="px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    +{hrs}시간
                  </button>
                ))}
              </div>
            </div>

            {/* Policy Checkbox */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-0"
                />
                <span className="leading-tight">
                  도서관 좌석 이용 수칙을 준수하며, 예약 시작 후 30분 미입실 시 자동 취소될 수 있음에 동의합니다.
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Apps Script 통신 중...</span>
                  </>
                ) : (
                  <span>예약 확인 및 완료</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
