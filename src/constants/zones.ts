import { SeatZone, ZoneMeta } from '../types/library';

export const ZONES: Record<SeatZone, ZoneMeta> = {
  디지털열람실: {
    id: '디지털열람실',
    name: '디지털열람실',
    description: 'PC 및 인터넷 검색, 고화질 모니터와 디지털 자료 열람 전용 공간',
    badge: 'A구역',
    equipment: ['최신 데스크톱 PC', '27인치 모니터', '헤드셋 대여', '인터넷 검색'],
    rules: '게임 및 동영상 오락 시청 금지 · 무소음 마우스 사용',
  },
  노트북존: {
    id: '노트북존',
    name: '노트북존',
    description: '개인 노트북 및 태블릿 사용자를 위한 전원 콘센트 완비 구역',
    badge: 'B구역',
    equipment: ['개별 2구 콘센트', '초고속 기가 Wi-Fi', '넓은 책상 폭', '스탠드 조명'],
    rules: '타이핑 및 마우스 클릭 허용 · 이어폰 착용 필수',
  },
  자유열람실: {
    id: '자유열람실',
    name: '자유열람실',
    description: '독서와 개인 집중 학습을 위한 정숙 열람 공간',
    badge: 'C구역',
    equipment: ['개별 독서대', 'LED 조도 조절 스탠드', '인체공학 의자', '사물함 연계'],
    rules: '절대 정숙 공간 · 스마트폰 무음 필수 · 노트북 타이핑 불가',
  },
  스터디존: {
    id: '스터디존',
    name: '스터디존',
    description: '그룹 토의 및 과제, 협업 학습이 가능한 개방형 스터디 공간',
    badge: 'D구역',
    equipment: ['화이트보드', '멀티탭 제공', '4인/6인 라운드 테이블', '모니터 미러링'],
    rules: '적정 음성 톤 대화 허용 · 타 이용자 배려',
  },
};

export const ZONE_LIST: SeatZone[] = ['디지털열람실', '노트북존', '자유열람실', '스터디존'];
