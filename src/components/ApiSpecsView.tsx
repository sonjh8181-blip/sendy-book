import React, { useState } from 'react';
import { Copy, Check, Terminal, Database, Palette, Layers, Play, FileCode } from 'lucide-react';
import { GAS_BASE_URL } from '../services/gasApi';

export const ApiSpecsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'code-gs' | 'fetch-code' | 'db-schema' | 'style-guide' | 'component-tree' | 'sandbox'>('code-gs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live sandbox state
  const [sandboxAction, setSandboxAction] = useState<'getSeats' | 'reserveSeat' | 'cancelReservation'>('getSeats');
  const [sandboxSeatNo, setSandboxSeatNo] = useState('A-02');
  const [sandboxName, setSandboxName] = useState('테스트유저');
  const [sandboxEmail, setSandboxEmail] = useState('test@library.org');
  const [sandboxStartTime, setSandboxStartTime] = useState('14:00');
  const [sandboxEndTime, setSandboxEndTime] = useState('16:00');
  const [sandboxResId, setSandboxResId] = useState('R-35524');
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runSandbox = async () => {
    setSandboxLoading(true);
    setSandboxResponse(null);
    try {
      if (sandboxAction === 'getSeats') {
        const res = await fetch(`${GAS_BASE_URL}?action=getSeats`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        setSandboxResponse(JSON.stringify(data, null, 2));
      } else if (sandboxAction === 'reserveSeat') {
        const payload = {
          action: 'reserveSeat',
          seatNo: sandboxSeatNo,
          userName: sandboxName,
          email: sandboxEmail,
          startTime: sandboxStartTime,
          endTime: sandboxEndTime,
        };
        const res = await fetch(GAS_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        try {
          setSandboxResponse(JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          setSandboxResponse(text);
        }
      } else if (sandboxAction === 'cancelReservation') {
        const payload = {
          action: 'cancelReservation',
          seatNo: sandboxSeatNo,
          reservationId: sandboxResId,
        };
        const res = await fetch(GAS_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        try {
          setSandboxResponse(JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          setSandboxResponse(text);
        }
      }
    } catch (err: any) {
      setSandboxResponse(JSON.stringify({ error: err?.message || '실행 실패' }, null, 2));
    } finally {
      setSandboxLoading(false);
    }
  };

  const getSeatsSnippet = `// 1. 좌석 목록 불러오기 (GET)
const BASE_URL = "${GAS_BASE_URL}";

async function fetchSeats() {
  try {
    const response = await fetch(\`\${BASE_URL}?action=getSeats\`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    if (data.status === "success") {
      console.log("좌석 목록:", data.seats);
      return data.seats;
    } else {
      throw new Error(data.message || "좌석 로드 실패");
    }
  } catch (error) {
    console.error("좌석 목록 조회 실패:", error);
    throw error;
  }
}`;

  const reserveSeatSnippet = `// 2. 좌석 예약하기 (POST)
const BASE_URL = "${GAS_BASE_URL}";

async function reserveSeat({ seatNo, userName, email, startTime, endTime }) {
  const payload = {
    action: "reserveSeat",
    seatNo: seatNo,       // 예: "A-01"
    userName: userName,   // 예: "홍길동"
    email: email,         // 예: "user@library.ac.kr"
    startTime: startTime, // 예: "14:00"
    endTime: endTime      // 예: "18:00"
  };

  try {
    // 주의: Apps Script는 text/plain으로 전송해야 브라우저 CORS 프리플라이트(OPTIONS) 제한을 우회합니다.
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === "success") {
      console.log("예약 성공! 발급 예약번호:", result.reservationId);
      return result;
    } else {
      throw new Error(result.message || "좌석 예약에 실패했습니다.");
    }
  } catch (error) {
    console.error("좌석 예약 요청 오류:", error);
    throw error;
  }
}`;

  const cancelReservationSnippet = `// 3. 예약 취소하기 (POST)
const BASE_URL = "${GAS_BASE_URL}";

async function cancelReservation({ seatNo, reservationId }) {
  const payload = {
    action: "cancelReservation",
    seatNo: seatNo,                 // 예: "A-01"
    reservationId: reservationId   // 예: "R-35524"
  };

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === "success") {
      console.log("취소 완료:", result.message);
      return result;
    } else {
      throw new Error(result.message || "예약 취소 실패");
    }
  } catch (error) {
    console.error("예약 취소 요청 오류:", error);
    throw error;
  }
}`;

  const codeGsScript = `/**
 * 도서관 좌석 예약 시스템 - Google Apps Script (Code.gs)
 * 
 * [데이터베이스 시트 구성]
 * 1. 시트 '좌석목록': [좌석번호, 구역, 상태, 예약자명, 시작시간, 종료시간]
 *    - 구역: 디지털열람실, 노트북존, 자유열람실, 스터디존
 *    - 상태: 이용가능, 예약중, 점검중
 * 2. 시트 '예약내역': [예약번호, 좌석번호, 이용자명, 이메일, 시작시간, 종료시간, 상태, 작성일시]
 */

const SHEET_SEATS = '좌석목록';
const SHEET_RESERVATIONS = '예약내역';

/**
 * 1. GET 요청 핸들러
 * - Base_URL?action=getSeats
 */
function doGet(e) {
  try {
    const action = e.parameter ? e.parameter.action : '';

    if (action === 'getSeats') {
      const seats = getSeatsList();
      return jsonResponse({
        status: 'success',
        seats: seats
      });
    }

    return jsonResponse({
      status: 'fail',
      message: '지원하지 않는 action 요청입니다: ' + action
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * 2. POST 요청 핸들러
 * - reserveSeat: { action: 'reserveSeat', seatNo, userName, email, startTime, endTime }
 * - cancelReservation: { action: 'cancelReservation', seatNo, reservationId }
 */
function doPost(e) {
  try {
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    const action = data.action;

    // 1) 좌석 예약
    if (action === 'reserveSeat') {
      const result = reserveSeat(data);
      return jsonResponse(result);
    }

    // 2) 예약 취소
    if (action === 'cancelReservation') {
      const result = cancelReservation(data);
      return jsonResponse(result);
    }

    return jsonResponse({
      status: 'fail',
      message: '유효하지 않은 action 요청입니다: ' + action
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * 좌석 목록 조회 (시트 '좌석목록')
 */
function getSeatsList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_SEATS);

  // 시트가 없으면 자동 초기화 실행
  if (!sheet) {
    initDatabase();
    sheet = ss.getSheetByName(SHEET_SEATS);
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const seats = [];
  // 1행은 헤더 (좌석번호, 구역, 상태, 예약자명, 시작시간, 종료시간)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    seats.push({
      seatNo: String(row[0] || '').trim(),
      zone: String(row[1] || '').trim(),
      status: String(row[2] || '이용가능').trim(),
      userName: String(row[3] || '').trim(),
      startTime: formatDateTime(row[4]),
      endTime: formatDateTime(row[5])
    });
  }
  return seats;
}

/**
 * 좌석 예약 생성
 */
function reserveSeat(params) {
  const seatNo = String(params.seatNo || '').trim();
  const userName = String(params.userName || '').trim();
  const email = String(params.email || '').trim();
  const startTime = String(params.startTime || '').trim();
  const endTime = String(params.endTime || '').trim();

  if (!seatNo || !userName || !email) {
    return { status: 'fail', message: '좌석번호, 이용자명, 이메일은 필수 입력값입니다.' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const seatsSheet = ss.getSheetByName(SHEET_SEATS);
  const resSheet = ss.getSheetByName(SHEET_RESERVATIONS);

  if (!seatsSheet || !resSheet) {
    return { status: 'fail', message: '데이터베이스 시트가 준비되지 않았습니다.' };
  }

  // 1) 좌석 시트에서 해당 좌석 행 찾기
  const seatsData = seatsSheet.getDataRange().getValues();
  let seatRowIndex = -1;

  for (let i = 1; i < seatsData.length; i++) {
    if (String(seatsData[i][0]).trim() === seatNo) {
      seatRowIndex = i + 1; // 1-based index
      const currentStatus = String(seatsData[i][2]).trim();
      if (currentStatus === '예약중') {
        return { status: 'fail', message: '이미 예약되어 이용 중인 좌석입니다.' };
      }
      if (currentStatus === '점검중') {
        return { status: 'fail', message: '해당 좌석은 현재 시설 점검 중입니다.' };
      }
      break;
    }
  }

  if (seatRowIndex === -1) {
    return { status: 'fail', message: '좌석을 찾을 수 없습니다.' };
  }

  // 2) 고유 예약번호 생성 (예: R-35524)
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const reservationId = 'R-' + randNum;
  const now = new Date();
  const createdAt = Utilities.formatDate(now, Session.getScriptTimeZone() || 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  // 3) '좌석목록' 상태 갱신 [좌석번호, 구역, 상태, 예약자명, 시작시간, 종료시간]
  seatsSheet.getRange(seatRowIndex, 3).setValue('예약중');
  seatsSheet.getRange(seatRowIndex, 4).setValue(userName);
  seatsSheet.getRange(seatRowIndex, 5).setValue(startTime);
  seatsSheet.getRange(seatRowIndex, 6).setValue(endTime);

  // 4) '예약내역' 행 추가 [예약번호, 좌석번호, 이용자명, 이메일, 시작시간, 종료시간, 상태, 작성일시]
  resSheet.appendRow([
    reservationId,
    seatNo,
    userName,
    email,
    startTime,
    endTime,
    '예약완료',
    createdAt
  ]);

  return {
    status: 'success',
    message: '예약이 성공적으로 완료되었습니다.',
    reservationId: reservationId
  };
}

/**
 * 예약 취소
 */
function cancelReservation(params) {
  const seatNo = String(params.seatNo || '').trim();
  const reservationId = String(params.reservationId || '').trim();

  if (!seatNo) {
    return { status: 'fail', message: '취소할 좌석번호가 필요합니다.' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const seatsSheet = ss.getSheetByName(SHEET_SEATS);
  const resSheet = ss.getSheetByName(SHEET_RESERVATIONS);

  if (!seatsSheet) {
    return { status: 'fail', message: '좌석목록 시트를 찾을 수 없습니다.' };
  }

  // 1) '좌석목록'에서 좌석 상태 초기화 ('이용가능')
  const seatsData = seatsSheet.getDataRange().getValues();
  let seatFound = false;

  for (let i = 1; i < seatsData.length; i++) {
    if (String(seatsData[i][0]).trim() === seatNo) {
      const rowIndex = i + 1;
      seatsSheet.getRange(rowIndex, 3).setValue('이용가능');
      seatsSheet.getRange(rowIndex, 4).setValue('');
      seatsSheet.getRange(rowIndex, 5).setValue('');
      seatsSheet.getRange(rowIndex, 6).setValue('');
      seatFound = true;
      break;
    }
  }

  if (!seatFound) {
    return { status: 'fail', message: '해당 좌석번호를 찾을 수 없습니다.' };
  }

  // 2) '예약내역' 시트에서 상태를 '취소됨'으로 변경
  if (resSheet) {
    const resData = resSheet.getDataRange().getValues();
    for (let j = 1; j < resData.length; j++) {
      const matchId = reservationId && String(resData[j][0]).trim() === reservationId;
      const matchSeat = !reservationId && String(resData[j][1]).trim() === seatNo && String(resData[j][6]).trim() === '예약완료';
      if (matchId || matchSeat) {
        resSheet.getRange(j + 1, 7).setValue('취소됨');
        break;
      }
    }
  }

  return {
    status: 'success',
    message: '예약이 취소되었습니다.'
  };
}

/**
 * 날짜/시간 포맷팅 헬퍼
 */
function formatDateTime(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Seoul', 'HH:mm');
  }
  return String(val);
}

/**
 * JSON 응답 생성기 (CORS 호환)
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 초기 시트 및 20개 좌석 생성 (최초 1회 실행)
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. '좌석목록' 시트 생성
  let seatsSheet = ss.getSheetByName(SHEET_SEATS);
  if (!seatsSheet) {
    seatsSheet = ss.insertSheet(SHEET_SEATS);
  }
  seatsSheet.clear();
  seatsSheet.appendRow(['좌석번호', '구역', '상태', '예약자명', '시작시간', '종료시간']);

  const zones = [
    { prefix: 'A', name: '디지털열람실', count: 5 },
    { prefix: 'B', name: '노트북존', count: 5 },
    { prefix: 'C', name: '자유열람실', count: 5 },
    { prefix: 'D', name: '스터디존', count: 5 }
  ];

  zones.forEach(function(zone) {
    for (var i = 1; i <= zone.count; i++) {
      var seatNo = zone.prefix + '-0' + i;
      seatsSheet.appendRow([seatNo, zone.name, '이용가능', '', '', '']);
    }
  });

  // 2. '예약내역' 시트 생성
  let resSheet = ss.getSheetByName(SHEET_RESERVATIONS);
  if (!resSheet) {
    resSheet = ss.insertSheet(SHEET_RESERVATIONS);
  }
  if (resSheet.getLastRow() === 0) {
    resSheet.appendRow(['예약번호', '좌석번호', '이용자명', '이메일', '시작시간', '종료시간', '상태', '작성일시']);
  }
}
`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">도서관 좌석 예약 시스템 개발자 명세 & 가이드</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              구글 앱스 스크립트(Google Apps Script) Web App API 연동 규격 및 UI 컴포넌트 아키텍처 가이드입니다.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 truncate max-w-md">
            GAS URL: {GAS_BASE_URL}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-5 flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('code-gs')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'code-gs'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Code.gs 백엔드 소스코드</span>
          </button>
          <button
            onClick={() => setActiveTab('fetch-code')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'fetch-code'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>프론트엔드 fetch API 로직</span>
          </button>
          <button
            onClick={() => setActiveTab('db-schema')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'db-schema'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>구글 시트 DB 구조</span>
          </button>
          <button
            onClick={() => setActiveTab('style-guide')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'style-guide'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>UI 스타일 가이드 & 컬러 시스템</span>
          </button>
          <button
            onClick={() => setActiveTab('component-tree')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'component-tree'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>화면 컴포넌트 모듈 구조</span>
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>실시간 API 샌드박스 테스터</span>
          </button>
        </div>
      </div>

      {/* Tab 0: Code.gs Full Source */}
      {activeTab === 'code-gs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-slate-900">
                  Google Apps Script: Code.gs
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  (스프레드시트 확장 프로그램 → Apps Script에 붙여넣기)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(codeGsScript, 'codeGs')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shrink-0"
              >
                {copiedKey === 'codeGs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'codeGs' ? '전체 코드 복사 완료!' : 'Code.gs 전체 복사'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-100 bg-slate-950 overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto">
              <code>{codeGsScript}</code>
            </pre>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800">배포 및 설정 안내:</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-500 text-[11px] leading-relaxed">
              <li>Google Spreadsheet 상단 메뉴에서 <strong>확장 프로그램 → Apps Script</strong>를 클릭합니다.</li>
              <li>위 <code className="bg-white px-1 border border-slate-200 rounded">Code.gs</code> 전체 코드를 복사하여 붙여넣고 저장합니다.</li>
              <li>최초 설정 시 상단 함수 선택창에서 <code className="bg-white px-1 border border-slate-200 rounded">initDatabase</code>를 선택하고 <strong>실행</strong>을 누르면 20개 좌석이 시트에 자동 생성됩니다.</li>
              <li>우측 상단 <strong>배포 → 새 배포</strong>를 누르고, 유형을 <strong>웹 앱(Web App)</strong>으로 지정합니다.</li>
              <li><strong>다음 사용자로 실행</strong>: "나(본인 계정)", <strong>액세스 권한</strong>: <strong>"모든 사용자(Anyone)"</strong>로 설정 후 배포합니다.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 1: Fetch API Code */}
      {activeTab === 'fetch-code' && (
        <div className="space-y-6">
          {/* Item 1: getSeats */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-bold font-mono text-emerald-800 bg-emerald-100 rounded">
                  GET
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  Base_URL?action=getSeats
                </span>
                <span className="text-xs text-slate-400">· 좌석 전체 목록 및 상태 조회</span>
              </div>
              <button
                onClick={() => copyToClipboard(getSeatsSnippet, 'getSeats')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
              >
                {copiedKey === 'getSeats' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'getSeats' ? '복사됨' : '코드 복사'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-800 bg-slate-950 text-slate-100 overflow-x-auto leading-relaxed">
              <code>{getSeatsSnippet}</code>
            </pre>
          </div>

          {/* Item 2: reserveSeat */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-bold font-mono text-blue-800 bg-blue-100 rounded">
                  POST
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  Base_URL (action: 'reserveSeat')
                </span>
                <span className="text-xs text-slate-400">· 좌석 예약 생성 및 예약번호 발급</span>
              </div>
              <button
                onClick={() => copyToClipboard(reserveSeatSnippet, 'reserveSeat')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
              >
                {copiedKey === 'reserveSeat' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'reserveSeat' ? '복사됨' : '코드 복사'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-800 bg-slate-950 text-slate-100 overflow-x-auto leading-relaxed">
              <code>{reserveSeatSnippet}</code>
            </pre>
          </div>

          {/* Item 3: cancelReservation */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-bold font-mono text-amber-800 bg-amber-100 rounded">
                  POST
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  Base_URL (action: 'cancelReservation')
                </span>
                <span className="text-xs text-slate-400">· 예약 취소 및 좌석 상태 복원</span>
              </div>
              <button
                onClick={() => copyToClipboard(cancelReservationSnippet, 'cancelReservation')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
              >
                {copiedKey === 'cancelReservation' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'cancelReservation' ? '복사됨' : '코드 복사'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-800 bg-slate-950 text-slate-100 overflow-x-auto leading-relaxed">
              <code>{cancelReservationSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: DB Schema */}
      {activeTab === 'db-schema' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sheet 1 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">시트 1: '좌석목록' (Seats)</h4>
              <span className="text-xs text-slate-400">실시간 좌석 마스터 현황</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">컬럼명</th>
                    <th className="py-2 px-3">데이터 타입</th>
                    <th className="py-2 px-3">허용 값 및 설명</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">좌석번호</td>
                    <td className="py-2 px-3 text-slate-500">String</td>
                    <td className="py-2 px-3 text-slate-600">A-01 ~ D-05</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">구역</td>
                    <td className="py-2 px-3 text-slate-500">Enum</td>
                    <td className="py-2 px-3 text-slate-600">디지털열람실, 노트북존, 자유열람실, 스터디존</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">상태</td>
                    <td className="py-2 px-3 text-slate-500">Enum</td>
                    <td className="py-2 px-3 text-slate-600">이용가능, 예약중, 점검중</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">예약자명</td>
                    <td className="py-2 px-3 text-slate-500">String</td>
                    <td className="py-2 px-3 text-slate-600">현재 이용자 성명 (미예약 시 공백)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">시작시간</td>
                    <td className="py-2 px-3 text-slate-500">String / Date</td>
                    <td className="py-2 px-3 text-slate-600">이용 개시 시각 (HH:mm)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">종료시간</td>
                    <td className="py-2 px-3 text-slate-500">String / Date</td>
                    <td className="py-2 px-3 text-slate-600">이용 만료 시각 (HH:mm)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sheet 2 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">시트 2: '예약내역' (Reservations)</h4>
              <span className="text-xs text-slate-400">트랜잭션 로그 및 이력</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">컬럼명</th>
                    <th className="py-2 px-3">데이터 타입</th>
                    <th className="py-2 px-3">허용 값 및 설명</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">예약번호</td>
                    <td className="py-2 px-3 text-slate-500">String (PK)</td>
                    <td className="py-2 px-3 text-slate-600">R-XXXXX (고유 식별자)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">좌석번호</td>
                    <td className="py-2 px-3 text-slate-500">String (FK)</td>
                    <td className="py-2 px-3 text-slate-600">지정된 좌석 코드</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">이용자명</td>
                    <td className="py-2 px-3 text-slate-500">String</td>
                    <td className="py-2 px-3 text-slate-600">예약 신청자 이름</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">이메일</td>
                    <td className="py-2 px-3 text-slate-500">String</td>
                    <td className="py-2 px-3 text-slate-600">인증 및 본인 확인용 이메일</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">시작시간 / 종료시간</td>
                    <td className="py-2 px-3 text-slate-500">String</td>
                    <td className="py-2 px-3 text-slate-600">예약 요청 타임슬롯</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">상태</td>
                    <td className="py-2 px-3 text-slate-500">String</td>
                    <td className="py-2 px-3 text-slate-600">예약완료, 취소됨, 만료됨</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-semibold">작성일시</td>
                    <td className="py-2 px-3 text-slate-500">Timestamp</td>
                    <td className="py-2 px-3 text-slate-600">ISO 8601 생성 일시</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Style Guide */}
      {activeTab === 'style-guide' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900">도서관 좌석 시스템 디자인 가이드라인</h4>
            <p className="text-xs text-slate-500 mt-1">
              상태 인지력과 접근성을 극대화한 세련된 3원색 상태 체계 및 타이포그래피 규칙입니다.
            </p>
          </div>

          {/* Color Palettes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="text-xs font-bold text-emerald-800">이용가능 (Available)</div>
              <div className="text-[11px] text-emerald-700">에메랄드/청록 계열 팔레트</div>
              <div className="pt-2 text-[10px] font-mono text-emerald-900 space-y-1">
                <div>배경: bg-emerald-50/50</div>
                <div>경계선: border-emerald-200</div>
                <div>텍스트: text-emerald-700</div>
                <div>버튼: bg-slate-900 text-white</div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2">
              <div className="text-xs font-bold text-amber-800">예약중 (Reserved)</div>
              <div className="text-[11px] text-amber-700">앰버/주황 계열 팔레트</div>
              <div className="pt-2 text-[10px] font-mono text-amber-900 space-y-1">
                <div>배경: bg-amber-50/30</div>
                <div>경계선: border-amber-200</div>
                <div>텍스트: text-amber-700</div>
                <div>이용자 표시: text-slate-800 font-medium</div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xs font-bold text-slate-700">점검중 (Maintenance)</div>
              <div className="text-[11px] text-slate-500">슬레이트/그레이 계열 팔레트</div>
              <div className="pt-2 text-[10px] font-mono text-slate-600 space-y-1">
                <div>배경: bg-slate-50/60</div>
                <div>경계선: border-slate-200</div>
                <div>텍스트: text-slate-500</div>
                <div>비활성화: cursor-not-allowed opacity-80</div>
              </div>
            </div>
          </div>

          {/* Typography & Spacing Rules */}
          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-semibold text-slate-800 mb-1">타이포그래피 원칙</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                <li>헤드라인: Plus Jakarta Sans / Pretendard (Bold 700)</li>
                <li>본문: Noto Sans KR (Regular 400, Medium 500)</li>
                <li>좌석번호 및 시간: JetBrains Mono (font-mono tabular-nums)</li>
                <li>무의미한 캡슐형 뱃지 지양, 불릿(·) 기반의 정제된 메타데이터 표시</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-800 mb-1">CORS & 통신 최적화 규칙</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Apps Script POST 통신 시 <code className="bg-slate-100 px-1">text/plain;charset=utf-8</code> 전송</li>
                <li>브라우저 preflight(OPTIONS) 405 차단 방지</li>
                <li>서버 프록시 및 브라우저 직접 fetch 간 스마트 Fallback 구조 적용</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Component Tree */}
      {activeTab === 'component-tree' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">화면 컴포넌트 모듈 아키텍처</h4>
            <p className="text-xs text-slate-500 mt-1">
              반응형 스파크 프론트엔드 모듈 계층 구조입니다.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
            <pre>{`src/
├── App.tsx                     # 전역 상태(좌석 목록, 모달, 탭 네비게이션) 관리
├── server.ts                   # Express 프록시 엔드포인트 (/api/seats, /api/reserve, /api/cancel)
├── services/
│   └── gasApi.ts               # Google Apps Script Web App 연동 REST 통신 계층
├── types/
│   └── library.ts              # Seat, Reservation, ZoneMeta TypeScript 인터페이스
├── constants/
│   └── zones.ts                # 4대 구역 메타데이터 (디지털, 노트북, 자유, 스터디)
└── components/
    ├── Header.tsx              # 상단 바 (Top Bar 3-Zone Contract 준수)
    ├── StatsBar.tsx            # 실시간 통계 바 (총 좌석, 이용가능, 예약중, 이용률)
    ├── SeatCard.tsx            # 좌석 상태별 시각 카드 (A-01 ~ D-05)
    ├── FloorPlanView.tsx       # 2D 인터랙티브 도서관 평면도 배치 뷰
    ├── ReservationModal.tsx    # 예약 신청 모달 폼 (이용자명, 이메일, 시간, 수칙)
    ├── MyReservationsView.tsx  # 내 예약 이메일 검색 & 취소 모듈
    └── ApiSpecsView.tsx        # 개발자 API 명세, 코드 복사, 샌드박스 테스터`}</pre>
          </div>
        </div>
      )}

      {/* Tab 5: Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900">실시간 Google Apps Script API 테스터 (샌드박스)</h4>
            <p className="text-xs text-slate-500 mt-1">
              실제 Google Apps Script 엔드포인트로 직접 요청을 전송하고 반환되는 JSON 응답을 실시간으로 확인합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Request Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  테스트할 API 액션 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSandboxAction('getSeats')}
                    className={`py-2 text-xs font-medium rounded-md border text-center transition-colors ${
                      sandboxAction === 'getSeats'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    GET getSeats
                  </button>
                  <button
                    type="button"
                    onClick={() => setSandboxAction('reserveSeat')}
                    className={`py-2 text-xs font-medium rounded-md border text-center transition-colors ${
                      sandboxAction === 'reserveSeat'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    POST reserveSeat
                  </button>
                  <button
                    type="button"
                    onClick={() => setSandboxAction('cancelReservation')}
                    className={`py-2 text-xs font-medium rounded-md border text-center transition-colors ${
                      sandboxAction === 'cancelReservation'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    POST cancelReservation
                  </button>
                </div>
              </div>

              {sandboxAction !== 'getSeats' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">좌석번호 (seatNo)</label>
                    <input
                      type="text"
                      value={sandboxSeatNo}
                      onChange={(e) => setSandboxSeatNo(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded"
                    />
                  </div>

                  {sandboxAction === 'reserveSeat' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">이용자명 (userName)</label>
                          <input
                            type="text"
                            value={sandboxName}
                            onChange={(e) => setSandboxName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">이메일 (email)</label>
                          <input
                            type="email"
                            value={sandboxEmail}
                            onChange={(e) => setSandboxEmail(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">시작시간 (startTime)</label>
                          <input
                            type="text"
                            value={sandboxStartTime}
                            onChange={(e) => setSandboxStartTime(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">종료시간 (endTime)</label>
                          <input
                            type="text"
                            value={sandboxEndTime}
                            onChange={(e) => setSandboxEndTime(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {sandboxAction === 'cancelReservation' && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">예약번호 (reservationId)</label>
                      <input
                        type="text"
                        value={sandboxResId}
                        onChange={(e) => setSandboxResId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={runSandbox}
                disabled={sandboxLoading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {sandboxLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Apps Script 호출 중...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>API 요청 전송하기</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">응답 결과 (Response Payload)</span>
                {sandboxResponse && (
                  <button
                    onClick={() => copyToClipboard(sandboxResponse, 'sandboxRes')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {copiedKey === 'sandboxRes' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>응답 복사</span>
                  </button>
                )}
              </div>
              <div className="h-72 p-3 bg-slate-950 text-slate-100 rounded-md font-mono text-[11px] overflow-auto">
                {sandboxResponse ? (
                  <pre>{sandboxResponse}</pre>
                ) : (
                  <div className="text-slate-500 flex items-center justify-center h-full">
                    좌측 폼에서 'API 요청 전송하기' 버튼을 누르면 실시간 응답이 여기에 출력됩니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
