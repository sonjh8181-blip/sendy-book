/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { SeatCard } from './components/SeatCard';
import { FloorPlanView } from './components/FloorPlanView';
import { ReservationModal } from './components/ReservationModal';
import { MyReservationsView } from './components/MyReservationsView';
import { ApiSpecsView } from './components/ApiSpecsView';
import { getSeats } from './services/gasApi';
import { Seat, SeatStatus, SeatZone } from './types/library';
import { ZONES } from './constants/zones';
import { AlertCircle, RefreshCw, Info, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Tab & Filter states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'floorplan' | 'my-reservations' | 'api-docs'>('dashboard');
  const [selectedZone, setSelectedZone] = useState<SeatZone | '전체'>('전체');
  const [selectedStatus, setSelectedStatus] = useState<SeatStatus | '전체'>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'floorplan'>('grid');

  // Reservation Modal state
  const [selectedSeatForModal, setSelectedSeatForModal] = useState<Seat | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch seats from Google Apps Script
  const loadSeats = async (silent = false) => {
    if (!silent) {
      setIsRefreshing(true);
    }
    setFetchError(null);

    try {
      const { seats: data } = await getSeats();
      setSeats(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load seats:', err);
      setFetchError(err?.message || '좌석 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSeats();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadSeats(true);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filtered seats calculation
  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      // Zone filter
      if (selectedZone !== '전체' && seat.zone !== selectedZone) {
        return false;
      }
      // Status filter
      if (selectedStatus !== '전체' && seat.status !== selectedStatus) {
        return false;
      }
      // Search query filter (seat number or user name)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchSeatNo = seat.seatNo.toLowerCase().includes(query);
        const matchUser = seat.userName ? seat.userName.toLowerCase().includes(query) : false;
        const matchZone = seat.zone.toLowerCase().includes(query);
        if (!matchSeatNo && !matchUser && !matchZone) {
          return false;
        }
      }
      return true;
    });
  }, [seats, selectedZone, selectedStatus, searchQuery]);

  // Handle seat reservation success
  const handleReservationSuccess = (resId: string, seatNo: string) => {
    setToastMessage(`좌석 [${seatNo}] 예약 완료 (예약번호: ${resId})`);
    loadSeats(true);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Switch to My Reservations on quick cancel
  const handleQuickCancelRequest = (_seat: Seat) => {
    setActiveTab('my-reservations');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={() => loadSeats(false)}
        isRefreshing={isRefreshing}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error notification banner if API failed */}
        {fetchError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-3 text-xs text-rose-800">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Google Apps Script 통신 실패: </span>
                <span>{fetchError}</span>
                <p className="mt-1 text-slate-500 text-[11px]">
                  엔드포인트 상태를 점검하거나 새로고침을 시도해 주세요.
                </p>
              </div>
            </div>
            <button
              onClick={() => loadSeats(false)}
              className="px-3 py-1 bg-white border border-rose-200 hover:bg-rose-100 rounded text-rose-800 shrink-0 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Global Statistics Bar */}
        <StatsBar seats={seats} lastUpdated={lastUpdated} />

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <FilterBar
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Selected Zone Context Banner */}
            {selectedZone !== '전체' && ZONES[selectedZone] && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {ZONES[selectedZone].name}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{ZONES[selectedZone].description}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{ZONES[selectedZone].badge}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">비치 시설:</span>
                  {ZONES[selectedZone].equipment.map((item, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {item}
                    </span>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-slate-600">이용 수칙: {ZONES[selectedZone].rules}</span>
                </div>
              </div>
            )}

            {/* View Mode: Floor Plan vs Cards Grid */}
            {viewMode === 'floorplan' ? (
              <FloorPlanView
                seats={seats}
                onSelectSeat={(seat) => {
                  if (seat.status === '이용가능') {
                    setSelectedSeatForModal(seat);
                  } else if (seat.status === '예약중') {
                    setActiveTab('my-reservations');
                  }
                }}
              />
            ) : (
              /* Grid Cards View */
              <div>
                {isLoading ? (
                  /* Loading Skeletons */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-44 bg-white border border-slate-200 rounded-lg p-4 animate-pulse space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="h-6 w-16 bg-slate-200 rounded" />
                          <div className="h-4 w-12 bg-slate-200 rounded" />
                        </div>
                        <div className="h-10 bg-slate-100 rounded" />
                        <div className="h-8 bg-slate-200 rounded mt-4" />
                      </div>
                    ))}
                  </div>
                ) : filteredSeats.length === 0 ? (
                  /* Empty State */
                  <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700">일치하는 좌석이 없습니다</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        선택한 구역이나 필터 조건, 검색어에 해당하는 좌석이 없습니다. 필터를 초기화해 보세요.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedZone('전체');
                        setSelectedStatus('전체');
                        setSearchQuery('');
                      }}
                      className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      필터 전체 초기화
                    </button>
                  </div>
                ) : (
                  /* Seat Cards Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredSeats.map((seat) => (
                      <SeatCard
                        key={seat.seatNo}
                        seat={seat}
                        onSelectReserve={(s) => setSelectedSeatForModal(s)}
                        onQuickCancelRequest={handleQuickCancelRequest}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Floor Plan Direct Tab */}
        {activeTab === 'floorplan' && (
          <FloorPlanView
            seats={seats}
            onSelectSeat={(seat) => {
              if (seat.status === '이용가능') {
                setSelectedSeatForModal(seat);
              } else if (seat.status === '예약중') {
                setActiveTab('my-reservations');
              }
            }}
          />
        )}

        {/* My Reservations Tab */}
        {activeTab === 'my-reservations' && (
          <MyReservationsView
            currentSeats={seats}
            onReservationCancelled={() => loadSeats(true)}
          />
        )}

        {/* API Specs & Developer Guide Tab */}
        {activeTab === 'api-docs' && <ApiSpecsView />}
      </main>

      {/* Reservation Modal */}
      {selectedSeatForModal && (
        <ReservationModal
          seat={selectedSeatForModal}
          onClose={() => setSelectedSeatForModal(null)}
          onSuccess={handleReservationSuccess}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">도서관 스마트 좌석 시스템</span>
            <span>·</span>
            <span>Google Apps Script REST Web App 연동 v1.0</span>
          </div>
          <div>
            <span>운영 시간: 06:00 ~ 23:00 · 30분 미입실 시 자동 퇴실</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
