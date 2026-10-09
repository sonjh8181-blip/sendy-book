import React, { useState, useEffect } from 'react';
import { Search, Trash2, Clock, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { ReservationRecord, Seat } from '../types/library';
import { cancelReservation, getLocalReservations } from '../services/gasApi';

interface MyReservationsViewProps {
  currentSeats: Seat[];
  onReservationCancelled: () => void;
}

export const MyReservationsView: React.FC<MyReservationsViewProps> = ({
  currentSeats,
  onReservationCancelled,
}) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manual cancel input
  const [manualSeatNo, setManualSeatNo] = useState('');
  const [manualResId, setManualResId] = useState('');
  const [isManualCancelling, setIsManualCancelling] = useState(false);

  // Load reservations
  const loadList = () => {
    const list = getLocalReservations(searchEmail);
    setReservations(list);
  };

  useEffect(() => {
    loadList();
  }, [searchEmail]);

  const handleCancel = async (record: ReservationRecord) => {
    if (!window.confirm(`좌석 [${record.seatNo}] 예약을 정말 취소하시겠습니까?`)) {
      return;
    }

    setCancellingId(record.reservationId);
    setNotification(null);

    try {
      const res = await cancelReservation({
        seatNo: record.seatNo,
        reservationId: record.reservationId,
      });

      if (res.status === 'success') {
        setNotification({ type: 'success', message: `${record.seatNo} 좌석 예약이 성공적으로 취소되었습니다.` });
        loadList();
        onReservationCancelled();
      } else {
        setNotification({ type: 'error', message: res.message || '예약 취소에 실패했습니다.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || '통신 오류가 발생했습니다.' });
    } finally {
      setCancellingId(null);
    }
  };

  const handleManualCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSeatNo.trim() || !manualResId.trim()) {
      setNotification({ type: 'error', message: '좌석번호와 예약번호를 모두 입력해 주세요.' });
      return;
    }

    setIsManualCancelling(true);
    setNotification(null);

    try {
      const res = await cancelReservation({
        seatNo: manualSeatNo.trim().toUpperCase(),
        reservationId: manualResId.trim(),
      });

      if (res.status === 'success') {
        setNotification({ type: 'success', message: `예약(${manualResId})이 정상적으로 취소되었습니다.` });
        setManualSeatNo('');
        setManualResId('');
        loadList();
        onReservationCancelled();
      } else {
        setNotification({ type: 'error', message: res.message || '예약 취소 실패' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || '통신 오류 발생' });
    } finally {
      setIsManualCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">내 예약 조회 및 취소</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              예약 시 입력했던 이메일을 검색하여 내역을 확인하거나 예약을 취소할 수 있습니다.
            </p>
          </div>

          {/* Search by Email */}
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="등록한 이메일 검색..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800"
              />
            </div>
            {searchEmail && (
              <button
                onClick={() => setSearchEmail('')}
                className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 rounded-md"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      {/* Grid of 2 columns: Reservations list + Direct cancellation box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Reservation List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              조회 결과 <strong className="text-slate-900 font-mono tabular-nums">{reservations.length}</strong>건
            </span>
            <button
              onClick={loadList}
              className="hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>목록 새로고침</span>
            </button>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700">예약 내역이 없습니다</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {searchEmail
                    ? `'${searchEmail}' 이메일로 등록된 예약 내역이 없습니다.`
                    : '아직 등록된 좌석 예약이 없습니다. 좌석 대시보드에서 원하는 좌석을 선택해 보세요.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((record) => {
                const currentSeat = currentSeats.find(s => s.seatNo === record.seatNo);
                const isCurrentlyActive = currentSeat?.status === '예약중' && record.status !== '취소됨';
                const isCancelled = record.status === '취소됨';

                return (
                  <div
                    key={record.reservationId}
                    className={`bg-white border rounded-lg p-4 transition-all ${
                      isCancelled ? 'border-slate-200 opacity-60' : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-mono text-slate-900">{record.seatNo}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-mono text-slate-500">예약번호 {record.reservationId}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCancelled ? (
                          <span className="text-xs font-semibold text-slate-400">취소 완료</span>
                        ) : isCurrentlyActive ? (
                          <span className="text-xs font-semibold text-amber-700">현재 이용중</span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-700">예약 확정</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="text-slate-400 text-[11px]">이용자명</div>
                        <div className="font-medium text-slate-800 mt-0.5">{record.userName}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[11px]">이메일</div>
                        <div className="font-mono text-slate-700 mt-0.5 truncate">{record.email}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[11px]">이용시간</div>
                        <div className="font-mono tabular-nums text-slate-800 mt-0.5">
                          {record.startTime} ~ {record.endTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[11px]">신청일시</div>
                        <div className="font-mono text-slate-500 text-[11px] mt-0.5">
                          {new Date(record.createdAt).toLocaleDateString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {!isCancelled && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                        <button
                          onClick={() => handleCancel(record)}
                          disabled={cancellingId === record.reservationId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors disabled:opacity-50"
                        >
                          {cancellingId === record.reservationId ? (
                            <>
                              <div className="w-3 h-3 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                              <span>취소 처리 중...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>예약 취소</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Direct Cancellation via Reservation ID */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold text-slate-900">예약번호로 직접 취소</h4>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              다른 기기에서 예약했거나 예약번호(R-XXXXX)를 보유하고 있는 경우 즉시 취소 요청을 보낼 수 있습니다.
            </p>

            <form onSubmit={handleManualCancelSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  좌석 번호
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: A-01"
                  value={manualSeatNo}
                  onChange={(e) => setManualSeatNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono uppercase text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  예약 번호
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: R-35524"
                  value={manualResId}
                  onChange={(e) => setManualResId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isManualCancelling}
                  className="w-full py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isManualCancelling ? (
                    <>
                      <div className="w-3 h-3 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                      <span>취소 요청 중...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>예약 취소 실행</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Policy card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>도서관 예약 유의사항</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px] leading-relaxed">
              <li>1인당 1회 최대 4시간까지 이용 가능합니다.</li>
              <li>예약 시작 시간 30분 이내 미입실 시 노쇼 처리됩니다.</li>
              <li>취소 시 즉시 다른 이용자가 예약할 수 있도록 반영됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
