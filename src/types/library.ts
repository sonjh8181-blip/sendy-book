export type SeatZone = '디지털열람실' | '노트북존' | '자유열람실' | '스터디존';

export type SeatStatus = '이용가능' | '예약중' | '점검중';

export interface Seat {
  seatNo: string;
  zone: SeatZone;
  status: SeatStatus;
  userName?: string;
  startTime?: string;
  endTime?: string;
}

export interface ReservationRecord {
  reservationId: string;
  seatNo: string;
  userName: string;
  email: string;
  startTime: string;
  endTime: string;
  status: '예약완료' | '이용중' | '취소됨' | '만료됨';
  createdAt: string;
}

export interface ReserveRequest {
  action: 'reserveSeat';
  seatNo: string;
  userName: string;
  email: string;
  startTime: string;
  endTime: string;
}

export interface CancelRequest {
  action: 'cancelReservation';
  seatNo: string;
  reservationId: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  reservationId?: string;
  seats?: Seat[];
  data?: T;
}

export interface ZoneMeta {
  id: SeatZone;
  name: string;
  description: string;
  badge: string;
  equipment: string[];
  rules: string;
}
