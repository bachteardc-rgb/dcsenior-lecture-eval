/**
 * 대치노인복지관 사회교육프로그램 강의평가
 *
 * 이 파일은 build-install.ps1 이 자동으로 만든 것입니다.
 * 원본은 apps-script 폴더의 .gs 파일 5개이며, 고칠 때는 원본을 고치고
 * build-install.ps1 을 다시 실행하세요.
 * 만든 날짜: 2026-10-13 15:40
 */


/* ==========================================================================
 *  Config.gs
 * ========================================================================== */

/**
 * Config.gs — 설정, 프로그램 목록, 문항 정의
 * 대치노인복지관 2026년 하반기 사회교육프로그램 강의평가
 *
 * 평가 차수가 바뀌면 CONFIG.ROUND 와 '프로그램' 시트만 수정하면 됩니다.
 *
 * [문항 구조]
 *   과목별 반복 : Q4 강의(3) · Q5 · Q6 운영(3) · Q7 · Q8 시설(3) · Q9 · Q11 재참여
 *   1인 1회     : Q10 전반만족도 · Q12 타프로그램 참여의향 · Q13 희망강좌 · Q14 기타의견
 *
 * [시트 구조]
 *   응답자정보 : 응답자ID + 성함·연락처   ← 평가 종료 후 이 시트만 삭제하면 개인정보 파기
 *   응답자공통 : 응답자ID + 공통 문항 응답
 *   응답원자료 : 응답자ID + 과목별 평가 (1행 = 1과목)
 */

var CONFIG = {
  // 평가 차수. 차수가 바뀌면 이 값만 바꾸세요.
  ROUND: '2026년 하반기',

  CENTER_NAME: '대치노인복지관',
  SURVEY_TITLE: '사회교육프로그램 강의평가',

  // 시트 이름
  SHEET_RESPONDENTS: '응답자정보',
  SHEET_COMMON: '응답자공통',
  SHEET_RESPONSES: '응답원자료',
  SHEET_PROGRAMS: '프로그램',
  SHEET_SUMMARY: '집계표',
  SHEET_COMMENTS: '주관식의견',
  SHEET_GUIDE: '문항안내',
  SHEET_HISTORY: '수정이력',

  // 스크립트 속성 키
  PROP_SSID: 'SPREADSHEET_ID',
  PROP_ADMIN_PW: 'ADMIN_PASSWORD',
  PROP_PERIOD: 'SURVEY_PERIOD',

  // 응답 수가 이 값 미만인 프로그램은 익명성 보호를 위해 개별 수치를 공개하지 않음
  MIN_N_FOR_DISCLOSURE: 5,

  // 개인정보 보유 기간 안내 문구
  PRIVACY_RETENTION: '평가 종료 후 1년',

  // 저장 위치 고지 문구. 빈 문자열('')로 두면 동의 화면에서 이 항목이 사라집니다.
  // 구글시트는 해외 서버이므로 기본값으로 고지합니다.
  PRIVACY_STORAGE: '구글 클라우드 서버(해외)',

  // 한 응답자가 한 번에 선택할 수 있는 최대 과목 수. 0 이면 제한 없음(전체 선택 가능).
  MAX_PROGRAMS: 0
};

/** 전체 제목 — '2026년 하반기 사회교육프로그램 강의평가' */
function fullTitle() {
  return CONFIG.ROUND + ' ' + CONFIG.SURVEY_TITLE;
}

/** 5점 척도 정의 (매우 만족 = 5점) */
var SCALE = [
  { v: 5, label: '매우 만족' },
  { v: 4, label: '만족' },
  { v: 3, label: '보통' },
  { v: 2, label: '불만족' },
  { v: 1, label: '매우 불만족' }
];

/**
 * 프로그램 목록 (기본값)
 * 설치 후에는 '프로그램' 시트에서 수정하며, 시트 값이 우선 적용됩니다.
 *
 * code    : 고정 코드. 절대 바꾸지 마세요 (차수 간 비교에 사용)
 * teacher : 강사명. 입력해두면 응답에 자동으로 붙습니다.
 * quota   : 수강 인원(명부 기준 숫자만). 입력해두면 응답률이 계산됩니다.
 */
var PROGRAMS = [
  { code: 'P01', name: '가요',             day: '월', time: '09:30-10:20', teacher: '', quota: 0 },
  { code: 'P02', name: '왕초보영어',        day: '월', time: '09:30-10:20', teacher: '', quota: 0 },
  { code: 'P03', name: 'K-POP 댄스',        day: '월', time: '10:30-11:20', teacher: '', quota: 0 },
  { code: 'P04', name: '영어 회화',         day: '월', time: '10:30-11:20', teacher: '', quota: 0 },
  { code: 'P05', name: '가곡',             day: '월', time: '13:00-13:50', teacher: '', quota: 0 },
  { code: 'P06', name: '우쿨렐레',          day: '월', time: '13:00-13:50', teacher: '', quota: 0 },
  { code: 'P07', name: '합창',             day: '월', time: '14:00-14:50', teacher: '', quota: 0 },
  { code: 'P08', name: '첫걸음 중국어',      day: '월', time: '15:00-15:50', teacher: '', quota: 0 },
  { code: 'P09', name: '실전 활용 중국어',   day: '월', time: '16:00-16:50', teacher: '', quota: 0 },

  { code: 'P10', name: '클래식기타',        day: '화', time: '09:30-11:00', teacher: '', quota: 0 },
  { code: 'P11', name: '일본어와 현지회화',  day: '화', time: '10:30-11:20', teacher: '', quota: 0 },
  { code: 'P12', name: '라틴댄스',          day: '화', time: '14:30-15:20', teacher: '', quota: 0 },

  { code: 'P13', name: '힐링요가',          day: '수', time: '09:30-10:20', teacher: '', quota: 0 },
  { code: 'P14', name: '실버필라테스',      day: '수', time: '10:30-11:20', teacher: '', quota: 0 },
  { code: 'P15', name: '감성수채화',        day: '수', time: '10:30-11:30', teacher: '', quota: 0 },
  { code: 'P16', name: '태극권',           day: '수', time: '15:00-15:50', teacher: '', quota: 0 },

  { code: 'P17', name: '라인댄스',          day: '목', time: '09:30-10:20', teacher: '', quota: 0 },
  { code: 'P18', name: '웨스턴댄스',        day: '목', time: '10:30-11:20', teacher: '', quota: 0 },
  { code: 'P19', name: '입문 일본어',       day: '목', time: '09:30-10:20', teacher: '', quota: 0 },
  { code: 'P20', name: '초급 일본어',       day: '목', time: '10:30-11:20', teacher: '', quota: 0 },
  { code: 'P21', name: '아트캘리',          day: '목', time: '13:00-14:00', teacher: '', quota: 0 },
  { code: 'P22', name: '숟가락난타',        day: '목', time: '15:00-15:50', teacher: '', quota: 0 },

  { code: 'P23', name: '우리춤체조',        day: '금', time: '11:00-11:50', teacher: '', quota: 0 },
  { code: 'P24', name: '코어체조',          day: '금', time: '13:00-13:50', teacher: '', quota: 0 }
];

var DAY_ORDER = ['월', '화', '수', '목', '금'];

/* ===================================================================
 * 과목별 반복 문항
 * =================================================================== */

/**
 * 척도 문항 3개 영역 — 수강 과목마다 반복해서 묻습니다.
 * 한 과목의 세 영역을 모두 한 화면에 보여주고, 기타 의견은 맨 아래 한 칸만 받습니다.
 */
var SECTIONS = [
  {
    id: 'A',
    key: '강의',
    title: '강의평가',
    items: [
      { id: 'Q4_1', text: '강의 난이도는 적절합니까?' },
      { id: 'Q4_2', text: '강의 진도는 적절합니까?' },
      { id: 'Q4_3', text: '강의 내용이 이해하기 쉽고 흥미로웠습니까?' }
    ]
  },
  {
    id: 'B',
    key: '운영',
    title: '프로그램 운영 및 관리 평가',
    items: [
      { id: 'Q6_1', text: '추첨제 수강신청 방식에 대해 만족합니까?' },
      { id: 'Q6_2', text: '출결관리 방식은 적절하다고 생각합니까?' },
      { id: 'Q6_3', text: '운영 일정(수업시간, 회차, 기간 등)은 적절합니까?' }
    ]
  },
  {
    id: 'C',
    key: '시설',
    title: '시설 및 환경 평가',
    items: [
      { id: 'Q8_1', text: '프로그램이 진행된 장소(프로그램실 또는 소그룹실)의 환경에 만족하십니까?' },
      { id: 'Q8_2', text: '프로그램 운영에 필요한 기자재(음향, 냉난방 등) 환경에 만족합니까?' },
      { id: 'Q8_3', text: '시설 이용환경(접근성, 청결도, 편의성 등)에 만족합니까?' }
    ]
  }
];

/**
 * 과목별 기타 의견 — 과목마다 한 칸만 받습니다.
 * (예전에는 강의 Q5 · 운영 Q7 · 시설 Q9 로 나뉘어 있었습니다)
 */
var PROGRAM_COMMENT = {
  id: 'Q5',
  label: '이 과목에 대한 기타 의견',
  hint: '강의 내용, 운영(시간·인원·출결), 시설·기자재 등 무엇이든 자유롭게 적어주세요'
};

/**
 * 과목별 의향 문항 — 이 과목을 다시 들을 것인지
 * text         : 통계·보고서에 쓰는 표기
 * textTemplate : 설문 화면 표기. {프로그램} 자리에 과목명이 들어갑니다.
 *                예) '가요 프로그램 재참여 의향이 있습니까?'
 */
var PROGRAM_INTENT = {
  id: 'Q11',
  text: '차기 동일 프로그램 재참여 의향',
  textTemplate: '{프로그램} 프로그램 재참여 의향이 있습니까?'
};

/* ===================================================================
 * 1인 1회 공통 문항
 * =================================================================== */

/** 기관 전반 만족도 (응답자당 1회) */
var OVERALL = {
  id: 'Q10',
  text: CONFIG.CENTER_NAME + ' 사회교육프로그램 전반적 만족도'
};

/** 타 프로그램 참여 의향 (응답자당 1회) */
var COMMON_INTENT = {
  id: 'Q12',
  text: '다른 프로그램에도 참여 의향이 있습니까?'
};

/** 자유응답 문항 (응답자당 1회) */
var FREE_ITEMS = [
  {
    id: 'Q13',
    text: '신규 사회교육프로그램 개설 희망 강좌',
    hint: '진행되고 있는 동아리, 사회교육프로그램 제외 (예: 인문학 등)'
  },
  {
    id: 'Q14',
    text: '기타 의견',
    hint: '기관 이용, 프로그램 운영, 개선 건의사항 등 자유롭게 작성해주세요'
  }
];

/**
 * 주관식 의견 유형 사전 — 같은 뜻의 의견을 묶어 빈도를 세는 데 씁니다.
 *
 * 예) "수업시간이 더 길었으면 좋겠음" + "가요 수업연장"  →  '수업 시간 연장 요청' 2건
 *
 * words 는 띄어쓰기·문장부호를 없앤 상태로 비교하므로 붙여서 적으세요.
 * 위에 있는 규칙이 먼저 적용됩니다. 기관 상황에 맞게 자유롭게 추가·수정하세요.
 */
var OPINION_RULES = [
  // --- 구체적인 요청·불만을 먼저 잡습니다 ---
  { tag: '수업 시간 연장 요청',
    words: ['시간이더', '시간더', '시간을더', '시간을늘', '시간늘', '길었으면', '길면좋', '길게',
            '연장', '좀더길', '시간이짧', '시간이너무짧', '1시간이상'] },
  { tag: '수업 횟수·기간 확대 요청',
    words: ['횟수', '주2회', '주두번', '더자주', '회차늘', '자주했으면', '기간이짧', '기간을늘'] },
  { tag: '수강 인원·추첨 개선 요청',
    words: ['인원', '정원', '추첨', '떨어져', '떨어집', '떨어지는', '대기', '경쟁', '신청이어', '신청하기'] },
  { tag: '교실 공간 협소',
    words: ['좁아', '좁은', '좁습', '비좁', '넓은곳', '넓은교실', '공간이부족', '움직이기불편'] },
  { tag: '음향 개선 필요',
    words: ['음향', '마이크', '스피커', '소리가', '안들려', '잘안들', '들리지않', '안들립'] },
  { tag: '냉난방·공기 개선 필요',
    words: ['덥', '춥', '에어컨', '난방', '온도', '환기'] },
  { tag: '기자재 개선 필요',
    words: ['기자재', '장비', '책상', '의자', '거울', '매트', '악기', '빔프로젝'] },
  { tag: '시설 청결·편의 개선',
    words: ['청결', '화장실', '엘리베이터', '주차', '계단', '지저분'] },
  { tag: '교재·자료 요청',
    words: ['교재', '악보', '프린트', '유인물', '교본', '자료가', '자료를'] },
  { tag: '진도가 빠름',
    words: ['빠르', '빨라', '빠른', '빨리', '진도가빨', '따라가기힘', '따라가기어'] },
  { tag: '진도가 느림',
    words: ['느리', '느려', '느린', '천천히', '지루'] },
  { tag: '난이도 어려움',
    words: ['어렵', '어려워', '어려운', '힘들', '수준이높'] },
  { tag: '난이도 쉬움',
    words: ['너무쉽', '너무쉬', '쉬워서', '수준이낮'] },
  { tag: '강사 개선 요청',
    words: ['불친절', '강사를바', '선생님을바', '설명이부족', '설명이어'] },

  // --- 그다음 칭찬·일반 만족 ---
  { tag: '강좌 계속 개설 희망',
    words: ['계속', '다음에도', '또듣고', '또수강', '재개설', '유지했으면', '없어지지', '폐강하지'] },
  { tag: '수업·강사 만족 (칭찬)',
    words: ['친절', '잘가르', '잘지도', '열정', '최고', '훌륭', '재미있', '유익', '적당해', '적당하',
            '이해하기쉽', '좋았', '감사'] },
  { tag: '특이사항 없음 · 전반 만족',
    words: ['없음', '없습니다', '없다', '만족합니다', '만족해', '좋습니다', '좋아요', '괜찮'] }
];

/** 규칙에 안 걸린 의견을 서로 비교할 때 쓰는 유사도 기준 (0~1, 높을수록 엄격) */
var OPINION_SIMILARITY = 0.45;

/** 주관식 키워드 자동 분류 사전 */
var KEYWORD_RULES = [
  { tag: '강사',      words: ['강사', '선생', '교수', '지도', '쌤'] },
  { tag: '시간/일정',  words: ['시간', '일정', '요일', '회차', '기간', '횟수', '늘려', '연장'] },
  { tag: '인원',      words: ['인원', '정원', '추첨', '신청', '대기', '경쟁'] },
  { tag: '시설/환경',  words: ['장소', '교실', '공간', '좁', '넓', '청결', '화장실', '엘리베이터', '주차'] },
  { tag: '기자재',    words: ['음향', '마이크', '스피커', '냉방', '난방', '에어컨', '히터', '기자재', '장비', '책상', '의자'] },
  { tag: '난이도/진도', words: ['난이도', '어렵', '쉽', '진도', '빠르', '느리', '수준'] },
  { tag: '교재',      words: ['교재', '책', '악보', '프린트', '자료'] }
];

/* ===================================================================
 * 시트 헤더 정의 (순서 고정)
 * =================================================================== */

/**
 * 문항 열의 머리글을 "번호 + 줄바꿈 + 문항 내용" 으로 만듭니다.
 *
 *   Q4_1
 *   강의 난이도는 적절합니까?
 *
 * 첫 줄(번호)이 그 열의 '열쇠' 입니다. 통계·저장은 전부 첫 줄만 보고 찾으므로
 * 둘째 줄의 문구는 마음대로 바꾸셔도 집계가 틀어지지 않습니다.
 */
function qHeader_(id, text) {
  return id + '\n' + String(text || '');
}

/** 머리글에서 열쇠(첫 줄)만 꺼냅니다. 줄바꿈이 없으면 그대로 돌려줍니다. */
function headerCode_(h) {
  var s = String(h == null ? '' : h);
  var i = s.indexOf('\n');
  return i > 0 ? s.slice(0, i) : s;
}

/** 머리글 목록에서 열쇠로 열 번호(0부터)를 찾습니다. */
function headerIndex_(headers, key) {
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === key || headerCode_(headers[i]) === key) return i;
  }
  return -1;
}

/** 응답자정보 — 식별정보. 평가 종료 후 이 시트만 삭제하면 개인정보가 파기됩니다. */
function buildRespondentHeaders() {
  return ['응답자ID', '평가차수', '성함', '연락처', '개인정보동의', '최초제출일시', '최종수정일시'];
}

/**
 * 응답자공통 — 1인 1회 문항
 * 성함·연락처는 보기 편하도록 함께 적어둡니다.
 * (원본은 응답자정보 시트이며, purgeRespondentInfo() 는 세 시트를 모두 지웁니다)
 */
function buildCommonHeaders() {
  var h = ['응답자ID', '성함', '연락처', '평가차수', '제출일시', '최종수정일시', '수정횟수',
           '선택과목', '선택과목코드', '선택과목수', '완료과목수', '공통문항완료'];
  h.push(qHeader_(OVERALL.id, OVERALL.text));
  h.push(qHeader_(COMMON_INTENT.id, COMMON_INTENT.text));
  FREE_ITEMS.forEach(function (it) { h.push(qHeader_(it.id, it.text)); });
  return h;
}

/** 수정이력 — 덮어쓰기 전 내용을 남겨 추적할 수 있게 합니다 */
function buildHistoryHeaders() {
  return ['기록일시', '구분', '응답자ID', '대상', '수정 전 내용'];
}

/** 응답원자료 — 1행 = 응답자 1명의 과목 1개 평가 */
function buildEvalHeaders() {
  var h = ['평가ID', '응답자ID', '성함', '연락처',
           '제출일시', '최종수정일시', '수정횟수', '평가차수',
           '프로그램코드', '프로그램명', '요일', '시간', '강사명'];

  SECTIONS.forEach(function (sec) {
    sec.items.forEach(function (it) { h.push(qHeader_(it.id, it.text)); });
  });
  h.push(qHeader_(PROGRAM_COMMENT.id, PROGRAM_COMMENT.label));
  h.push(qHeader_(PROGRAM_INTENT.id,
    PROGRAM_INTENT.textTemplate.replace('{프로그램}', '이 과목')));

  SECTIONS.forEach(function (sec) { h.push(sec.key + '영역평균'); });
  h.push('과목평균');

  return h;
}

/* ===================================================================
 * 문항 평탄화
 * =================================================================== */

/** 과목별 척도 문항 전체 */
function evalScaleItems() {
  var out = [];
  SECTIONS.forEach(function (sec) {
    sec.items.forEach(function (it) {
      out.push({ id: it.id, text: it.text, section: sec.key, sectionTitle: sec.title });
    });
  });
  return out;
}

/** 과목별 주관식 문항 (과목당 한 칸) */
function evalCommentItems() {
  return [{ id: PROGRAM_COMMENT.id, label: PROGRAM_COMMENT.label, section: '과목' }];
}

/* ===================================================================
 * 설문 화면 설정 전달
 * =================================================================== */

/**
 * 설문 설정(문항·과목·기간)을 돌려줍니다.
 *
 * 화면이 열릴 때마다 호출되는데, 내용은 거의 바뀌지 않으면서
 * 프로그램 시트를 매번 읽습니다. 여러 분이 한꺼번에 들어오시면
 * 그만큼 느려지므로 60초 동안은 읽어둔 값을 다시 씁니다.
 * (과목을 고치시면 늦어도 1분 안에 반영됩니다)
 */
function getSurveyConfig() {
  var cache = null;
  try { cache = CacheService.getScriptCache(); } catch (e) {}
  if (cache) {
    var hit = cache.get(CFG_CACHE_KEY);
    if (hit) { try { return JSON.parse(hit); } catch (e) {} }
  }
  var cfg = buildSurveyConfig_();
  if (cache) { try { cache.put(CFG_CACHE_KEY, JSON.stringify(cfg), 60); } catch (e) {} }
  return cfg;
}

var CFG_CACHE_KEY = 'surveyConfig';

/** 설정 캐시를 지웁니다 — 기간을 바꾸면 바로 반영되도록 */
function clearConfigCache_() {
  try { CacheService.getScriptCache().remove(CFG_CACHE_KEY); } catch (e) {}
}

function buildSurveyConfig_() {
  return {
    round: CONFIG.ROUND,
    centerName: CONFIG.CENTER_NAME,
    surveyTitle: CONFIG.SURVEY_TITLE,
    fullTitle: fullTitle(),
    retention: CONFIG.PRIVACY_RETENTION,
    storage: CONFIG.PRIVACY_STORAGE,
    period: periodState_(),
    maxPrograms: CONFIG.MAX_PROGRAMS,
    scale: SCALE,
    programs: getPrograms().map(function (p) {
      return { code: p.code, name: p.name, day: p.day, time: p.time };
    }),
    dayOrder: DAY_ORDER,
    sections: SECTIONS,
    programComment: PROGRAM_COMMENT,
    programIntent: PROGRAM_INTENT,
    overall: OVERALL,
    commonIntent: COMMON_INTENT,
    frees: FREE_ITEMS
  };
}

function findProgram(code) {
  var list = getPrograms();
  for (var i = 0; i < list.length; i++) {
    if (list[i].code === code) return list[i];
  }
  return null;
}

/* ===================================================================
 * 열 머리글 설명 — 시트에서 Q4_1 같은 칸이 무슨 문항인지 알려줍니다.
 *
 *   · 머리글 칸에 메모로 붙습니다 (칸 오른쪽 위 작은 삼각형, 마우스를 올리면 보임)
 *   · '문항안내' 시트에도 같은 내용이 표로 정리됩니다
 * =================================================================== */

var SCALE_NOTE = '1 매우 불만족 · 2 불만족 · 3 보통 · 4 만족 · 5 매우 만족';
var YESNO_NOTE = '1 = 있음 · 0 = 없음';

/** 머리글 → 설명 */
function headerNoteMap() {
  var m = {
    '응답자ID': '응답자 한 분에게 자동으로 붙는 번호입니다. 같은 분의 과목 평가는 모두 이 번호로 묶입니다.',
    '평가ID': '과목 평가 한 건에 자동으로 붙는 번호입니다. (응답자ID + 프로그램코드)',
    '성함': '응답자가 직접 입력한 이름입니다. 개인정보 — 외부에 줄 파일에서는 지우세요.',
    '연락처': '응답자가 직접 입력한 휴대전화 번호입니다. 개인정보 — 외부에 줄 파일에서는 지우세요.',
    '평가차수': CONFIG.ROUND + ' 처럼 이번 평가가 몇 차인지 적힙니다.',
    '제출일시': '처음 저장한 시각입니다.',
    '최초제출일시': '처음 저장한 시각입니다.',
    '최종수정일시': '마지막으로 고친 시각입니다. 제출일시와 같으면 한 번만 쓰고 안 고친 것입니다.',
    '수정횟수': '평가 기간 안에 다시 들어와 고친 횟수입니다. 0이면 처음 쓴 그대로입니다.',
    '개인정보동의': '설문 첫 화면에서 동의하신 기록입니다. (Y = 동의)',
    '선택과목': '이 분이 평가하겠다고 고른 과목 이름입니다.',
    '선택과목코드': '위 과목의 코드입니다. 시스템이 이어하기를 처리할 때 씁니다. (고치지 마세요)',
    '선택과목수': '고른 과목이 몇 개인지입니다.',
    '완료과목수': '그중 실제로 평가를 끝낸 과목 수입니다. 선택과목수보다 적으면 아직 안 끝낸 분입니다.',
    '공통문항완료': '마지막 공통문항(Q10·Q12·Q13·Q14)까지 마쳤으면 Y 입니다.',
    '프로그램코드': '프로그램 시트의 코드입니다. (P01, P02 …)',
    '프로그램명': '평가 대상 과목 이름입니다.',
    '요일': '프로그램 시트에서 가져온 수업 요일입니다.',
    '시간': '프로그램 시트에서 가져온 수업 시간입니다.',
    '강사명': '프로그램 시트에서 가져온 강사 이름입니다.',
    '과목평균': '이 과목에 매긴 척도 문항 9개의 평균입니다. (5점 만점)',
    '기록일시': '덮어쓰기가 일어난 시각입니다.',
    '구분': '어떤 내용이 덮어쓰였는지입니다.',
    '대상': '덮어쓰인 과목 또는 공통문항입니다.',
    '수정 전 내용': '고치기 전의 답입니다. 성함·연락처는 남기지 않습니다.'
  };

  SECTIONS.forEach(function (sec) {
    m[sec.key + '영역평균'] = '[' + sec.title + '] 영역 문항 '
      + sec.items.length + '개의 평균입니다. (5점 만점)';
    sec.items.forEach(function (it) {
      m[it.id] = '[' + sec.title + ']\n' + it.text + '\n\n' + SCALE_NOTE
        + '\n집계 단위: 평가건수 (과목마다 1개)';
    });
  });

  m[PROGRAM_COMMENT.id] = '[과목 기타 의견]\n' + PROGRAM_COMMENT.label
    + '\n\n주관식 — 과목마다 1칸\n집계 단위: 평가건수';
  m[PROGRAM_INTENT.id] = '[과목별 재참여 의향]\n'
    + PROGRAM_INTENT.textTemplate.replace('{프로그램}', '이 과목')
    + '\n\n' + YESNO_NOTE + '\n집계 단위: 평가건수 (과목마다 1개)';
  m[OVERALL.id] = '[종합]\n' + OVERALL.text
    + '\n\n' + SCALE_NOTE + '\n집계 단위: 응답자 (한 분당 1개)';
  m[COMMON_INTENT.id] = '[기관 전체]\n' + COMMON_INTENT.text
    + '\n\n' + YESNO_NOTE + '\n집계 단위: 응답자 (한 분당 1개)';

  FREE_ITEMS.forEach(function (it) {
    m[it.id] = '[기관 전체 주관식]\n' + it.text
      + (it.hint ? '\n(' + it.hint + ')' : '')
      + '\n\n집계 단위: 응답자 (한 분당 1개)';
  });

  return m;
}

/** 문항안내 시트에 넣을 표 — [번호, 문항, 영역, 집계 단위, 보기, 기록되는 시트] */
function questionGuideRows() {
  var rows = [];

  SECTIONS.forEach(function (sec) {
    sec.items.forEach(function (it) {
      rows.push([it.id, it.text, sec.title, '평가건수', SCALE_NOTE, CONFIG.SHEET_RESPONSES]);
    });
  });

  rows.push([PROGRAM_COMMENT.id, PROGRAM_COMMENT.label, '과목 기타 의견',
             '평가건수', '주관식', CONFIG.SHEET_RESPONSES]);
  rows.push([PROGRAM_INTENT.id, PROGRAM_INTENT.textTemplate.replace('{프로그램}', '이 과목'),
             '재참여 의향', '평가건수', YESNO_NOTE, CONFIG.SHEET_RESPONSES]);

  rows.push([OVERALL.id, OVERALL.text, '종합 만족도',
             '응답자', SCALE_NOTE, CONFIG.SHEET_COMMON]);
  rows.push([COMMON_INTENT.id, COMMON_INTENT.text, '타 프로그램 참여 의향',
             '응답자', YESNO_NOTE, CONFIG.SHEET_COMMON]);

  FREE_ITEMS.forEach(function (it) {
    rows.push([it.id, it.text + (it.hint ? ' (' + it.hint + ')' : ''), '기관 전체 주관식',
               '응답자', '주관식', CONFIG.SHEET_COMMON]);
  });

  return rows;
}


/* ==========================================================================
 *  Code.gs
 * ========================================================================== */

/**
 * Code.gs — 웹앱 진입점, 초기 설치, 응답 저장
 *
 * 저장 흐름
 *   1. startSession      이름·연락처 확인 → 응답자ID 발급 (이미 있으면 이어하기 정보 반환)
 *   2. setSelection      수강 과목 선택 결과 기록
 *   3. saveProgramEval   과목 1개 평가 저장 (과목이 끝날 때마다 즉시 호출)
 *   4. saveCommon        공통 문항 저장 → 완료
 */

/* ===================================================================
 * 1. 초기 설치 — 최초 1회만 실행하세요
 * =================================================================== */

function setup() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty(CONFIG.PROP_SSID);
  var ss = null;

  // ① 이미 연결해 둔 스프레드시트가 있으면 그대로 씁니다
  if (ssId) {
    try { ss = SpreadsheetApp.openById(ssId); } catch (e) { ss = null; }
  }

  // ② 이 스크립트가 스프레드시트에 붙어 있으면(확장 프로그램 > Apps Script)
  //    새로 만들지 않고 그 파일을 데이터 저장소로 씁니다.
  if (!ss) {
    try {
      var bound = SpreadsheetApp.getActiveSpreadsheet();
      if (bound) {
        ss = bound;
        props.setProperty(CONFIG.PROP_SSID, ss.getId());
        var sheets = ss.getSheets();
        if (sheets.length === 1 && sheets[0].getLastRow() === 0) {
          sheets[0].setName(CONFIG.SHEET_RESPONSES);   // 빈 '시트1' 재활용
        }
      }
    } catch (e) {
      ss = null;
    }
  }

  // ③ 둘 다 아니면(독립 프로젝트) 새 스프레드시트를 만듭니다
  if (!ss) {
    ss = SpreadsheetApp.create(CONFIG.CENTER_NAME + ' ' + fullTitle());
    props.setProperty(CONFIG.PROP_SSID, ss.getId());
    ss.getSheets()[0].setName(CONFIG.SHEET_RESPONSES);
  }

  ensureEvalSheet_(ss);
  ensureRespondentSheet_(ss);
  ensureCommonSheet_(ss);
  ensureHistorySheet_(ss);
  ensureProgramSheet_(ss);
  ensureGuideSheet_(ss);

  if (!props.getProperty(CONFIG.PROP_ADMIN_PW)) {
    setAdminPassword('dcsenior' + new Date().getFullYear());
  }

  var msg =
    '설치가 완료되었습니다.\n\n' +
    '제목: ' + fullTitle() + '\n' +
    '데이터가 쌓일 스프레드시트: ' + ss.getName() + '\n' +
    '  ' + ss.getUrl() + '\n' +
    '관리자 초기 비밀번호: dcsenior' + new Date().getFullYear() + '\n' +
    '  → setAdminPassword(\'새비밀번호\') 로 반드시 변경하세요.\n\n' +
    '다음 단계: [배포] > [새 배포] > 유형 [웹 앱]\n' +
    '  - 실행 사용자: 나\n' +
    '  - 액세스 권한: 모든 사용자\n';
  Logger.log(msg);
  return msg;
}

function setAdminPassword(newPassword) {
  if (!newPassword || String(newPassword).length < 4) {
    throw new Error('비밀번호는 4자 이상이어야 합니다.');
  }
  PropertiesService.getScriptProperties()
    .setProperty(CONFIG.PROP_ADMIN_PW, hashPw_(String(newPassword)));
  return '비밀번호가 변경되었습니다.';
}

function hashPw_(pw) {
  var raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, 'dcsenior$' + pw, Utilities.Charset.UTF_8);
  return raw.map(function (b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2);
  }).join('');
}

/* ===================================================================
 * 2. 시트 준비
 * =================================================================== */

function ensureHeaders_(ss, name, headers, color) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  var current = sh.getLastColumn() > 0
    ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];

  if (current.join('|') !== headers.join('|')) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  var head = sh.getRange(1, 1, 1, headers.length);
  head.setFontWeight('bold')
    .setBackground(color || '#1f3864')
    .setFontColor('#ffffff')
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('center')
    .setWrap(true);
  sh.setFrozenRows(1);

  // 문항 머리글(두 줄짜리)은 글이 길어 칸을 넓히고 머리글 줄을 높입니다
  var hasQuestion = false;
  headers.forEach(function (h, i) {
    if (headerCode_(h) !== h) {
      hasQuestion = true;
      try { sh.setColumnWidth(i + 1, 150); } catch (e) {}
    }
  });
  if (hasQuestion) {
    head.setFontSize(9);
    try { sh.setRowHeight(1, 108); } catch (e) {}
  }

  applyHeaderNotes_(sh, headers);
  return sh;
}

/**
 * 머리글 칸에 "무슨 문항인지" 설명을 메모로 붙입니다.
 * 시트에서 Q4_1 칸에 마우스를 올리면 문항 내용이 뜹니다.
 */
function applyHeaderNotes_(sh, headers) {
  try {
    var map = headerNoteMap();
    var notes = headers.map(function (h) { return map[headerCode_(h)] || ''; });
    sh.getRange(1, 1, 1, headers.length).setNotes([notes]);
  } catch (e) {}
}

function ensureEvalSheet_(ss) {
  return ensureHeaders_(ss, CONFIG.SHEET_RESPONSES, buildEvalHeaders(), '#1f3864');
}

/** 식별정보 시트 — 색을 달리해 구분합니다 */
function ensureRespondentSheet_(ss) {
  var sh = ensureHeaders_(ss, CONFIG.SHEET_RESPONDENTS, buildRespondentHeaders(), '#843c0c');
  sh.setTabColor('#c55a11');
  return sh;
}

function ensureCommonSheet_(ss) {
  return ensureHeaders_(ss, CONFIG.SHEET_COMMON, buildCommonHeaders(), '#2f5597');
}

function ensureHistorySheet_(ss) {
  var sh = ensureHeaders_(ss, CONFIG.SHEET_HISTORY, buildHistoryHeaders(), '#7f7f7f');
  sh.setTabColor('#a6a6a6');
  return sh;
}

/** 응답자ID 로 성함·연락처를 찾습니다. 없거나 파기된 경우 빈 값입니다. */
function respondentInfo_(rid) {
  try {
    var rs = readSheet_(CONFIG.SHEET_RESPONDENTS);
    for (var i = 0; i < rs.rows.length; i++) {
      if (String(rs.rows[i]['응답자ID']) === String(rid)) {
        return {
          name: String(rs.rows[i]['성함'] || ''),
          phone: String(rs.rows[i]['연락처'] || '')
        };
      }
    }
  } catch (e) {}
  return { name: '', phone: '' };
}

/**
 * 덮어쓰기 전의 내용을 수정이력 시트에 남깁니다.
 * 응답 자체는 1인 1행을 유지하되, 바뀐 기록은 추적할 수 있게 합니다.
 */
function archiveBefore_(kind, rid, target, oldObj, headers) {
  try {
    var ss = getSS_();
    var sh = ensureHistorySheet_(ss);
    var parts = [];
    headers.forEach(function (h) {
      var k = headerCode_(h);   // 이력은 짧게 — 번호만 남깁니다 (Q4_1=5)
      // 개인정보는 이력에 남기지 않습니다 (파기 때 지울 수 없게 되므로)
      if (k === '응답자ID' || k === '평가차수' || k === '_row' ||
          k === '성함' || k === '연락처') return;
      var v = oldObj[h];
      if (v instanceof Date) v = Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
      if (v === '' || v === null || v === undefined) return;
      parts.push(k + '=' + v);
    });
    sh.appendRow([new Date(), kind, rid, target, parts.join(' | ')]);
  } catch (e) {
    // 이력 기록 실패가 응답 저장을 막아서는 안 됩니다
    Logger.log('수정이력 기록 실패: ' + e.message);
  }
}

function ensureProgramSheet_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_PROGRAMS);
  if (sh) return sh;

  sh = ss.insertSheet(CONFIG.SHEET_PROGRAMS);
  var head = ['프로그램코드', '프로그램명', '요일', '시간', '강사명', '수강인원', '사용여부'];
  sh.getRange(1, 1, 1, head.length).setValues([head])
    .setFontWeight('bold').setBackground('#1f3864').setFontColor('#ffffff');
  sh.setFrozenRows(1);

  var rows = PROGRAMS.map(function (p) {
    return [p.code, p.name, p.day, p.time, p.teacher, p.quota, 'Y'];
  });
  sh.getRange(2, 1, rows.length, head.length).setValues(rows);
  sh.autoResizeColumns(1, head.length);
  return sh;
}

/**
 * 문항안내 시트 — Q4_1 같은 번호가 무슨 문항인지 한눈에 보는 표입니다.
 * setup() 을 실행할 때마다 현재 문항 구성에 맞춰 다시 그립니다.
 */
function ensureGuideSheet_(ss) {
  var sh = ss.getSheetByName(CONFIG.SHEET_GUIDE);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_GUIDE);
  sh.clear();
  try { sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart(); } catch (e) {}

  var head = ['번호', '문항', '영역', '집계 단위', '보기(응답값)', '기록되는 시트'];
  var body = questionGuideRows();
  var W = head.length;

  var rows = [];
  rows.push(['문항 안내 — 시트에 적힌 Q 번호가 무슨 문항인지 보는 표입니다', '', '', '', '', '']);
  rows.push(head);
  body.forEach(function (r) { rows.push(r); });
  rows.push(['', '', '', '', '', '']);
  rows.push(['집계 단위 "평가건수" = 과목마다 1개씩 쌓입니다. 3과목을 들으신 분은 3개가 됩니다.',
             '', '', '', '', '']);
  rows.push(['집계 단위 "응답자" = 한 분당 1개만 쌓입니다. 과목을 몇 개 들으셔도 1개입니다.',
             '', '', '', '', '']);
  rows.push(['그래서 전반적 만족도(' + OVERALL.id + ')의 응답 수는 과목 평가 건수보다 적은 것이 정상입니다.',
             '', '', '', '', '']);

  sh.getRange(1, 1, rows.length, W).setValues(rows);

  sh.getRange(1, 1, 1, W).merge()
    .setFontWeight('bold').setFontSize(12)
    .setBackground('#1f3864').setFontColor('#ffffff')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  sh.getRange(2, 1, 1, W)
    .setFontWeight('bold').setBackground('#d9e2f3').setHorizontalAlignment('center');

  var last = 2 + body.length;
  sh.getRange(3, 1, body.length, W).setVerticalAlignment('middle');
  sh.getRange(3, 2, body.length, 1).setWrap(true);
  sh.getRange(3, 1, body.length, W).setBorder(true, true, true, true, true, true,
    '#bfbfbf', SpreadsheetApp.BorderStyle.SOLID);

  for (var i = 0; i < body.length; i++) {
    if (body[i][3] === '응답자') {
      sh.getRange(3 + i, 1, 1, W).setBackground('#fff2cc');
    }
  }

  sh.getRange(last + 2, 1, 3, 1).setFontColor('#7f6000').setFontSize(10);

  sh.setColumnWidth(1, 70);
  sh.setColumnWidth(2, 380);
  sh.setColumnWidth(3, 150);
  sh.setColumnWidth(4, 90);
  sh.setColumnWidth(5, 240);
  sh.setColumnWidth(6, 110);
  sh.setFrozenRows(2);
  sh.setTabColor('#2f5597');
  return sh;
}

/* ===================================================================
 * 3. 공통 접근자
 * =================================================================== */

function getSS_() {
  var id = PropertiesService.getScriptProperties().getProperty(CONFIG.PROP_SSID);
  if (!id) throw new Error('설치가 되지 않았습니다. setup() 함수를 먼저 실행하세요.');
  return SpreadsheetApp.openById(id);
}

function getSpreadsheetUrl(token) {
  checkToken_(token);
  return getSS_().getUrl();
}

/** 시트를 객체 배열로 읽습니다. */
function readSheet_(name) {
  var ss = getSS_();
  var sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return { sheet: sh, headers: [], rows: [] };

  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();

  var rows = values.map(function (r, i) {
    var o = { _row: i + 2 };
    headers.forEach(function (h, c) {
      o[h] = r[c];
      // 머리글이 "Q4_1 ⏎ 강의 난이도는 적절합니까?" 처럼 두 줄이면
      // 첫 줄(Q4_1)로도 찾을 수 있게 같은 값을 하나 더 넣어 둡니다.
      var k = headerCode_(h);
      if (k !== h) o[k] = r[c];
    });
    return o;
  });
  return { sheet: sh, headers: headers, rows: rows };
}

/**
 * 프로그램 목록을 '프로그램' 시트에서 읽습니다.
 * 시트가 없거나 비어 있으면 Config.gs 의 PROGRAMS 를 사용합니다.
 */
function getPrograms() {
  try {
    var sh = getSS_().getSheetByName(CONFIG.SHEET_PROGRAMS);
    if (!sh || sh.getLastRow() < 2) return PROGRAMS;

    var values = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
    var out = [];
    values.forEach(function (r) {
      if (!r[0] || String(r[6]).toUpperCase() === 'N') return;
      out.push({
        code: String(r[0]).trim(),
        name: String(r[1]).trim(),
        day: String(r[2]).trim(),
        time: String(r[3]).trim(),
        teacher: String(r[4] || '').trim(),
        quota: Number(r[5]) || 0
      });
    });
    return out.length ? out : PROGRAMS;
  } catch (e) {
    return PROGRAMS;
  }
}

/* ===================================================================
 * 4. 웹앱 라우팅
 * =================================================================== */

/**
 * 설문 화면(survey)은 Vercel에서 받아갑니다. 이 스크립트는 그 화면에
 * 문항을 내려주고 답을 받아 적는 JSON API 역할을 합니다.
 *
 *   GET  ?action=config   문항·안내문구·기간을 JSON으로 내려준다
 *   GET  ?action=ping     살아있는지 확인 → {"ok":true,"data":"pong"}
 *   POST {action, args}   아래 API_ACTIONS 의 함수를 호출하고 결과를 돌려준다
 *
 * 관리자 화면(?page=admin)은 예전처럼 이 주소에서 그대로 열립니다.
 * 관리자는 PC 브라우저로 접속하므로 카카오톡 문제가 없습니다.
 */

/** Vercel 화면이 호출할 수 있는 함수 목록. 여기 없는 이름은 거부됩니다. */
var API_ACTIONS = {
  startSession:    startSession,
  setSelection:    setSelection,
  saveProgramEval: saveProgramEval,
  saveCommon:      saveCommon
};

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;

  if (action) {
    try {
      if (action === 'config') return json_({ ok: true, data: getSurveyConfig() });
      if (action === 'ping')   return json_({ ok: true, data: 'pong' });
      return json_({ ok: false, message: '알 수 없는 요청입니다.' });
    } catch (err) {
      return json_({ ok: false, message: String(err && err.message || err) });
    }
  }

  var page = (e && e.parameter && e.parameter.page) || 'survey';
  var file = (page === 'admin') ? 'admin' : 'survey';

  var t = HtmlService.createTemplateFromFile(file);
  t.cfg = JSON.stringify(getSurveyConfig());

  return t.evaluate()
    .setTitle(CONFIG.CENTER_NAME + ' ' + fullTitle())
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=5')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Vercel 화면에서 보낸 저장 요청을 처리합니다.
 *
 * 받는 모양 : { "action": "saveCommon", "args": [응답자ID, 답변객체] }
 * 돌려주는 것: 해당 함수가 원래 돌려주던 객체 그대로 ({ok:true,...} / {ok:false,...})
 *
 * 화면 쪽 코드를 고치지 않아도 되도록, google.script.run 이 넘기던 인자를
 * args 배열에 그대로 담아 보내고 여기서 펼쳐서 호출합니다.
 *
 * ※ 잠금(LockService)은 startSession·setSelection·saveProgramEval·saveCommon
 *   각 함수가 이미 안에서 걸고 있으므로 여기서 또 걸지 않습니다.
 */
function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, code: 'BAD_REQUEST', message: '요청 형식이 올바르지 않습니다.' });
  }

  var fn = Object.prototype.hasOwnProperty.call(API_ACTIONS, req.action)
             ? API_ACTIONS[req.action] : null;
  if (!fn) {
    return json_({ ok: false, code: 'UNKNOWN_ACTION', message: '알 수 없는 요청입니다.' });
  }

  try {
    return json_(fn.apply(null, req.args || []));
  } catch (err) {
    return json_({ ok: false, code: 'ERROR', message: String(err && err.message || err) });
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* ===================================================================
 * 4-1. 평가 접수 기간
 *
 *   mode = 'auto'   시작일~종료일 사이에만 열림 (둘 다 비면 항상 열림)
 *          'open'   기간과 무관하게 지금 열기
 *          'closed' 기간과 무관하게 지금 닫기
 *   날짜는 'yyyy-MM-dd' (한국 시간 기준). 종료일 당일 밤 12시까지 받습니다.
 * =================================================================== */

function todayStr_() {
  return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
}

function getPeriod_() {
  var raw = PropertiesService.getScriptProperties().getProperty(CONFIG.PROP_PERIOD);
  var p = { from: '', to: '', mode: 'auto' };
  if (raw) {
    try {
      var o = JSON.parse(raw);
      p.from = String(o.from || '');
      p.to = String(o.to || '');
      p.mode = (o.mode === 'open' || o.mode === 'closed') ? o.mode : 'auto';
    } catch (e) {}
  }
  return p;
}

/** 지금 설문을 받을 수 있는 상태인지 판정합니다. */
function periodState_() {
  var p = getPeriod_();
  var today = todayStr_();
  var open, state, message;

  if (p.mode === 'open') {
    open = true; state = 'forced_open';
    message = '평가를 받고 있습니다.';
  } else if (p.mode === 'closed') {
    open = false; state = 'forced_closed';
    message = '현재 평가를 받고 있지 않습니다.';
  } else if (!p.from && !p.to) {
    open = true; state = 'no_period';
    message = '평가를 받고 있습니다.';
  } else if (p.from && today < p.from) {
    open = false; state = 'before';
    message = '평가 기간이 아직 시작되지 않았습니다.';
  } else if (p.to && today > p.to) {
    open = false; state = 'after';
    message = '평가 기간이 종료되었습니다.';
  } else {
    open = true; state = 'in_period';
    message = '평가를 받고 있습니다.';
  }

  return {
    open: open, state: state, message: message,
    from: p.from, to: p.to, mode: p.mode, today: today
  };
}

/** 저장 계열 함수가 공통으로 쓰는 기간 확인 */
function guardPeriod_() {
  var st = periodState_();
  if (st.open) return null;
  return {
    ok: false, code: 'CLOSED', period: st,
    message: st.message + ' 자세한 사항은 복지관으로 문의해 주세요.'
  };
}

/** 관리자 화면 — 현재 기간 설정 조회 */
function getPeriodInfo(token) {
  checkToken_(token);
  return periodState_();
}

/** 관리자 화면 — 기간 설정 저장 */
function setPeriod(token, from, to, mode) {
  clearConfigCache_();
  checkToken_(token);

  function clean(d) {
    d = String(d || '').trim();
    if (!d) return '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error('날짜 형식이 올바르지 않습니다: ' + d);
    return d;
  }
  var f = clean(from);
  var t = clean(to);
  if (f && t && f > t) throw new Error('시작일이 종료일보다 늦습니다.');

  var m = (mode === 'open' || mode === 'closed') ? mode : 'auto';
  PropertiesService.getScriptProperties()
    .setProperty(CONFIG.PROP_PERIOD, JSON.stringify({ from: f, to: t, mode: m }));

  return periodState_();
}

/* ===================================================================
 * 5. 전화번호 처리
 * =================================================================== */

/** 숫자만 남깁니다 (중복 판정·검색용) */
function normalizePhone_(s) {
  return String(s || '').replace(/[^0-9]/g, '');
}

/** 010-1234-5678 형태로 정리합니다 (시트 표시용) */
function formatPhone_(s) {
  var d = normalizePhone_(s);
  if (d.length === 11) return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
  return d;
}

/* ===================================================================
 * 6. 1단계 — 세션 시작 (이어하기 포함)
 * =================================================================== */

/**
 * payload = { name, phone, consent }
 * 반환   = { ok, respondentId, doneCodes[], selectedCodes[], commonDone, resumed }
 */
function startSession(payload) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) {
    return { ok: false, code: 'BUSY', message: '잠시 후 다시 시도해 주세요.' };
  }

  try {
    var closed = guardPeriod_();
    if (closed) return closed;

    if (!payload || !payload.consent) {
      return { ok: false, code: 'NO_CONSENT', message: '개인정보 수집·이용에 동의해 주세요.' };
    }
    var name = String(payload.name || '').trim();
    if (!name) return { ok: false, code: 'NO_NAME', message: '성함을 입력해 주세요.' };

    var digits = normalizePhone_(payload.phone);
    if (digits.length < 10 || digits.length > 11) {
      return { ok: false, code: 'BAD_PHONE', message: '휴대폰번호를 정확히 입력해 주세요.' };
    }

    var ss = getSS_();
    ensureRespondentSheet_(ss);
    var rs = readSheet_(CONFIG.SHEET_RESPONDENTS);

    var found = null;
    for (var i = rs.rows.length - 1; i >= 0; i--) {
      var r = rs.rows[i];
      if (String(r['평가차수']) === CONFIG.ROUND &&
          String(r['성함']).trim() === name &&
          normalizePhone_(r['연락처']) === digits) {
        found = r;
        break;
      }
    }

    var rid, resumed = false;
    if (found) {
      rid = String(found['응답자ID']);
      resumed = true;
      rs.sheet.getRange(found._row, rs.headers.indexOf('최종수정일시') + 1).setValue(new Date());
    } else {
      rid = Utilities.getUuid();
      var row = buildRowFromMap_(buildRespondentHeaders(), {
        '응답자ID': rid,
        '평가차수': CONFIG.ROUND,
        '성함': name,
        '연락처': formatPhone_(digits),
        '개인정보동의': 'Y',
        '최초제출일시': new Date(),
        '최종수정일시': new Date()
      });
      ensureRespondentSheet_(ss).appendRow(row);
    }

    var state = getSessionState_(rid);
    return {
      ok: true,
      respondentId: rid,
      resumed: resumed,
      doneCodes: state.doneCodes,
      selectedCodes: state.selectedCodes,
      commonDone: state.commonDone
    };
  } catch (err) {
    return { ok: false, code: 'ERROR', message: String(err && err.message || err) };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/** 응답자ID 기준으로 진행 상태를 읽습니다. */
function getSessionState_(rid) {
  var doneCodes = [];
  readSheet_(CONFIG.SHEET_RESPONSES).rows.forEach(function (r) {
    if (String(r['응답자ID']) === rid) doneCodes.push(String(r['프로그램코드']));
  });

  var selectedCodes = [], commonDone = false;
  var cs = readSheet_(CONFIG.SHEET_COMMON);
  for (var i = 0; i < cs.rows.length; i++) {
    if (String(cs.rows[i]['응답자ID']) === rid) {
      // 선택과목 열에는 과목'이름'이, 선택과목코드 열에는 코드가 들어 있습니다.
      // 코드 열이 비어 있으면(예전 기록) 선택과목 열을 코드로 읽어 봅니다.
      var raw = String(cs.rows[i]['선택과목코드'] || '').trim();
      if (!raw) raw = String(cs.rows[i]['선택과목'] || '').trim();
      selectedCodes = raw ? raw.split(',').map(function (x) { return x.trim(); }).filter(String) : [];
      commonDone = String(cs.rows[i]['공통문항완료']).toUpperCase() === 'Y';
      break;
    }
  }
  return { doneCodes: doneCodes, selectedCodes: selectedCodes, commonDone: commonDone };
}

/* ===================================================================
 * 7. 2단계 — 수강 과목 선택 기록
 * =================================================================== */

/** 코드 목록 → 과목 이름 목록. 이름을 못 찾으면 코드를 그대로 둡니다. */
function programNames_(codes) {
  var list = getPrograms();
  var byCode = {};
  list.forEach(function (p) { byCode[p.code] = p.name; });
  return (codes || []).map(function (c) { return byCode[c] || c; });
}

/** codes = ['P01','P15','P24'] */
function setSelection(respondentId, codes) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) {
    return { ok: false, code: 'BUSY', message: '잠시 후 다시 시도해 주세요.' };
  }

  try {
    var closed = guardPeriod_();
    if (closed) return closed;

    var rid = String(respondentId || '');
    if (!rid) return { ok: false, code: 'NO_SESSION', message: '처음부터 다시 진행해 주세요.' };

    var list = (codes || []).map(function (c) { return String(c).trim(); }).filter(String);
    if (!list.length) return { ok: false, code: 'NO_PROGRAM', message: '과목을 선택해 주세요.' };
    if (CONFIG.MAX_PROGRAMS > 0 && list.length > CONFIG.MAX_PROGRAMS) {
      return { ok: false, code: 'TOO_MANY', message: '한 번에 ' + CONFIG.MAX_PROGRAMS + '개까지 선택할 수 있습니다.' };
    }

    upsertCommon_(rid, {
      '선택과목': programNames_(list).join(', '),
      '선택과목코드': list.join(','),
      '선택과목수': list.length
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, code: 'ERROR', message: String(err && err.message || err) };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/* ===================================================================
 * 8. 3단계 — 과목 1개 평가 저장
 * =================================================================== */

/**
 * payload = { programCode, Q4_1..Q4_3, Q5, Q6_1..Q6_3, Q7, Q8_1..Q8_3, Q9, Q11 }
 * 같은 응답자·같은 과목이면 덮어씁니다.
 */
function saveProgramEval(respondentId, payload) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) {
    return { ok: false, code: 'BUSY', message: '잠시 후 다시 시도해 주세요.' };
  }

  try {
    var closed = guardPeriod_();
    if (closed) return closed;

    var rid = String(respondentId || '');
    if (!rid) return { ok: false, code: 'NO_SESSION', message: '처음부터 다시 진행해 주세요.' };

    var v = validateEval_(payload);
    if (!v.ok) return v;

    var prog = findProgram(String(payload.programCode).trim());
    if (!prog) return { ok: false, code: 'BAD_PROGRAM', message: '과목을 다시 선택해 주세요.' };

    var ss = getSS_();
    var sh = ensureEvalSheet_(ss);
    var headers = buildEvalHeaders();
    var es = readSheet_(CONFIG.SHEET_RESPONSES);

    var target = -1, prior = null;
    for (var i = 0; i < es.rows.length; i++) {
      if (String(es.rows[i]['응답자ID']) === rid &&
          String(es.rows[i]['프로그램코드']) === prog.code) {
        target = es.rows[i]._row;
        prior = es.rows[i];
        break;
      }
    }

    // 덮어쓰기 전 내용을 이력으로 남깁니다
    if (prior) archiveBefore_('과목평가', rid, prog.name, prior, headers);

    var row = buildEvalRow_(headers, payload, prog, rid, prior, respondentInfo_(rid));
    if (target > 0) sh.getRange(target, 1, 1, headers.length).setValues([row]);
    else sh.appendRow(row);

    var state = getSessionState_(rid);
    upsertCommon_(rid, { '완료과목수': state.doneCodes.length });

    return { ok: true, doneCodes: state.doneCodes, replaced: target > 0 };
  } catch (err) {
    return { ok: false, code: 'ERROR', message: String(err && err.message || err) };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function validateEval_(p) {
  if (!p) return { ok: false, code: 'EMPTY', message: '응답이 비어 있습니다.' };
  if (!String(p.programCode || '').trim()) {
    return { ok: false, code: 'NO_PROGRAM', message: '과목을 선택해 주세요.' };
  }

  var missing = [];
  evalScaleItems().forEach(function (it) {
    var val = Number(p[it.id]);
    if (!(val >= 1 && val <= 5)) missing.push(it.id);
  });
  var q11 = Number(p[PROGRAM_INTENT.id]);
  if (q11 !== 0 && q11 !== 1) missing.push(PROGRAM_INTENT.id);

  if (missing.length) {
    return { ok: false, code: 'MISSING', missing: missing, message: '답변하지 않은 문항이 있습니다.' };
  }
  return { ok: true };
}

/** prior 가 있으면 수정으로 보고, 최초 제출일시를 유지하며 수정 횟수를 1 올립니다. */
function buildEvalRow_(headers, p, prog, rid, prior, who) {
  var now = new Date();
  who = who || { name: '', phone: '' };
  var map = {
    '평가ID': (prior && prior['평가ID'])
      ? prior['평가ID']
      : 'E' + Utilities.formatDate(now, 'Asia/Seoul', 'yyMMddHHmmss') +
        '-' + Math.floor(Math.random() * 900 + 100),
    '응답자ID': rid,
    '성함': who.name,
    '연락처': who.phone,
    '제출일시': (prior && prior['제출일시']) ? prior['제출일시'] : now,
    '최종수정일시': prior ? now : '',
    '수정횟수': prior ? (Number(prior['수정횟수']) || 0) + 1 : 0,
    '평가차수': CONFIG.ROUND,
    '프로그램코드': prog.code,
    '프로그램명': prog.name,
    '요일': prog.day,
    '시간': prog.time,
    '강사명': prog.teacher || ''
  };

  var all = [];
  SECTIONS.forEach(function (sec) {
    var vals = [];
    sec.items.forEach(function (it) {
      var n = Number(p[it.id]);
      map[it.id] = n;
      vals.push(n);
      all.push(n);
    });
    map[sec.key + '영역평균'] = round2_(mean_(vals));
  });

  map[PROGRAM_COMMENT.id] = String(p[PROGRAM_COMMENT.id] || '').trim();
  map[PROGRAM_INTENT.id] = Number(p[PROGRAM_INTENT.id]);
  map['과목평균'] = round2_(mean_(all));

  return buildRowFromMap_(headers, map);
}

/* ===================================================================
 * 9. 4단계 — 공통 문항 저장
 * =================================================================== */

/** payload = { Q10, Q12, Q13, Q14 } */
function saveCommon(respondentId, payload) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) {
    return { ok: false, code: 'BUSY', message: '잠시 후 다시 시도해 주세요.' };
  }

  try {
    var closed = guardPeriod_();
    if (closed) return closed;

    var rid = String(respondentId || '');
    if (!rid) return { ok: false, code: 'NO_SESSION', message: '처음부터 다시 진행해 주세요.' };
    if (!payload) return { ok: false, code: 'EMPTY', message: '응답이 비어 있습니다.' };

    var missing = [];
    var q10 = Number(payload[OVERALL.id]);
    if (!(q10 >= 1 && q10 <= 5)) missing.push(OVERALL.id);
    var q12 = Number(payload[COMMON_INTENT.id]);
    if (q12 !== 0 && q12 !== 1) missing.push(COMMON_INTENT.id);
    if (missing.length) {
      return { ok: false, code: 'MISSING', missing: missing, message: '답변하지 않은 문항이 있습니다.' };
    }

    var state = getSessionState_(rid);
    if (!state.doneCodes.length) {
      return { ok: false, code: 'NO_EVAL', message: '먼저 과목 평가를 진행해 주세요.' };
    }

    // 이미 공통문항을 작성한 적이 있으면 이력을 남기고 수정 횟수를 올립니다
    var cs = readSheet_(CONFIG.SHEET_COMMON);
    var prior = null;
    for (var i = 0; i < cs.rows.length; i++) {
      if (String(cs.rows[i]['응답자ID']) === rid) { prior = cs.rows[i]; break; }
    }
    var isEdit = !!(prior && String(prior['공통문항완료']).toUpperCase() === 'Y');
    if (isEdit) archiveBefore_('공통문항', rid, '기관 전체 문항', prior, buildCommonHeaders());

    var patch = {
      '완료과목수': state.doneCodes.length,
      '공통문항완료': 'Y'
    };
    if (isEdit) {
      patch['최종수정일시'] = new Date();
      patch['수정횟수'] = (Number(prior['수정횟수']) || 0) + 1;
    } else {
      patch['제출일시'] = new Date();
      patch['수정횟수'] = 0;
    }
    patch[OVERALL.id] = q10;
    patch[COMMON_INTENT.id] = q12;
    FREE_ITEMS.forEach(function (it) {
      patch[it.id] = String(payload[it.id] || '').trim();
    });

    upsertCommon_(rid, patch);
    return { ok: true, doneCount: state.doneCodes.length };
  } catch (err) {
    return { ok: false, code: 'ERROR', message: String(err && err.message || err) };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/** 응답자공통 시트의 해당 행을 만들거나 일부 열만 갱신합니다. */
function upsertCommon_(rid, patch) {
  var ss = getSS_();
  var sh = ensureCommonSheet_(ss);
  var headers = buildCommonHeaders();
  var cs = readSheet_(CONFIG.SHEET_COMMON);

  var target = -1;
  for (var i = 0; i < cs.rows.length; i++) {
    if (String(cs.rows[i]['응답자ID']) === rid) { target = cs.rows[i]._row; break; }
  }

  if (target < 0) {
    var who = respondentInfo_(rid);
    var base = {
      '응답자ID': rid, '성함': who.name, '연락처': who.phone,
      '평가차수': CONFIG.ROUND, '제출일시': new Date(), '공통문항완료': 'N'
    };
    Object.keys(patch).forEach(function (k) { base[k] = patch[k]; });
    sh.appendRow(buildRowFromMap_(headers, base));
    return;
  }

  Object.keys(patch).forEach(function (k) {
    var ci = headerIndex_(headers, k);
    if (ci >= 0) sh.getRange(target, ci + 1).setValue(patch[k]);
  });
}

/* ===================================================================
 * 10. 계산 유틸
 * =================================================================== */

function buildRowFromMap_(headers, map) {
  return headers.map(function (h) {
    if (h in map) return map[h];
    var k = headerCode_(h);          // 두 줄짜리 머리글은 첫 줄로도 찾습니다
    return (k in map) ? map[k] : '';
  });
}

function mean_(arr) {
  if (!arr || !arr.length) return 0;
  var s = 0;
  for (var i = 0; i < arr.length; i++) s += Number(arr[i]) || 0;
  return s / arr.length;
}

function round2_(n) {
  return Math.round(n * 100) / 100;
}

/* ===================================================================
 * 11. 관리자 인증
 * =================================================================== */

function adminLogin(password) {
  var stored = PropertiesService.getScriptProperties().getProperty(CONFIG.PROP_ADMIN_PW);
  if (!stored) return { ok: false, message: '설치가 완료되지 않았습니다. setup()을 실행하세요.' };

  Utilities.sleep(400);
  if (hashPw_(String(password || '')) !== stored) {
    return { ok: false, message: '비밀번호가 올바르지 않습니다.' };
  }
  return { ok: true, token: makeToken_() };
}

function makeToken_() {
  var t = Utilities.getUuid();
  CacheService.getScriptCache().put('tok_' + t, '1', 21600); // 6시간
  return t;
}

function checkToken_(token) {
  if (!token) throw new Error('인증이 필요합니다. 다시 로그인해 주세요.');
  if (!CacheService.getScriptCache().get('tok_' + token)) {
    throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
  }
  return true;
}


/* ==========================================================================
 *  Stats.gs
 * ========================================================================== */

/**
 * Stats.gs — 통계 계산
 *
 * 집계 단위가 두 가지입니다.
 *   평가 단위 (평가건수) : Q4 강의 · Q6 운영 · Q8 시설 · Q11 재참여
 *                          → 한 사람이 3과목을 들으면 3건으로 집계됩니다.
 *   응답자 단위 (1인 1표) : Q10 전반만족도 · Q12 · Q13 · Q14
 *                          → 다과목 수강자가 과대 대표되지 않습니다.
 */

/* ===================================================================
 * 필터 옵션
 * =================================================================== */

function getFilterOptions(token) {
  checkToken_(token);

  var rounds = {};
  readSheet_(CONFIG.SHEET_RESPONSES).rows.forEach(function (r) {
    if (r['평가차수']) rounds[String(r['평가차수'])] = true;
  });

  var list = Object.keys(rounds).sort().reverse();
  if (list.indexOf(CONFIG.ROUND) === -1) list.unshift(CONFIG.ROUND);

  return {
    rounds: list,
    currentRound: CONFIG.ROUND,
    programs: getPrograms(),
    days: DAY_ORDER
  };
}

/* ===================================================================
 * 통계 본체
 * =================================================================== */

/** filter = { round, programCode, day } — 관리자 화면에서 호출 */
function getStats(token, filter) {
  checkToken_(token);
  return computeStats_(filter || {});
}

/** 로그인 확인 없이 계산만 합니다. 스프레드시트 메뉴에서도 씁니다. */
function computeStats_(filter) {
  filter = filter || {};

  var programs = getPrograms();
  var progMap = {};
  programs.forEach(function (p) { progMap[p.code] = p; });

  // --- 평가 단위 데이터 ---
  var evals = readSheet_(CONFIG.SHEET_RESPONSES).rows.filter(function (r) {
    if (!r['평가ID']) return false;
    if (filter.round && String(r['평가차수']) !== filter.round) return false;
    if (filter.programCode && String(r['프로그램코드']) !== filter.programCode) return false;
    if (filter.day && String(r['요일']) !== filter.day) return false;
    return true;
  });

  // --- 응답자 단위 데이터 (필터에 걸린 평가를 한 사람만) ---
  var ridSet = {};
  evals.forEach(function (r) { ridSet[String(r['응답자ID'])] = true; });

  var commonAll = readSheet_(CONFIG.SHEET_COMMON).rows.filter(function (r) {
    if (!r['응답자ID']) return false;
    if (filter.round && String(r['평가차수']) !== filter.round) return false;
    return ridSet[String(r['응답자ID'])] === true;
  });
  var commons = commonAll.filter(function (r) {
    return String(r['공통문항완료']).toUpperCase() === 'Y';
  });

  // 응답자ID → 성함·연락처 (주관식 의견에 작성자를 붙이는 데 씁니다)
  var people = {};
  readSheet_(CONFIG.SHEET_RESPONDENTS).rows.forEach(function (r) {
    if (!r['응답자ID']) return;
    people[String(r['응답자ID'])] = {
      name: String(r['성함'] || ''),
      phone: String(r['연락처'] || '')
    };
  });

  return {
    meta: buildMeta_(evals, commons, commonAll, ridSet, filter, progMap),
    items: buildItemStats_(evals, commons),
    sections: buildSectionStats_(evals, commons),
    intents: buildIntentStats_(evals, commons),
    programs: buildProgramStats_(evals, programs),
    crossTabs: buildCrossTabs_(evals, programs),
    participation: buildParticipation_(evals, commonAll, ridSet),
    comments: buildComments_(evals, commons, people),
    opinions: buildOpinionGroups_(evals, commons, people),
    wishes: buildWishes_(commons),
    keywords: buildKeywordCounts_(evals, commons, ridSet)
  };
}

/** 낮은 점수 → 높은 점수 순서 (보고서 표 순서) */
function scaleAsc() {
  return SCALE.slice().sort(function (a, b) { return a.v - b.v; });
}

function buildMeta_(evals, commons, commonAll, ridSet, filter, progMap) {
  var respondentN = Object.keys(ridSet).length;

  var codes = {};
  evals.forEach(function (r) { codes[String(r['프로그램코드'])] = true; });

  var quota = 0;
  Object.keys(codes).forEach(function (c) {
    if (progMap[c]) quota += Number(progMap[c].quota) || 0;
  });

  var overallVals = pluck_(commons, OVERALL.id);
  var courseMeans = [];
  evals.forEach(function (r) {
    var v = Number(r['과목평균']);
    if (v > 0) courseMeans.push(v);
  });

  return {
    round: filter.round || CONFIG.ROUND,
    centerName: CONFIG.CENTER_NAME,
    surveyTitle: CONFIG.SURVEY_TITLE,
    fullTitle: (filter.round || CONFIG.ROUND) + ' ' + CONFIG.SURVEY_TITLE,
    filterProgram: filter.programCode || '',
    filterDay: filter.day || '',

    respondentN: respondentN,
    evalN: evals.length,
    commonN: commons.length,
    avgPrograms: respondentN ? round2_(evals.length / respondentN) : 0,
    programCount: Object.keys(codes).length,

    totalQuota: quota,
    responseRate: quota > 0 ? round1_(evals.length / quota * 100) : null,

    overallMean: round2_(mean_(overallVals)),
    overallPositive: positiveRate_(overallVals),
    courseMean: round2_(mean_(courseMeans)),
    courseScore100: score100_(mean_(courseMeans)),

    minN: CONFIG.MIN_N_FOR_DISCLOSURE,
    generatedAt: Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm')
  };
}

/** 문항별 빈도 / 비율 / 평균 / 표준편차 / 긍정응답률 */
function buildItemStats_(evals, commons) {
  var out = [];

  evalScaleItems().forEach(function (it) {
    out.push(itemStat_(evals, it.id, it.text, it.section, '평가'));
  });
  out.push(itemStat_(commons, OVERALL.id, OVERALL.text, '종합', '응답자'));

  return out;
}

function itemStat_(rows, id, text, section, unit) {
  var vals = pluck_(rows, id);
  var freq = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  vals.forEach(function (v) { if (freq[v] !== undefined) freq[v]++; });

  var n = vals.length;
  var pct = {};
  [5, 4, 3, 2, 1].forEach(function (k) { pct[k] = n ? round1_(freq[k] / n * 100) : 0; });

  var m = mean_(vals);
  return {
    id: id, text: text, section: section, unit: unit,
    n: n, freq: freq, pct: pct,
    mean: round2_(m), sd: round2_(sd_(vals)),
    score100: score100_(m),
    positiveRate: positiveRate_(vals),
    negativeRate: negativeRate_(vals)
  };
}

/** 영역별 평균 */
function buildSectionStats_(evals, commons) {
  var out = SECTIONS.map(function (sec) {
    var vals = [];
    evals.forEach(function (r) {
      sec.items.forEach(function (it) {
        var v = Number(r[it.id]);
        if (v >= 1 && v <= 5) vals.push(v);
      });
    });
    var m = mean_(vals);
    return {
      key: sec.key, title: sec.title, unit: '평가',
      itemCount: sec.items.length,
      n: vals.length, base: evals.length,
      mean: round2_(m), sd: round2_(sd_(vals)),
      score100: score100_(m), positiveRate: positiveRate_(vals)
    };
  });

  var ov = pluck_(commons, OVERALL.id);
  var ovm = mean_(ov);
  out.push({
    key: '종합', title: '전반적 만족도', unit: '응답자',
    itemCount: 1, n: ov.length, base: commons.length,
    mean: round2_(ovm), sd: round2_(sd_(ov)),
    score100: score100_(ovm), positiveRate: positiveRate_(ov)
  });

  return out;
}

/** 의향 문항 — Q11 은 과목별, Q12 는 1인 1회 */
function buildIntentStats_(evals, commons) {
  return [
    yesNoStat_(evals, PROGRAM_INTENT.id, PROGRAM_INTENT.text, '평가'),
    yesNoStat_(commons, COMMON_INTENT.id, COMMON_INTENT.text, '응답자')
  ];
}

/**
 * 있음/없음 문항 통계.
 * 평균·표준편차는 '있음=1, 없음=0' 으로 계산합니다.
 * 이때 평균은 곧 '있음 비율'(0~1)과 같습니다. 예) 평균 0.87 = 있음 87%
 */
function yesNoStat_(rows, id, text, unit) {
  var vals = [], yes = 0, no = 0;
  rows.forEach(function (r) {
    var v = Number(r[id]);
    if (v === 1) { yes++; vals.push(1); }
    else if (v === 0) { no++; vals.push(0); }
  });
  var n = vals.length;
  var m = mean_(vals);
  return {
    id: id, text: text, unit: unit,
    yes: yes, no: no, n: n,
    yesRate: n ? round1_(yes / n * 100) : 0,
    noRate: n ? round1_(no / n * 100) : 0,
    mean: Math.round(m * 1000) / 1000,
    sd: Math.round(sd_(vals) * 1000) / 1000
  };
}

/** 프로그램별 집계 (응답 n < MIN_N 은 개별 수치 비공개) */
function buildProgramStats_(evals, programs) {
  var byCode = {};
  evals.forEach(function (r) {
    var c = String(r['프로그램코드']);
    if (!byCode[c]) byCode[c] = [];
    byCode[c].push(r);
  });

  var out = programs.map(function (p) {
    var rs = byCode[p.code] || [];

    var secMeans = {};
    SECTIONS.forEach(function (sec) {
      var vals = [];
      rs.forEach(function (r) {
        sec.items.forEach(function (it) {
          var v = Number(r[it.id]);
          if (v >= 1 && v <= 5) vals.push(v);
        });
      });
      secMeans[sec.key] = round2_(mean_(vals));
    });

    var totals = [];
    rs.forEach(function (r) {
      var v = Number(r['과목평균']);
      if (v > 0) totals.push(v);
    });

    var reVals = [];
    rs.forEach(function (r) {
      var v = Number(r[PROGRAM_INTENT.id]);
      if (v === 0 || v === 1) reVals.push(v);
    });

    var allVals = [];
    rs.forEach(function (r) {
      SECTIONS.forEach(function (sec) {
        sec.items.forEach(function (it) {
          var v = Number(r[it.id]);
          if (v >= 1 && v <= 5) allVals.push(v);
        });
      });
    });

    return {
      code: p.code, name: p.name, day: p.day, time: p.time,
      teacher: p.teacher || '', quota: p.quota || 0,
      n: rs.length,
      responseRate: p.quota ? round1_(rs.length / p.quota * 100) : null,
      disclosed: rs.length >= CONFIG.MIN_N_FOR_DISCLOSURE,
      sectionMeans: secMeans,
      courseMean: round2_(mean_(totals)),
      score100: score100_(mean_(totals)),
      positiveRate: positiveRate_(allVals),
      rejoinRate: reVals.length ? round1_(sum_(reVals) / reVals.length * 100) : null
    };
  });

  out = out.filter(function (p) { return p.n > 0; });
  out.sort(function (a, b) { return b.courseMean - a.courseMean; });
  out.forEach(function (p, i) { p.rank = p.disclosed ? (i + 1) : null; });

  return out;
}

/**
 * 문항 × 프로그램 교차표 (보고서 <표2-1> 형식)
 *
 * 문항 하나마다 프로그램별로 5점척도 빈도·비율·평균·표준편차를 내고,
 * 맨 아래에 전체 행을 붙입니다. 과목별 문항(Q4·Q6·Q8)만 대상입니다.
 * Q10 은 응답자 단위(1인 1표)라 특정 과목에 귀속시킬 수 없어 제외합니다.
 */
function buildCrossTabs_(evals, programs) {
  var byCode = {};
  evals.forEach(function (r) {
    var c = String(r['프로그램코드']);
    if (!byCode[c]) byCode[c] = [];
    byCode[c].push(r);
  });

  return evalScaleItems().map(function (it) {
    var rows = programs.map(function (p) {
      return crossRow_(p.name, pluck_(byCode[p.code] || [], it.id), p.code, p.quota);
    }).filter(function (x) { return x.n > 0; });

    rows.sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); });

    return {
      id: it.id,
      text: it.text,
      section: it.section,
      rows: rows,
      total: crossRow_('전체', pluck_(evals, it.id), '', 0)
    };
  });
}

function crossRow_(name, vals, code, quota) {
  var freq = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  vals.forEach(function (v) { if (freq[v] !== undefined) freq[v]++; });

  var n = vals.length;
  var pct = {};
  [1, 2, 3, 4, 5].forEach(function (k) { pct[k] = n ? round1_(freq[k] / n * 100) : 0; });

  return {
    code: code, name: name, quota: quota || 0,
    n: n, freq: freq, pct: pct,
    mean: round2_(mean_(vals)),
    sd: round2_(sd_(vals)),
    responseRate: quota ? round1_(n / quota * 100) : null,
    lowN: code ? (n > 0 && n < CONFIG.MIN_N_FOR_DISCLOSURE) : false
  };
}

/**
 * 참여도 — 몇 과목씩 평가했는지, 선택해놓고 중간에 그만둔 사람은 몇 명인지
 */
function buildParticipation_(evals, commonAll, ridSet) {
  var perPerson = {};
  evals.forEach(function (r) {
    var k = String(r['응답자ID']);
    perPerson[k] = (perPerson[k] || 0) + 1;
  });

  var dist = {};
  Object.keys(perPerson).forEach(function (k) {
    var c = perPerson[k];
    dist[c] = (dist[c] || 0) + 1;
  });

  var distList = Object.keys(dist).map(function (k) {
    return { count: Number(k), people: dist[k] };
  }).sort(function (a, b) { return a.count - b.count; });

  var selectedButIncomplete = 0, commonMissing = 0, selectedTotal = 0;
  commonAll.forEach(function (r) {
    var sel = Number(r['선택과목수']) || 0;
    var done = perPerson[String(r['응답자ID'])] || 0;
    selectedTotal += sel;
    if (sel > done) selectedButIncomplete++;
    if (String(r['공통문항완료']).toUpperCase() !== 'Y') commonMissing++;
  });

  // 수정 현황
  var editedEvals = 0, editTotal = 0, lastEdit = null;
  evals.forEach(function (r) {
    var c = Number(r['수정횟수']) || 0;
    if (c > 0) { editedEvals++; editTotal += c; }
    var d = r['최종수정일시'];
    if (d instanceof Date && (!lastEdit || d > lastEdit)) lastEdit = d;
  });
  var editedCommon = 0;
  commonAll.forEach(function (r) {
    if ((Number(r['수정횟수']) || 0) > 0) editedCommon++;
    var d = r['최종수정일시'];
    if (d instanceof Date && (!lastEdit || d > lastEdit)) lastEdit = d;
  });

  var respondentN = Object.keys(ridSet).length;
  return {
    distribution: distList,
    onlyOne: dist[1] || 0,
    respondentN: respondentN,
    selectedTotal: selectedTotal,
    completedTotal: evals.length,
    incompleteRespondents: selectedButIncomplete,
    commonMissing: commonMissing,
    completionRate: selectedTotal ? round1_(evals.length / selectedTotal * 100) : null,
    editedEvals: editedEvals,
    editedCommon: editedCommon,
    editTotal: editTotal,
    editedRate: evals.length ? round1_(editedEvals / evals.length * 100) : 0,
    lastEditAt: lastEdit ? Utilities.formatDate(lastEdit, 'Asia/Seoul', 'yyyy-MM-dd HH:mm') : null
  };
}

/** 응답자ID로 성함·연락처를 찾습니다. 파기 후에는 빈 값이 됩니다. */
function whoIs_(people, rid) {
  var p = people[String(rid)] || {};
  return { rid: String(rid), name: p.name || '', phone: p.phone || '' };
}

/** 주관식 의견 모아보기 (작성자 포함) */
function buildComments_(evals, commons, people) {
  people = people || {};
  var out = [];

  evalCommentItems().forEach(function (d) {
    evals.forEach(function (r) {
      var txt = String(r[d.id] || '').trim();
      if (!txt || txt.length < 2) return;
      var who = whoIs_(people, r['응답자ID']);
      out.push({
        qid: d.id, label: d.label, section: d.section, unit: '과목별',
        programCode: String(r['프로그램코드']),
        programName: String(r['프로그램명']),
        day: String(r['요일']),
        teacher: String(r['강사명'] || ''),
        rid: who.rid, name: who.name, phone: who.phone,
        text: txt,
        tags: tagText_(txt),
        date: fmtDate_(r['제출일시'])
      });
    });
  });

  FREE_ITEMS.forEach(function (it) {
    commons.forEach(function (r) {
      var txt = String(r[it.id] || '').trim();
      if (!txt || txt.length < 2) return;
      var who = whoIs_(people, r['응답자ID']);
      out.push({
        qid: it.id, label: it.text, section: '기관 전체', unit: '응답자',
        programCode: '', programName: '(기관 전체)', day: '', teacher: '',
        rid: who.rid, name: who.name, phone: who.phone,
        text: txt,
        tags: tagText_(txt),
        date: fmtDate_(r['제출일시'])
      });
    });
  });

  return out;
}

function fmtDate_(d) {
  return (d instanceof Date) ? Utilities.formatDate(d, 'Asia/Seoul', 'MM-dd') : '';
}

/* ===================================================================
 * 같은 뜻의 의견 묶기
 *   1) OPINION_RULES 사전으로 의견 유형을 찾습니다.
 *   2) 사전에 안 걸린 의견은 같은 과목 안에서만 비슷한 문장끼리 묶습니다.
 *   ※ 과목이 다르면 절대 같은 묶음이 되지 않습니다.
 * =================================================================== */

function normOpinion_(s) {
  return String(s || '')
    .replace(/\s+/g, '')
    .replace(/[.,!?~·…"'“”‘’()\[\]{}:;\-—_]/g, '');
}

function matchOpinionRule_(text) {
  var t = normOpinion_(text);
  for (var i = 0; i < OPINION_RULES.length; i++) {
    var r = OPINION_RULES[i];
    for (var j = 0; j < r.words.length; j++) {
      if (t.indexOf(r.words[j]) !== -1) return r.tag;
    }
  }
  return null;
}

function bigrams_(s) {
  var t = normOpinion_(s), out = {};
  if (t.length < 2) { if (t) out[t] = true; return out; }
  for (var i = 0; i < t.length - 1; i++) out[t.substr(i, 2)] = true;
  return out;
}

function jaccard_(a, b) {
  var ka = Object.keys(a), kb = Object.keys(b), inter = 0;
  ka.forEach(function (k) { if (b[k]) inter++; });
  var uni = ka.length + kb.length - inter;
  return uni ? inter / uni : 0;
}

/** 비슷한 문장끼리 묶습니다. 비교 기준은 각 묶음의 첫 문장입니다. */
function clusterTexts_(list) {
  var clusters = [];
  list.forEach(function (x) {
    var g = bigrams_(x.text);
    var best = null, bestScore = 0;
    clusters.forEach(function (c) {
      var s = jaccard_(g, c.grams);
      if (s > bestScore) { bestScore = s; best = c; }
    });
    if (best && bestScore >= OPINION_SIMILARITY) best.items.push(x);
    else clusters.push({ items: [x], grams: g });
  });

  clusters.forEach(function (c) {
    var label = c.items[0].text;
    c.items.forEach(function (z) { if (z.text.length < label.length) label = z.text; });
    c.label = label;
  });
  return clusters;
}

function buildOpinionGroups_(evals, commons, people) {
  people = people || {};
  var items = [];

  evalCommentItems().forEach(function (d) {
    evals.forEach(function (r) {
      var t = String(r[d.id] || '').trim();
      if (t.length < 2) return;
      var who = whoIs_(people, r['응답자ID']);
      items.push({
        scope: '과목', programCode: String(r['프로그램코드']),
        programName: String(r['프로그램명']), qid: d.id, text: t,
        rid: who.rid, name: who.name, phone: who.phone
      });
    });
  });

  commons.forEach(function (r) {
    var t = String(r['Q14'] || '').trim();
    if (t.length < 2) return;
    var who = whoIs_(people, r['응답자ID']);
    items.push({
      scope: '기관 전체', programCode: '', programName: '(기관 전체)',
      qid: 'Q14', text: t,
      rid: who.rid, name: who.name, phone: who.phone
    });
  });

  var groups = {}, leftover = {};

  function addEntry(g, x) {
    g.entries.push({ text: x.text, name: x.name, phone: x.phone, rid: x.rid });
    g.qids[x.qid] = true;
  }

  items.forEach(function (x) {
    var tag = matchOpinionRule_(x.text);
    if (!tag) {
      if (!leftover[x.programCode]) leftover[x.programCode] = [];
      leftover[x.programCode].push(x);
      return;
    }
    var key = x.programCode + '|' + tag;
    if (!groups[key]) {
      groups[key] = {
        scope: x.scope, programCode: x.programCode, programName: x.programName,
        label: tag, method: '유형 분류', entries: [], qids: {}
      };
    }
    addEntry(groups[key], x);
  });

  Object.keys(leftover).forEach(function (code) {
    clusterTexts_(leftover[code]).forEach(function (cl, i) {
      var g = {
        scope: cl.items[0].scope, programCode: code,
        programName: cl.items[0].programName,
        label: cl.label, method: '유사 문장', entries: [], qids: {}
      };
      cl.items.forEach(function (z) { addEntry(g, z); });
      groups[code + '|~' + i] = g;
    });
  });

  return Object.keys(groups).map(function (k) {
    var g = groups[k];
    var seen = {}, authors = [];
    g.entries.forEach(function (e) {
      var n = e.name || e.rid;
      if (n && !seen[n]) { seen[n] = true; authors.push(e.name || '(이름없음)'); }
    });
    return {
      scope: g.scope, programCode: g.programCode, programName: g.programName,
      label: g.label, method: g.method,
      count: g.entries.length,
      entries: g.entries,
      authors: authors,
      qids: Object.keys(g.qids).sort()
    };
  }).sort(function (a, b) {
    return b.count - a.count ||
           a.programName.localeCompare(b.programName, 'ko') ||
           a.label.localeCompare(b.label, 'ko');
  });
}

/** 키워드 분류 — 응답자 기준 중복 제거 */
function buildKeywordCounts_(evals, commons, ridSet) {
  var counts = {};
  KEYWORD_RULES.forEach(function (k) { counts[k.tag] = 0; });

  var seenBy = {};
  function mark(rid, txt) {
    if (!txt) return;
    tagText_(txt).forEach(function (t) {
      if (!seenBy[rid]) seenBy[rid] = {};
      seenBy[rid][t] = true;
    });
  }

  evals.forEach(function (r) {
    var rid = String(r['응답자ID']);
    evalCommentItems().forEach(function (d) { mark(rid, String(r[d.id] || '')); });
  });
  commons.forEach(function (r) {
    var rid = String(r['응답자ID']);
    FREE_ITEMS.forEach(function (it) { mark(rid, String(r[it.id] || '')); });
  });

  Object.keys(seenBy).forEach(function (rid) {
    Object.keys(seenBy[rid]).forEach(function (t) { counts[t]++; });
  });

  var base = Object.keys(ridSet).length;
  return Object.keys(counts)
    .map(function (t) {
      return { tag: t, count: counts[t], pct: base ? round1_(counts[t] / base * 100) : 0 };
    })
    .filter(function (x) { return x.count > 0; })
    .sort(function (a, b) { return b.count - a.count; });
}

function tagText_(txt) {
  if (!txt) return [];
  var tags = [];
  KEYWORD_RULES.forEach(function (rule) {
    for (var i = 0; i < rule.words.length; i++) {
      if (txt.indexOf(rule.words[i]) !== -1) { tags.push(rule.tag); return; }
    }
  });
  return tags;
}

/** 신규 희망강좌 빈도 (표기 흔들림 정규화) — 응답자 단위 */
function buildWishes_(commons) {
  var groups = {};

  commons.forEach(function (r) {
    var raw = String(r['Q13'] || '').trim();
    if (!raw || raw.length < 2) return;

    raw.split(/[,、\/\n·]+/).forEach(function (piece) {
      var t = piece.trim();
      if (t.length < 2) return;
      if (/^(없|없음|없다|모름|무|x|X)$/.test(t)) return;

      var key = normalizeWish_(t);
      if (!key) return;
      if (!groups[key]) groups[key] = { count: 0, forms: {} };
      groups[key].count++;
      groups[key].forms[t] = (groups[key].forms[t] || 0) + 1;
    });
  });

  return Object.keys(groups).map(function (k) {
    var g = groups[k];
    var best = '', bestN = -1;
    Object.keys(g.forms).forEach(function (f) {
      if (g.forms[f] > bestN) { bestN = g.forms[f]; best = f; }
    });
    return { label: best, count: g.count, variants: Object.keys(g.forms) };
  }).sort(function (a, b) {
    return b.count - a.count || a.label.localeCompare(b.label);
  });
}

function normalizeWish_(s) {
  return String(s)
    .replace(/\s+/g, '')
    .replace(/(교실|강좌|수업|반|과정|배우기|배우고싶어요|배우고싶다|하고싶어요|했으면좋겠어요|해주세요|희망)$/g, '')
    .toLowerCase();
}

/* ===================================================================
 * 계산 유틸
 * =================================================================== */

function pluck_(rows, key) {
  var out = [];
  rows.forEach(function (r) {
    var v = Number(r[key]);
    if (v >= 1 && v <= 5) out.push(v);
  });
  return out;
}

function sum_(arr) {
  var s = 0;
  for (var i = 0; i < arr.length; i++) s += Number(arr[i]) || 0;
  return s;
}

/** 표본 표준편차 (n-1) */
function sd_(arr) {
  var n = arr.length;
  if (n < 2) return 0;
  var m = mean_(arr);
  var ss = 0;
  for (var i = 0; i < n; i++) ss += Math.pow(arr[i] - m, 2);
  return Math.sqrt(ss / (n - 1));
}

/** 긍정응답률 = (매우만족 + 만족) / 전체 × 100 */
function positiveRate_(arr) {
  if (!arr.length) return 0;
  var c = 0;
  arr.forEach(function (v) { if (v >= 4) c++; });
  return round1_(c / arr.length * 100);
}

/** 부정응답률 = (불만족 + 매우불만족) / 전체 × 100 */
function negativeRate_(arr) {
  if (!arr.length) return 0;
  var c = 0;
  arr.forEach(function (v) { if (v <= 2) c++; });
  return round1_(c / arr.length * 100);
}

/** 5점 평균을 100점으로 환산 */
function score100_(m) {
  if (!m) return 0;
  return round1_((m - 1) / 4 * 100);
}

function round1_(n) {
  return Math.round(n * 10) / 10;
}


/* ==========================================================================
 *  Export.gs
 * ========================================================================== */

/**
 * Export.gs — 엑셀 집계표 생성 및 다운로드
 *
 * 생성/갱신 시트
 *   집계표       개요 / 참여도 / 영역별 / 문항별 / 응답분포 / 의향 / 프로그램별 / 희망강좌 / 키워드
 *   주관식의견   모든 주관식 응답 원문 + 키워드 태그
 *
 * 누적 데이터 시트
 *   응답자정보   성함·연락처 (평가 종료 후 이 시트만 삭제하면 개인정보 파기)
 *   응답자공통   1인 1회 문항
 *   응답원자료   과목별 평가 (1행 = 1과목)
 */

var STYLE = {
  navy: '#1f3864',
  head: '#2f5597',
  band: '#dae3f3',
  white: '#ffffff'
};

var COLS = 9;

/** 성함·연락처가 들어가는 시트 맨 위에 붙이는 경고 */
var PRIVACY_WARNING =
  '⚠ 이 시트에는 성함·연락처가 들어 있습니다. ' +
  '강사·외부 기관에 자료를 넘기실 때는 반드시 해당 열(주황색)을 삭제하고 주세요.';

/** 1행 경고 줄 서식 */
function stylePrivacyWarning_(sh, width) {
  sh.getRange(1, 1, 1, width).merge()
    .setBackground('#b2540d').setFontColor('#ffffff')
    .setFontWeight('bold').setFontSize(10)
    .setVerticalAlignment('middle').setWrap(true);
  sh.setRowHeight(1, 28);
}

/** 집계표를 다시 만들고 스프레드시트 URL을 반환 (관리자 화면용) */
function buildSummary(token, filter) {
  checkToken_(token);
  return buildSummaryInternal_(filter || {});
}

/** 로그인 확인 없이 집계표를 다시 만듭니다. 스프레드시트 메뉴에서도 씁니다. */
function buildSummaryInternal_(filter) {
  var stats = computeStats_(filter || {});
  var ss = getSS_();

  writeSummarySheet_(ss, stats);
  writeCrossTabSheet_(ss, stats);
  writeCommentSheet_(ss, stats);
  writeOpinionSheet_(ss, stats);

  // 문항 번호 ↔ 문항 내용 안내표도 함께 최신으로 맞춰 둡니다
  try { ensureGuideSheet_(ss); } catch (e) {}

  return { ok: true, url: ss.getUrl(), generatedAt: stats.meta.generatedAt, stats: stats };
}

/** 집계용 시트 4개를 지웁니다. 원자료는 건드리지 않습니다. */
function removeSummarySheets_() {
  var ss = getSS_();
  var names = [CONFIG.SHEET_SUMMARY, '문항별교차표', CONFIG.SHEET_COMMENTS, '의견묶음'];
  var removed = [];
  names.forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (sh) { ss.deleteSheet(sh); removed.push(n); }
  });
  return removed;
}

/**
 * 집계표를 다시 만들고 다운로드 링크를 반환합니다.
 * 관리자 브라우저가 기관 구글 계정으로 로그인되어 있으면 바로 .xlsx 가 내려받아집니다.
 */
function prepareExport(token, filter) {
  checkToken_(token);
  buildSummaryInternal_(filter || {});
  var ss = getSS_();
  SpreadsheetApp.flush();
  return {
    ok: true,
    xlsxUrl: 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=xlsx',
    sheetUrl: ss.getUrl(),
    generatedAt: Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm')
  };
}

/** 엑셀 파일을 base64 로 직접 반환 (prepareExport 가 막힐 때의 대체 수단) */
function downloadXlsx(token, filter) {
  checkToken_(token);
  buildSummaryInternal_(filter || {});

  var ss = getSS_();
  SpreadsheetApp.flush();

  var url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=xlsx';
  var res = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('엑셀 변환에 실패했습니다. (코드 ' + res.getResponseCode() + ')');
  }

  var round = (filter && filter.round) || CONFIG.ROUND;
  return {
    ok: true,
    filename: CONFIG.CENTER_NAME + '_' + round + '_강의평가_집계표_' +
              Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd') + '.xlsx',
    base64: Utilities.base64Encode(res.getBlob().getBytes())
  };
}

/* ===================================================================
 * 집계표 시트
 * =================================================================== */

function writeSummarySheet_(ss, s) {
  var sh = ss.getSheetByName(CONFIG.SHEET_SUMMARY);
  if (sh) { sh.clear(); sh.clearFormats(); unmergeAll_(sh); }
  else sh = ss.insertSheet(CONFIG.SHEET_SUMMARY);

  var rows = [];
  var titleRows = [], headRows = [], noteRows = [];

  function title(t) { titleRows.push(rows.length); rows.push(pad_([t])); }
  function head(a) { headRows.push(rows.length); rows.push(pad_(a)); }
  function note(t) { noteRows.push(rows.length); rows.push(pad_([t])); }
  function line(a) { rows.push(pad_(a)); }
  function blank() { rows.push(pad_([])); }

  var m = s.meta;

  // --- 머리말 ---
  rows.push(pad_([CONFIG.CENTER_NAME + ' ' + m.fullTitle + ' 집계표']));
  titleRows.push(0);
  line(['산출일시', m.generatedAt]);
  if (m.filterProgram || m.filterDay) {
    line(['적용 필터',
          (m.filterProgram ? '프로그램 ' + m.filterProgram + '  ' : '') +
          (m.filterDay ? m.filterDay + '요일' : '')]);
  }
  note('※ 집계 단위가 두 가지입니다. 강의·운영·시설·재참여는 「평가건수」 기준, ' +
       '전반만족도·타프로그램 참여의향·희망강좌·기타의견은 「응답자」 기준(1인 1표)입니다.');
  blank();

  // --- 1. 개요 ---
  title('1. 개요');
  head(['구분', '값', '비고']);
  line(['응답자 수', m.respondentN + '명', '과목을 1개 이상 평가한 사람']);
  line(['평가 건수', m.evalN + '건', '과목별 평가 1건 = 1행']);
  line(['1인 평균 평가 과목 수', m.avgPrograms + '과목', '']);
  line(['공통문항 응답자 수', m.commonN + '명', '전반만족도 등 1인 1회 문항 완료자']);
  line(['평가된 프로그램 수', m.programCount + '개', '']);
  if (m.responseRate !== null) {
    line(['응답률', m.responseRate + '%', '평가건수 ÷ 수강인원 합계(' + m.totalQuota + '명)']);
  } else {
    line(['응답률', '산출 불가', '「프로그램」 시트에 수강인원을 입력하세요']);
  }
  blank();
  line(['전반적 만족도 평균', m.overallMean, '5점 만점 · 응답자 기준']);
  line(['전반적 만족도 긍정응답률', m.overallPositive + '%', '매우 만족 + 만족']);
  line(['과목 평가 평균', m.courseMean, '5점 만점 · 평가건수 기준']);
  line(['과목 평가 100점 환산', m.courseScore100 + '점', '(평균 − 1) ÷ 4 × 100']);
  blank();

  // --- 2. 참여도 ---
  var pt = s.participation;
  title('2. 참여도');
  head(['구분', '값', '비고']);
  line(['선택한 과목 수 합계', pt.selectedTotal + '과목', '응답자들이 평가하겠다고 선택한 총합']);
  line(['실제 평가 완료', pt.completedTotal + '과목', '']);
  line(['완주율', pt.completionRate === null ? '-' : pt.completionRate + '%', '완료 ÷ 선택']);
  line(['중간에 그만둔 응답자', pt.incompleteRespondents + '명', '선택한 과목을 다 채우지 않음']);
  line(['공통문항 미완료', pt.commonMissing + '명', '']);
  line(['1과목만 평가한 응답자', pt.onlyOne + '명', '']);
  blank();
  line(['수정된 과목 평가', pt.editedEvals + '건', '전체의 ' + pt.editedRate + '%']);
  line(['수정된 공통문항', pt.editedCommon + '명', '']);
  line(['총 수정 횟수', pt.editTotal + '회', '고치기 전 내용은 「수정이력」 시트 참조']);
  line(['마지막 수정', pt.lastEditAt || '없음', '']);
  blank();
  head(['평가 과목 수', '응답자 수', '비율(%)']);
  if (!pt.distribution.length) {
    line(['', '응답 없음', '']);
  } else {
    pt.distribution.forEach(function (d) {
      line([d.count + '과목', d.people + '명',
            pt.respondentN ? round1_(d.people / pt.respondentN * 100) : 0]);
    });
  }
  blank();

  // --- 3. 영역별 ---
  title('3. 영역별 만족도');
  head(['영역', '집계 단위', '문항수', '응답수', '평균', '표준편차', '100점 환산', '긍정응답률(%)']);
  s.sections.forEach(function (x) {
    line([x.key, x.unit === '평가' ? '평가건수' : '응답자',
          x.itemCount, x.n, x.mean, x.sd, x.score100, x.positiveRate]);
  });
  blank();

  // --- 4. 문항별 통계 ---
  title('4. 문항별 통계');
  head(['문항번호', '문항', '영역', '집계 단위', '응답수', '평균', '표준편차', '긍정응답률(%)', '부정응답률(%)']);
  s.items.forEach(function (it) {
    line([it.id, it.text, it.section, it.unit === '평가' ? '평가건수' : '응답자',
          it.n, it.mean, it.sd, it.positiveRate, it.negativeRate]);
  });
  blank();

  // --- 5. 보고서용 문항표 (<표3-1> 형식) ---
  var asc = scaleAsc();
  title('5. 문항별 응답 분포 — 보고서용');
  note('※ 사업보고서 표 형식 그대로입니다. 그대로 복사해 쓰실 수 있습니다. (단위: 명, %)');
  head(['구분', '척도', '빈도', '비율(%)']);
  s.items.forEach(function (it) {
    asc.forEach(function (sc, i) {
      line([i === 0 ? it.text + '\n(n=' + it.n + ')' : '',
            sc.label, it.freq[sc.v], it.pct[sc.v]]);
    });
    line(['', '평균(표준편차)', meanSdText_(it.mean, it.sd), '']);
  });
  blank();

  // --- 6. 의향 ---
  title('6. 참여 의향');
  note('※ 평균·표준편차는 「있음 = 1, 없음 = 0」 기준입니다. 평균은 곧 「있음」 비율과 같습니다. (예: 평균 .865 = 있음 86.5%)');
  head(['문항번호', '문항', '집계 단위', '있음', '없음', '응답수', '있음 비율(%)', '평균(표준편차)']);
  s.intents.forEach(function (x) {
    line([x.id, x.text, x.unit === '평가' ? '평가건수' : '응답자',
          x.yes + '건', x.no + '건', x.n, x.yesRate, yesNoText_(x)]);
  });
  blank();

  head(['구분', '응답', '빈도', '비율(%)']);
  s.intents.forEach(function (x) {
    line([x.text + '\n(n=' + x.n + ')', '있음 (O)', x.yes, x.yesRate]);
    line(['', '없음 (X)', x.no, x.noRate]);
    line(['', '평균(표준편차)', yesNoText_(x), '']);
  });
  blank();

  // --- 7. 프로그램별 ---
  title('7. 프로그램별 집계');
  note('※ 응답 ' + m.minN + '건 미만 프로그램은 개인 식별 우려가 있어 개별 수치를 표시하지 않습니다.');
  head(['순위', '프로그램', '요일/시간', '강사', '평가건수', '응답률(%)', '과목평균', '100점 환산', '재참여 의향(%)']);
  s.programs.forEach(function (p) {
    if (!p.disclosed) {
      line(['-', p.name, p.day + ' ' + p.time, p.teacher, p.n + '건',
            p.responseRate === null ? '-' : p.responseRate,
            '소수응답', '소수응답', '소수응답']);
    } else {
      line([p.rank, p.name, p.day + ' ' + p.time, p.teacher, p.n + '건',
            p.responseRate === null ? '-' : p.responseRate,
            p.courseMean, p.score100,
            p.rejoinRate === null ? '-' : p.rejoinRate]);
    }
  });
  blank();

  // --- 8. 프로그램별 영역 평균 ---
  title('8. 프로그램별 영역 평균');
  var secHead = ['프로그램', '평가건수'];
  SECTIONS.forEach(function (sec) { secHead.push(sec.key); });
  secHead.push('과목평균', '긍정응답률(%)');
  head(secHead);
  s.programs.forEach(function (p) {
    var r = [p.name, p.n];
    SECTIONS.forEach(function (sec) {
      r.push(p.disclosed ? p.sectionMeans[sec.key] : '소수응답');
    });
    r.push(p.disclosed ? p.courseMean : '소수응답');
    r.push(p.disclosed ? p.positiveRate : '소수응답');
    line(r);
  });
  blank();

  // --- 9. 희망강좌 ---
  title('9. 신규 개설 희망 강좌');
  note('※ 응답자 기준 · 표기가 다른 유사 응답은 하나로 묶었습니다.');
  head(['순위', '강좌명', '건수', '유사 표기']);
  if (!s.wishes.length) line(['', '응답 없음', '', '']);
  else s.wishes.forEach(function (w, i) {
    line([i + 1, w.label, w.count, w.variants.join(', ')]);
  });
  blank();

  // --- 10. 키워드 ---
  title('10. 주관식 키워드 분류');
  note('※ 응답자 기준 · 한 사람이 여러 키워드에 중복 집계될 수 있습니다.');
  head(['키워드', '언급 응답자 수', '비율(%)']);
  if (!s.keywords.length) line(['', '응답 없음', '']);
  else s.keywords.forEach(function (k) { line([k.tag, k.count + '명', k.pct]); });

  // --- 쓰기 ---
  sh.getRange(1, 1, rows.length, COLS).setValues(rows);

  // --- 서식 ---
  sh.getRange(1, 1, 1, COLS).merge()
    .setFontSize(15).setFontWeight('bold')
    .setBackground(STYLE.navy).setFontColor(STYLE.white)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(1, 34);

  titleRows.forEach(function (i) {
    if (i === 0) return;
    sh.getRange(i + 1, 1, 1, COLS)
      .setFontSize(12).setFontWeight('bold')
      .setBackground(STYLE.band).setFontColor(STYLE.navy);
  });
  headRows.forEach(function (i) {
    sh.getRange(i + 1, 1, 1, COLS)
      .setFontWeight('bold').setBackground(STYLE.head).setFontColor(STYLE.white)
      .setHorizontalAlignment('center');
  });
  noteRows.forEach(function (i) {
    sh.getRange(i + 1, 1, 1, COLS).merge()
      .setFontSize(9).setFontColor('#5b6983').setWrap(true);
  });

  sh.getRange(1, 1, rows.length, COLS).setVerticalAlignment('middle');
  sh.setColumnWidth(1, 95);
  sh.setColumnWidth(2, 320);
  for (var c = 3; c <= COLS; c++) sh.setColumnWidth(c, 110);
  sh.setFrozenRows(1);
  sh.setHiddenGridlines(true);

  ss.setActiveSheet(sh);
  ss.moveActiveSheet(1);
  return sh;
}

/* ===================================================================
 * 주관식 의견 시트
 * =================================================================== */

function writeCommentSheet_(ss, s) {
  var sh = ss.getSheetByName(CONFIG.SHEET_COMMENTS);
  if (sh) { sh.clear(); sh.clearFormats(); }
  else sh = ss.insertSheet(CONFIG.SHEET_COMMENTS);

  var warn = PRIVACY_WARNING;
  var head = ['제출일', '성함', '연락처', '구분', '프로그램', '요일', '강사',
              '문항번호', '문항', '의견 내용', '키워드'];
  var rows = [[warn, '', '', '', '', '', '', '', '', '', ''], head];

  s.comments.forEach(function (c) {
    rows.push([c.date, c.name, c.phone, c.unit, c.programName, c.day, c.teacher,
               c.qid, c.label, c.text, c.tags.join(', ')]);
  });
  if (rows.length === 2) {
    rows.push(['', '', '', '', '', '', '', '', '', '작성된 의견이 없습니다.', '']);
  }

  sh.getRange(1, 1, rows.length, head.length).setValues(rows);
  stylePrivacyWarning_(sh, head.length);
  sh.getRange(2, 1, 1, head.length)
    .setFontWeight('bold').setBackground(STYLE.navy).setFontColor(STYLE.white)
    .setHorizontalAlignment('center');
  sh.setFrozenRows(2);

  // 성함·연락처 열을 눈에 띄게 (외부 공유 전에 지우기 쉽도록)
  sh.getRange(2, 2, rows.length - 1, 2).setBackground('#fdeadd');

  var widths = [70, 80, 110, 70, 140, 50, 80, 75, 200, 460, 140];
  widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.getRange(1, 10, rows.length, 1).setWrap(true);

  return sh;
}

function pad_(arr) {
  var a = (arr || []).slice(0, COLS);
  while (a.length < COLS) a.push('');
  return a;
}

/**
 * 시트의 모든 셀 병합을 풉니다.
 * sh.clear() 는 내용·서식만 지우고 병합은 남기므로, 다시 만들 때마다 먼저 풀어줍니다.
 */
function unmergeAll_(sh) {
  try {
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();
  } catch (e) {
    Logger.log('병합 해제 실패: ' + e.message);
  }
}

/** 4.22(.807) 형태 — 보고서 표기 관행에 맞춰 표준편차 앞의 0을 뺍니다 */
function meanSdText_(mean, sd) {
  var m = Number(mean).toFixed(2);
  var s = Number(sd).toFixed(3);
  if (s.indexOf('0.') === 0) s = s.slice(1);
  return m + '(' + s + ')';
}

/** 있음=1 / 없음=0 기준 평균(표준편차). .865(.341) 형태 */
function yesNoText_(x) {
  function trim0(v) {
    var s = Number(v).toFixed(3);
    return s.indexOf('0.') === 0 ? s.slice(1) : s;
  }
  return trim0(x.mean) + '(' + trim0(x.sd) + ')';
}

/* ===================================================================
 * 문항별 교차표 시트 (<표2-1> 형식)
 *   문항 하나마다 프로그램 × 5점척도 빈도·비율 + 평균·표준편차
 * =================================================================== */

function writeCrossTabSheet_(ss, s) {
  var name = '문항별교차표';
  var sh = ss.getSheetByName(name);
  if (sh) { sh.clear(); sh.clearFormats(); unmergeAll_(sh); sh.setFrozenColumns(0); }
  else sh = ss.insertSheet(name);

  var asc = scaleAsc();
  var W = 1 + asc.length * 2 + 4;   // 구분 + (빈도,%)×5 + 응답수 + 응답률 + 평균 + 표준편차

  function row(arr) {
    var a = (arr || []).slice(0, W);
    while (a.length < W) a.push('');
    return a;
  }

  var rows = [];
  var titleRows = [], head1Rows = [], head2Rows = [], totalRows = [], noteRows = [];

  rows.push(row([CONFIG.CENTER_NAME + ' ' + s.meta.fullTitle + ' 문항별 교차표']));
  titleRows.push(0);
  rows.push(row(['산출일시', s.meta.generatedAt]));
  noteRows.push(rows.length);
  rows.push(row(['※ 단위: 명, % · 응답률 = 해당 과목 평가건수 ÷ 수강인원 · ⚠ 표시는 평가 ' +
                 CONFIG.MIN_N_FOR_DISCLOSURE + '건 미만이라 개별 공개에 주의가 필요한 과목입니다.']));
  rows.push(row([]));

  s.crossTabs.forEach(function (ct) {
    titleRows.push(rows.length);
    rows.push(row(['<' + ct.id + '> ' + ct.text]));

    // 2단 머리글
    var h1 = ['구분'];
    asc.forEach(function (sc) { h1.push(sc.label, ''); });
    h1.push('응답수', '응답률(%)', '평균', '표준편차');
    head1Rows.push(rows.length);
    rows.push(row(h1));

    var h2 = [''];
    asc.forEach(function () { h2.push('빈도', '%'); });
    h2.push('(명)', '', '', '');
    head2Rows.push(rows.length);
    rows.push(row(h2));

    ct.rows.forEach(function (r) {
      var line = [r.name + (r.lowN ? ' ⚠' : '')];
      asc.forEach(function (sc) { line.push(r.freq[sc.v], r.pct[sc.v]); });
      line.push(r.n, r.responseRate === null ? '-' : r.responseRate, r.mean, r.sd);
      rows.push(row(line));
    });

    var t = ct.total;
    var tl = ['전체'];
    asc.forEach(function (sc) { tl.push(t.freq[sc.v], t.pct[sc.v]); });
    tl.push(t.n, '', t.mean, t.sd);
    totalRows.push(rows.length);
    rows.push(row(tl));

    rows.push(row([]));
  });

  if (!s.crossTabs.length) rows.push(row(['', '응답 없음']));

  sh.getRange(1, 1, rows.length, W).setValues(rows);

  sh.getRange(1, 1, 1, W).merge()
    .setFontSize(14).setFontWeight('bold')
    .setBackground(STYLE.navy).setFontColor(STYLE.white)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(1, 32);

  titleRows.forEach(function (i) {
    if (i === 0) return;
    sh.getRange(i + 1, 1, 1, W).merge()
      .setFontSize(11).setFontWeight('bold')
      .setBackground(STYLE.band).setFontColor(STYLE.navy);
  });
  head1Rows.forEach(function (i) {
    var r = sh.getRange(i + 1, 1, 2, W);
    r.setFontWeight('bold').setBackground(STYLE.head).setFontColor(STYLE.white)
     .setHorizontalAlignment('center').setVerticalAlignment('middle');
    // 척도 이름 2칸 병합
    for (var c = 0; c < asc.length; c++) sh.getRange(i + 1, 2 + c * 2, 1, 2).merge();
    sh.getRange(i + 1, 1, 2, 1).merge();
    for (var k = 0; k < 3; k++) sh.getRange(i + 1, 2 + asc.length * 2 + 1 + k, 2, 1).merge();
  });
  totalRows.forEach(function (i) {
    sh.getRange(i + 1, 1, 1, W).setFontWeight('bold').setBackground('#eef2fa');
  });
  noteRows.forEach(function (i) {
    sh.getRange(i + 1, 1, 1, W).merge().setFontSize(9).setFontColor('#5b6983').setWrap(true);
  });

  sh.getRange(1, 1, rows.length, W).setVerticalAlignment('middle');
  sh.setColumnWidth(1, 150);
  for (var c = 2; c <= W; c++) sh.setColumnWidth(c, 62);
  // 제목 줄을 가로로 병합하므로 첫 열 고정은 쓸 수 없습니다.
  // (구글시트는 병합된 칸의 일부만 고정하는 것을 허용하지 않습니다)
  sh.setHiddenGridlines(true);
  return sh;
}

/* ===================================================================
 * 의견 묶음 시트 — 같은 뜻의 의견을 묶어 빈도 표시
 * =================================================================== */

function writeOpinionSheet_(ss, s) {
  var name = '의견묶음';
  var sh = ss.getSheetByName(name);
  if (sh) { sh.clear(); sh.clearFormats(); }
  else sh = ss.insertSheet(name);

  var head = ['구분', '프로그램', '의견 묶음', '건수', '작성자', '분류 방법',
              '해당 문항', '원문 모두 보기 (작성자 포함)'];
  var rows = [[PRIVACY_WARNING, '', '', '', '', '', '', ''], head];

  s.opinions.forEach(function (g) {
    var lines = g.entries.map(function (e) {
      var who = e.name || '(이름없음)';
      return '· [' + who + '] ' + e.text;
    });
    rows.push([g.scope, g.programName, g.label, g.count,
               g.authors.join(', '), g.method, g.qids.join(', '),
               lines.join('\n')]);
  });
  if (rows.length === 2) {
    rows.push(['', '', '작성된 의견이 없습니다.', '', '', '', '', '']);
  }

  sh.getRange(1, 1, rows.length, head.length).setValues(rows);
  stylePrivacyWarning_(sh, head.length);
  sh.getRange(2, 1, 1, head.length)
    .setFontWeight('bold').setBackground(STYLE.navy).setFontColor(STYLE.white)
    .setHorizontalAlignment('center');
  sh.setFrozenRows(2);

  // 작성자 열 강조 (외부 공유 전에 지우기 쉽도록)
  sh.getRange(2, 5, rows.length - 1, 1).setBackground('#fdeadd');

  var widths = [75, 130, 250, 55, 150, 90, 90, 520];
  widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.getRange(1, 3, rows.length, 1).setWrap(true);
  sh.getRange(1, 5, rows.length, 1).setWrap(true);
  sh.getRange(1, 8, rows.length, 1).setWrap(true);
  sh.getRange(2, 1, rows.length - 1, head.length).setVerticalAlignment('top');

  return sh;
}


/* ==========================================================================
 *  Tools.gs
 * ========================================================================== */

/**
 * Tools.gs — 관리 도구
 *
 * 편집기에서 직접 실행하는 함수입니다. 웹 화면에서는 호출되지 않습니다.
 *   diagnose()              설치 상태 점검
 *   makeTestData(40)        테스트용 가짜 응답 생성 (대시보드 미리보기용)
 *   clearTestData()         테스트 데이터만 삭제
 *   purgeRespondentInfo()   성함·연락처만 파기 (통계는 그대로 보존)
 *   archiveRound()          현재 차수를 보관용 시트로 이동
 *   clearAllResponses()     모든 응답 삭제 — 되돌릴 수 없습니다
 */

var TEST_PREFIX = '테스트';

var TEST_COMMENTS = [
  '강사님이 친절하게 가르쳐주셔서 좋았습니다.',
  '수업 시간이 조금 더 길었으면 좋겠어요.',
  '교실이 조금 좁아서 움직이기 불편합니다.',
  '음향 상태가 좋지 않아 뒤에서는 잘 안 들립니다.',
  '진도가 조금 빠른 것 같습니다.',
  '난이도가 적당해서 따라가기 좋았습니다.',
  '수강 인원이 많아 추첨에서 떨어지는 경우가 많습니다.',
  '냉난방이 잘 되어 쾌적했습니다.',
  '교재가 있으면 복습하기 좋을 것 같아요.',
  '선생님 설명이 이해하기 쉽습니다.',
  '', '', ''
];

var TEST_WISHES = [
  '인문학', '인문학 교실', '스마트폰 활용', '스마트폰활용반', '서예',
  '사진촬영', '노래교실', '요가', '힐링요가', '한국무용',
  '컴퓨터 기초', '바둑', '', '', ''
];

/* ===================================================================
 * 테스트 데이터
 * =================================================================== */

/**
 * 테스트용 가짜 응답을 생성합니다.
 * @param {number} people 응답자 수 (기본 40명). 한 사람당 1~4과목을 평가합니다.
 */
function makeTestData(people) {
  people = people || 40;
  var ss = getSS_();
  ensureRespondentSheet_(ss);
  ensureCommonSheet_(ss);
  ensureEvalSheet_(ss);

  var programs = getPrograms();
  var rHeaders = buildRespondentHeaders();
  var cHeaders = buildCommonHeaders();
  var eHeaders = buildEvalHeaders();

  var rRows = [], cRows = [], eRows = [];

  for (var i = 0; i < people; i++) {
    var rid = Utilities.getUuid();
    var name = TEST_PREFIX + ('00' + (i + 1)).slice(-3);
    var phone = formatPhone_('010' + String(10000000 + Math.floor(Math.random() * 89999999)));
    var when = new Date(Date.now() - Math.floor(Math.random() * 14) * 86400000);

    // 사람마다 수강 성향이 다르도록 기준 만족도를 조금씩 달리합니다
    var bias = 3.5 + Math.random() * 1.2;

    // 1~4과목 선택
    var count = 1 + Math.floor(Math.random() * Math.random() * 4);
    var picked = pickPrograms_(programs, count);

    // 10% 는 선택만 하고 일부를 끝내지 않은 것으로 둡니다
    var finished = (Math.random() < 0.1 && picked.length > 1)
      ? picked.slice(0, picked.length - 1) : picked;

    rRows.push(buildRowFromMap_(rHeaders, {
      '응답자ID': rid, '평가차수': CONFIG.ROUND,
      '성함': name, '연락처': phone, '개인정보동의': 'Y',
      '최초제출일시': when, '최종수정일시': when
    }));

    finished.forEach(function (prog) {
      var p = { programCode: prog.code };
      SECTIONS.forEach(function (sec) {
        sec.items.forEach(function (it) { p[it.id] = sampleScore_(bias); });
      });
      p[PROGRAM_COMMENT.id] = pick_(TEST_COMMENTS);
      p[PROGRAM_INTENT.id] = Math.random() < 0.82 ? 1 : 0;

      var row = buildEvalRow_(eHeaders, p, prog, rid, null, { name: name, phone: phone });
      row[eHeaders.indexOf('제출일시')] = when;
      eRows.push(row);
    });

    // 과목을 하나라도 끝낸 사람의 85% 가 공통문항까지 완료
    var commonDone = finished.length > 0 && Math.random() < 0.85;
    var cmap = {
      '응답자ID': rid, '성함': name, '연락처': phone,
      '평가차수': CONFIG.ROUND, '제출일시': when,
      '선택과목': picked.map(function (x) { return x.name; }).join(', '),
      '선택과목코드': picked.map(function (x) { return x.code; }).join(','),
      '선택과목수': picked.length,
      '완료과목수': finished.length,
      '공통문항완료': commonDone ? 'Y' : 'N'
    };
    if (commonDone) {
      cmap[OVERALL.id] = sampleScore_(bias);
      cmap[COMMON_INTENT.id] = Math.random() < 0.7 ? 1 : 0;
      cmap['Q13'] = pick_(TEST_WISHES);
      cmap['Q14'] = Math.random() < 0.25 ? pick_(TEST_COMMENTS) : '';
    }
    cRows.push(buildRowFromMap_(cHeaders, cmap));
  }

  appendRows_(ss, CONFIG.SHEET_RESPONDENTS, rRows);
  appendRows_(ss, CONFIG.SHEET_COMMON, cRows);
  appendRows_(ss, CONFIG.SHEET_RESPONSES, eRows);

  var msg = '테스트 데이터를 생성했습니다.\n'
          + '  응답자 ' + rRows.length + '명 / 과목 평가 ' + eRows.length + '건\n'
          + '확인 후 clearTestData() 로 반드시 삭제하세요.';
  Logger.log(msg);
  return msg;
}

function appendRows_(ss, sheetName, rows) {
  if (!rows.length) return;
  var sh = ss.getSheetByName(sheetName);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function pickPrograms_(programs, count) {
  var pool = programs.slice();
  var out = [];
  for (var i = 0; i < count && pool.length; i++) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

/** 5점 척도 표본 추출 (평균 bias 근처에 몰리도록) */
function sampleScore_(bias) {
  var v = Math.round(bias + (Math.random() + Math.random() - 1) * 1.1);
  return Math.max(1, Math.min(5, v));
}

function pick_(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 성함이 '테스트'로 시작하는 응답자와 그 응답을 모두 삭제 */
function clearTestData() {
  var ss = getSS_();
  var rs = readSheet_(CONFIG.SHEET_RESPONDENTS);

  var ids = {};
  rs.rows.forEach(function (r) {
    if (String(r['성함']).indexOf(TEST_PREFIX) === 0) ids[String(r['응답자ID'])] = true;
  });
  if (!Object.keys(ids).length) return '삭제할 테스트 데이터가 없습니다.';

  var removed =
    deleteRowsById_(ss, CONFIG.SHEET_RESPONSES, ids) +
    deleteRowsById_(ss, CONFIG.SHEET_COMMON, ids) +
    deleteRowsById_(ss, CONFIG.SHEET_HISTORY, ids) +
    deleteRowsById_(ss, CONFIG.SHEET_RESPONDENTS, ids);

  var msg = '테스트 응답자 ' + Object.keys(ids).length + '명 / 총 ' + removed + '행을 삭제했습니다.';
  Logger.log(msg);
  return msg;
}

function deleteRowsById_(ss, sheetName, idSet) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return 0;

  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var ci = headers.indexOf('응답자ID');
  if (ci < 0) return 0;

  var values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  var n = 0;
  for (var i = values.length - 1; i >= 0; i--) {
    if (idSet[String(values[i][ci])]) { sh.deleteRow(i + 2); n++; }
  }
  return n;
}

/* ===================================================================
 * 개인정보 파기
 * =================================================================== */

/**
 * 성함·연락처만 지웁니다. 통계와 주관식 의견은 그대로 남습니다.
 * 개인정보 보유기간(평가 종료 후 1년)이 지나면 실행하세요.
 */
function purgeRespondentInfo() {
  var ss = getSS_();
  var total = 0, done = [];

  // 성함·연락처가 들어가는 세 시트를 모두 지웁니다
  [CONFIG.SHEET_RESPONDENTS, CONFIG.SHEET_COMMON, CONFIG.SHEET_RESPONSES]
    .forEach(function (name) {
      var n = purgeNameColumns_(ss, name);
      if (n > 0) { total += n; done.push(name + ' ' + n + '행'); }
    });

  if (!total) return '파기할 개인정보가 없습니다.';

  var msg = '성함·연락처를 파기했습니다.\n  ' + done.join('\n  ') + '\n\n'
          + '점수·주관식 의견 등 통계 데이터는 그대로 보존됩니다.\n'
          + '집계표에도 반영하려면 [집계표 새로 만들기] 를 눌러주세요.';
  Logger.log(msg);
  return msg;
}

/** 한 시트에서 성함·연락처 열만 '(파기)' 로 바꿉니다. */
function purgeNameColumns_(ss, sheetName) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return 0;

  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var n = sh.getLastRow() - 1;
  var changed = 0;

  ['성함', '연락처'].forEach(function (col) {
    var ci = headers.indexOf(col);
    if (ci < 0) return;
    var vals = [];
    for (var i = 0; i < n; i++) vals.push(['(파기)']);
    sh.getRange(2, ci + 1, n, 1).setValues(vals);
    changed = n;
  });

  return changed;
}

/* ===================================================================
 * 차수 관리
 * =================================================================== */

/**
 * 현재 차수(CONFIG.ROUND) 데이터를 보관용 시트로 옮깁니다.
 * 다음 차수 평가를 시작하기 전에 실행하세요.
 */
function archiveRound() {
  var ss = getSS_();
  var suffix = CONFIG.ROUND.replace(/[\\\/\?\*\[\]:]/g, '');
  var moved = 0;

  [CONFIG.SHEET_RESPONDENTS, CONFIG.SHEET_COMMON, CONFIG.SHEET_RESPONSES].forEach(function (name) {
    moved += archiveSheet_(ss, name, '보관_' + suffix + '_' + name);
  });

  if (!moved) return '현재 차수(' + CONFIG.ROUND + ') 데이터가 없습니다.';

  var msg = '총 ' + moved + '행을 보관했습니다.\n'
          + 'Config.gs 의 CONFIG.ROUND 를 새 차수로 변경한 뒤 재배포하세요.';
  Logger.log(msg);
  return msg;
}

function archiveSheet_(ss, name, archiveName) {
  var sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return 0;

  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var ci = headers.indexOf('평가차수');
  if (ci < 0) return 0;

  var values = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  var keep = [], move = [];
  values.forEach(function (r) {
    if (String(r[ci]) === CONFIG.ROUND) move.push(r);
    else keep.push(r);
  });
  if (!move.length) return 0;

  var arc = ss.getSheetByName(archiveName);
  if (arc) ss.deleteSheet(arc);
  arc = ss.insertSheet(archiveName);
  arc.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#808080').setFontColor('#ffffff');
  arc.getRange(2, 1, move.length, headers.length).setValues(move);
  arc.setFrozenRows(1);

  sh.deleteRows(2, values.length);
  if (keep.length) sh.getRange(2, 1, keep.length, headers.length).setValues(keep);

  return move.length;
}

/** 모든 응답 삭제. 되돌릴 수 없으므로 반드시 백업 후 실행하세요. */
function clearAllResponses() {
  var ss = getSS_();
  var total = 0;
  [CONFIG.SHEET_RESPONDENTS, CONFIG.SHEET_COMMON,
   CONFIG.SHEET_RESPONSES, CONFIG.SHEET_HISTORY].forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return;
    var n = sh.getLastRow() - 1;
    sh.deleteRows(2, n);
    total += n;
  });
  var msg = total + '행을 삭제했습니다.';
  Logger.log(msg);
  return msg;
}

/* ===================================================================
 * 진단
 * =================================================================== */

function diagnose() {
  var props = PropertiesService.getScriptProperties();
  var lines = [];
  lines.push('제목: ' + fullTitle());
  lines.push('평가차수: ' + CONFIG.ROUND);
  lines.push('스프레드시트 ID: ' + (props.getProperty(CONFIG.PROP_SSID) || '(없음 — setup() 실행 필요)'));
  lines.push('관리자 비밀번호: ' + (props.getProperty(CONFIG.PROP_ADMIN_PW) ? '설정됨' : '(없음 — setup() 실행 필요)'));

  try {
    var ss = getSS_();
    lines.push('스프레드시트 URL: ' + ss.getUrl());
    lines.push('프로그램 수: ' + getPrograms().length + '개');

    [CONFIG.SHEET_RESPONDENTS, CONFIG.SHEET_COMMON,
     CONFIG.SHEET_RESPONSES, CONFIG.SHEET_HISTORY].forEach(function (n) {
      var sh = ss.getSheetByName(n);
      lines.push(n + ': ' + (sh && sh.getLastRow() > 1 ? sh.getLastRow() - 1 : 0) + '행');
    });
    lines.push('평가 접수: ' + (periodState_().open ? '열림' : '마감') +
               ' (' + (getPeriod_().from || '제한없음') + ' ~ ' + (getPeriod_().to || '제한없음') + ')');
  } catch (e) {
    lines.push('오류: ' + e.message);
  }

  var out = lines.join('\n');
  Logger.log(out);
  return out;
}


/* ==========================================================================
 *  Menu.gs
 * ========================================================================== */

/**
 * Menu.gs — 스프레드시트 상단에 '강의평가' 메뉴를 붙입니다.
 *
 * 스프레드시트를 열면 메뉴가 자동으로 생깁니다.
 * 편집기에 들어가지 않고도 집계표 갱신·테스트 삭제·개인정보 파기를 할 수 있습니다.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📋 강의평가')
    .addItem('집계표 새로 만들기', 'menuRefreshSummary')
    .addItem('집계표 시트 지우기', 'menuRemoveSummary')
    .addSeparator()
    .addItem('현재 상태 보기', 'menuShowStatus')
    .addItem('설문 · 관리자 주소 보기', 'menuShowLinks')
    .addSeparator()
    .addItem('테스트 데이터 삭제 (성함이 "테스트"인 것만)', 'menuClearTestData')
    .addItem('모든 응답 삭제 (개통 전 정리용)', 'menuClearAllResponses')
    .addSeparator()
    .addItem('개인정보 파기 (성함 · 연락처)', 'menuPurgeRespondentInfo')
    .addToUi();
}

function ui_() { return SpreadsheetApp.getUi(); }

function alert_(title, body) {
  ui_().alert(title, body, ui_().ButtonSet.OK);
}

function confirm_(title, body) {
  return ui_().alert(title, body, ui_().ButtonSet.YES_NO) === ui_().Button.YES;
}

/* ===================================================================
 * 집계표
 * =================================================================== */

/** 원자료를 다시 읽어 집계용 시트 4개를 새로 만듭니다. */
function menuRefreshSummary() {
  try {
    var r = buildSummaryInternal_({ round: CONFIG.ROUND });
    var m = r.stats.meta;
    alert_('집계표를 새로 만들었습니다',
      '기준 시각: ' + r.generatedAt + '\n\n' +
      '응답자 ' + m.respondentN + '명 / 과목 평가 ' + m.evalN + '건\n' +
      '전반적 만족도 ' + m.overallMean + '점 (응답자 ' + m.commonN + '명)\n\n' +
      '갱신된 시트\n' +
      '  집계표 · 문항별교차표 · 주관식의견 · 의견묶음');
  } catch (e) {
    alert_('오류', e.message);
  }
}

/** 집계용 시트만 지웁니다. 원자료는 그대로입니다. */
function menuRemoveSummary() {
  if (!confirm_('집계표 시트를 지울까요?',
      '집계표 · 문항별교차표 · 주관식의견 · 의견묶음 을 지웁니다.\n\n' +
      '응답 원자료는 지워지지 않습니다.\n' +
      '필요할 때 [집계표 새로 만들기] 로 다시 만들 수 있습니다.')) return;

  try {
    var removed = removeSummarySheets_();
    alert_('완료', removed.length
      ? '지운 시트: ' + removed.join(', ')
      : '지울 집계표 시트가 없습니다.');
  } catch (e) {
    alert_('오류', e.message);
  }
}

/* ===================================================================
 * 상태 보기
 * =================================================================== */

function menuShowStatus() {
  try {
    var ss = getSS_();
    var p = periodState_();
    var counts = [];
    [CONFIG.SHEET_RESPONDENTS, CONFIG.SHEET_COMMON,
     CONFIG.SHEET_RESPONSES, CONFIG.SHEET_HISTORY].forEach(function (n) {
      var sh = ss.getSheetByName(n);
      counts.push('  ' + n + ': ' + (sh && sh.getLastRow() > 1 ? sh.getLastRow() - 1 : 0) + '행');
    });

    var period = (p.from || p.to)
      ? (p.from || '제한 없음') + ' ~ ' + (p.to || '제한 없음')
      : '기간 미설정 (계속 접수)';

    alert_('현재 상태',
      fullTitle() + '\n\n' +
      '평가 접수: ' + (p.open ? '진행 중' : '마감') + '\n' +
      '  ' + period + '\n' +
      (p.mode !== 'auto' ? '  (수동 ' + (p.mode === 'open' ? '열림' : '닫힘') + ')\n' : '') +
      '\n쌓인 데이터\n' + counts.join('\n') + '\n' +
      '\n개설 과목: ' + getPrograms().length + '개\n' +
      '\n※ 집계표 시트는 [집계표 새로 만들기] 를 눌러야 갱신됩니다.');
  } catch (e) {
    alert_('오류', e.message);
  }
}

function menuShowLinks() {
  try {
    var url = ScriptApp.getService().getUrl();
    if (!url) {
      alert_('주소를 찾을 수 없습니다',
        '아직 배포가 되지 않았습니다.\n' +
        '[배포] > [새 배포] > 웹 앱 으로 배포한 뒤 다시 눌러주세요.');
      return;
    }
    alert_('주소',
      '◆ 어르신용 (QR코드로 배포)\n' + url + '\n\n' +
      '◆ 직원용 결과 확인 (공개 금지)\n' + url + '?page=admin\n\n' +
      '※ 직원용 주소는 안내문이나 QR코드에 넣지 마세요.');
  } catch (e) {
    alert_('오류', e.message);
  }
}

/* ===================================================================
 * 데이터 정리
 * =================================================================== */

function menuClearTestData() {
  if (!confirm_('테스트 데이터를 지울까요?',
      '성함이 "테스트" 로 시작하는 응답을\n' +
      '응답자정보 · 응답자공통 · 응답원자료 · 수정이력 에서 모두 지웁니다.\n\n' +
      '실제 어르신 응답은 지워지지 않습니다.')) return;

  try {
    var msg = clearTestData();
    alert_('완료', msg + '\n\n집계표를 쓰시려면 [집계표 새로 만들기] 를 눌러주세요.');
  } catch (e) {
    alert_('오류', e.message);
  }
}

/**
 * 응답을 전부 지웁니다. 개통 전 연습 기록을 정리할 때 씁니다.
 * 이름이 "테스트"가 아닌 연습 응답도 함께 지워지므로 두 번 확인합니다.
 */
function menuClearAllResponses() {
  var ss = getSS_();
  var counts = [];
  var total = 0;
  [CONFIG.SHEET_RESPONDENTS, CONFIG.SHEET_COMMON,
   CONFIG.SHEET_RESPONSES, CONFIG.SHEET_HISTORY].forEach(function (n) {
    var sh = ss.getSheetByName(n);
    var c = (sh && sh.getLastRow() > 1) ? sh.getLastRow() - 1 : 0;
    total += c;
    counts.push('  ' + n + ': ' + c + '행');
  });

  if (!total) { alert_('지울 응답이 없습니다', '이미 비어 있습니다.'); return; }

  if (!confirm_('응답을 모두 지울까요?',
      '지금 쌓여 있는 응답\n' + counts.join('\n') + '\n\n' +
      '이름이 "테스트"가 아닌 응답도 전부 지워집니다.\n' +
      '실제 어르신 응답이 들어오기 전에만 쓰세요.\n\n' +
      '되돌릴 수 없습니다.')) return;

  if (!confirm_('한 번 더 확인합니다',
      '정말 ' + total + '행을 모두 지우시겠습니까?\n\n' +
      '남겨야 할 응답이 있으면 [파일] > [사본 만들기] 로\n' +
      '먼저 백업해 두세요.')) return;

  try {
    var msg = clearAllResponses();
    alert_('완료', msg + '\n\n집계표도 [집계표 새로 만들기] 로 다시 만들어 주세요.');
  } catch (e) {
    alert_('오류', e.message);
  }
}

function menuPurgeRespondentInfo() {
  if (!confirm_('개인정보를 파기할까요?',
      '응답자정보 시트의 성함과 연락처를 "(파기)" 로 바꿉니다.\n' +
      '통계와 주관식 의견은 그대로 남습니다.\n\n' +
      '되돌릴 수 없습니다. 보유기간(' + CONFIG.PRIVACY_RETENTION + ')이\n' +
      '지난 뒤에만 실행하세요.')) return;

  if (!confirm_('한 번 더 확인합니다',
      '정말 파기하시겠습니까?\n파기 후에는 이어하기와 중복 확인이 불가능해집니다.')) return;

  try {
    alert_('완료', purgeRespondentInfo());
  } catch (e) {
    alert_('오류', e.message);
  }
}

