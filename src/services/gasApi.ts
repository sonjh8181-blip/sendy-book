import { ApiResponse, CancelRequest, ReservationRecord, ReserveRequest, Seat } from '../types/library';

export const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbz8HlJXye6-NAi5Nv1r8ZwhiUXZ98tSiTG7N3HxrJTqpd7Le5aRPNm4PvkJfyBMwawW/exec';
const LOCAL_STORAGE_KEY = 'library_seat_reservations_v1';

/**
 * 저장된 내 예약 목록 조회 (localStorage)
 */
export function getLocalReservations(emailFilter?: string): ReservationRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const list: ReservationRecord[] = JSON.parse(raw);
    if (emailFilter && emailFilter.trim()) {
      const q = emailFilter.trim().toLowerCase();
      return list.filter(item => item.email.toLowerCase() === q);
    }
    return list;
  } catch (err) {
    console.error('Failed to parse local reservations', err);
    return [];
  }
}

/**
 * 신규 예약 로컬 저장
 */
export function saveLocalReservation(record: ReservationRecord) {
  try {
    const list = getLocalReservations();
    // 중복 제거 후 추가
    const updated = [record, ...list.filter(item => item.reservationId !== record.reservationId)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save reservation locally', err);
  }
}

/**
 * 예약 취소 상태 업데이트
 */
export function updateLocalReservationStatus(reservationId: string, status: ReservationRecord['status']) {
  try {
    const list = getLocalReservations();
    const updated = list.map(item =>
      item.reservationId === reservationId ? { ...item, status } : item
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update local reservation', err);
  }
}

/**
 * 1. 좌석 목록 불러오기 (GET)
 * API Spec: Base_URL?action=getSeats
 */
export async function getSeats(): Promise<{ seats: Seat[]; source: 'proxy' | 'direct' }> {
  // 우선 프록시 엔드포인트(/api/seats) 시도, 실패 시 직접 GAS URL로 fallback
  try {
    const res = await fetch('/api/seats', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data: ApiResponse = await res.json();
      if (data.status === 'success' && Array.isArray(data.seats)) {
        return { seats: data.seats, source: 'proxy' };
      }
    }
  } catch (err) {
    console.warn('Proxy fetch failed, falling back to direct GAS GET:', err);
  }

  // Direct fetch fallback
  const directUrl = `${GAS_BASE_URL}?action=getSeats`;
  const res = await fetch(directUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
  }
  const data: ApiResponse = await res.json();
  if (data.status === 'success' && Array.isArray(data.seats)) {
    return { seats: data.seats, source: 'direct' };
  }
  throw new Error(data.message || '좌석 정보를 불러오지 못했습니다.');
}

/**
 * 2. 좌석 예약하기 (POST)
 * API Spec: Payload: { action: 'reserveSeat', seatNo, userName, email, startTime, endTime }
 */
export async function reserveSeat(params: {
  seatNo: string;
  userName: string;
  email: string;
  startTime: string;
  endTime: string;
}): Promise<{ status: 'success' | 'fail'; message: string; reservationId?: string }> {
  const payload: ReserveRequest = {
    action: 'reserveSeat',
    seatNo: params.seatNo,
    userName: params.userName,
    email: params.email,
    startTime: params.startTime,
    endTime: params.endTime,
  };

  let result: ApiResponse;

  // 1) Proxy 시도
  try {
    const res = await fetch('/api/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      result = await res.json();
    } else {
      throw new Error(`Proxy error ${res.status}`);
    }
  } catch (err) {
    console.warn('Proxy reserve failed, falling back to direct GAS POST:', err);
    // 2) Direct fallback: text/plain prevents CORS preflight OPTIONS in GAS
    const directRes = await fetch(GAS_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const text = await directRes.text();
    try {
      result = JSON.parse(text);
    } catch {
      result = { status: 'success', message: '예약 요청이 전송되었습니다.' };
    }
  }

  if (result.status === 'success') {
    const resId = result.reservationId || `R-${Date.now().toString().slice(-5)}`;
    // 로컬 스토리지에 예약 저장
    saveLocalReservation({
      reservationId: resId,
      seatNo: params.seatNo,
      userName: params.userName,
      email: params.email,
      startTime: params.startTime,
      endTime: params.endTime,
      status: '예약완료',
      createdAt: new Date().toISOString(),
    });
    return {
      status: 'success',
      message: result.message || '예약이 성공적으로 완료되었습니다.',
      reservationId: resId,
    };
  }

  return {
    status: 'fail',
    message: result.message || '좌석 예약에 실패했습니다.',
  };
}

/**
 * 3. 예약 취소하기 (POST)
 * API Spec: Payload: { action: 'cancelReservation', seatNo, reservationId }
 */
export async function cancelReservation(params: {
  seatNo: string;
  reservationId: string;
}): Promise<{ status: 'success' | 'fail'; message: string }> {
  const payload: CancelRequest = {
    action: 'cancelReservation',
    seatNo: params.seatNo,
    reservationId: params.reservationId,
  };

  let result: ApiResponse;

  try {
    const res = await fetch('/api/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      result = await res.json();
    } else {
      throw new Error(`Proxy error ${res.status}`);
    }
  } catch (err) {
    console.warn('Proxy cancel failed, falling back to direct GAS POST:', err);
    const directRes = await fetch(GAS_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const text = await directRes.text();
    try {
      result = JSON.parse(text);
    } catch {
      result = { status: 'success', message: '취소 요청이 전송되었습니다.' };
    }
  }

  if (result.status === 'success') {
    updateLocalReservationStatus(params.reservationId, '취소됨');
    return {
      status: 'success',
      message: result.message || '예약이 취소되었습니다.',
    };
  }

  return {
    status: 'fail',
    message: result.message || '예약 취소에 실패했습니다.',
  };
}
