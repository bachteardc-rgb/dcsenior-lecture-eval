/**
 * apps-script/survey.html  →  index.html  (Vercel에 올라가는 파일)
 *
 * 실행:  node build.mjs
 *
 * 설문 화면을 두 벌로 관리하지 않기 위한 스크립트입니다.
 * 화면을 고칠 때는 apps-script/survey.html 하나만 고치고 이걸 실행하세요.
 * (survey.html 은 Apps Script 안에서도 그대로 쓸 수 있는 원본으로 남습니다)
 *
 * 하는 일은 네 가지뿐입니다.
 *   1) <?!= include('styles') ?>  →  styles.html 내용을 그대로 끼워 넣기
 *   2) var CFG = <?!= cfg ?>;     →  빈 값으로 두고, 열릴 때 API에서 받아오기
 *   3) google.script.run          →  같은 모양으로 동작하는 fetch 껍데기 추가
 *   4) 맨 아래 "시작" 부분        →  설정을 받아온 뒤에 실행되도록 boot() 로 감싸기
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(DIR, f), 'utf8');
const NL = String.fromCharCode(10);

/* ---------- Apps Script 웹앱 주소 ---------- */
const URL_FILE = 'api-url.txt';
let API_URL = '';
try {
  API_URL = read(URL_FILE).trim().split('\n')[0].trim();
} catch {
  fs.writeFileSync(path.join(DIR, URL_FILE),
    '여기에 Apps Script 웹앱의 /exec 주소를 한 줄로 붙여넣으세요\n', 'utf8');
}
const urlReady = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(API_URL);
if (!urlReady) {
  console.warn('\n  ⚠  ' + URL_FILE + ' 에 아직 /exec 주소가 없습니다.');
  console.warn('     index.html 은 만들어지지만 저장이 되지 않습니다.');
  console.warn('     주소를 넣고 node build.mjs 를 다시 실행하세요.\n');
}

/* ---------- 설정 스냅샷 ----------
   이 기기에 저장해 둔 설정이 없는 "처음 들어오신 분"도 기다리지 않도록,
   빌드할 때 받아둔 설정을 파일 안에 넣어둡니다. 화면은 이걸로 즉시 그리고,
   최신 설정은 뒤에서 받아와 달라진 것이 있으면 맞춰줍니다. */
let SNAPSHOT = 'null';
if (urlReady) {
  try {
    const r = await fetch(API_URL + '?action=config');
    const j = await r.json();
    if (j && j.ok && j.data) {
      SNAPSHOT = JSON.stringify(j.data);
      console.log('   설정 스냅샷 포함 — 과목 ' + j.data.programs.length + '개');
    }
  } catch (e) {
    console.warn('   ⚠ 설정 스냅샷을 받지 못했습니다. 첫 화면이 조금 늦게 뜹니다.');
  }
}

/* ---------- 원본 읽기 ---------- */
const styles = read('apps-script/styles.html');
let html = read('apps-script/survey.html');

/* ---------- 1) 스타일 끼워 넣기 ---------- */
const INCLUDE = "<?!= include('styles') ?>";
if (!html.includes(INCLUDE)) throw new Error('survey.html 에서 ' + INCLUDE + ' 를 찾지 못했습니다');
// 휴대폰이 화면을 제 폭으로 그리게 하는 태그.
// 이것이 없으면 375px 휴대폰이 981px 로 그린 뒤 축소해서 글씨가 깨알같이 보입니다.
// (Apps Script 에서는 addMetaTag 가 넣어주던 것이라 여기서 따로 넣어야 합니다)
const HEAD =
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">' + NL +
  '  <title>대치노인복지관 사회교육프로그램 강의평가</title>' + NL +
  '  <meta name="theme-color" content="#1f3864">' + NL +
  '  <meta property="og:title" content="사회교육프로그램 강의평가">' + NL +
  '  <meta property="og:description" content="대치노인복지관 사회교육프로그램 강의평가입니다. 약 5분 걸립니다.">' + NL +
  '  <meta property="og:type" content="website">' + NL +
  '  ';

const PRECONNECT =
  '<link rel="preconnect" href="https://script.google.com" crossorigin>' + NL +
  '  <link rel="preconnect" href="https://script.googleusercontent.com" crossorigin>' + NL +
  '  ';
html = html.replace(INCLUDE, HEAD + PRECONNECT + styles.trim());

/* ---------- 2) + 3) CFG 자리에 통신 껍데기 넣기 ---------- */
const CFG_LINE = 'var CFG = <?!= cfg ?>;';
if (!html.includes(CFG_LINE)) throw new Error('survey.html 에서 ' + CFG_LINE + ' 를 찾지 못했습니다');

const SHIM = `/* ===================================================================
 * Apps Script 와 통신하는 부분  (build.mjs 가 자동으로 넣은 코드)
 *
 * 이 화면은 Vercel에 올라가 있어서 google.script.run 을 쓸 수 없습니다.
 * 대신 아래에서 같은 이름·같은 사용법의 껍데기를 만들어 둡니다.
 * 덕분에 화면 코드(아래 전부)는 Apps Script에 있을 때와 글자 하나 다르지 않습니다.
 * =================================================================== */

var API_URL = ${JSON.stringify(API_URL)};
var CFG = null;

/* 빌드할 때 받아둔 설정 — 처음 들어오신 분의 첫 화면용 */
var CFG_SNAPSHOT = ${SNAPSHOT};

/* POST 의 Content-Type 이 text/plain 인 것은 실수가 아닙니다.
   application/json 으로 보내면 브라우저가 사전확인(OPTIONS)을 먼저 보내는데
   Apps Script 는 그 요청을 처리하지 못해 무조건 실패합니다. */
function apiPost(action, args) {
  return apiFetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: action, args: args })
  });
}

function apiGet(action) {
  return apiFetch(API_URL + '?action=' + encodeURIComponent(action), { method: 'GET' });
}

/* 20초 안에 답이 없거나 통신이 끊기면 한 번만 다시 시도합니다.
   네 가지 저장 요청은 모두 같은 요청을 두 번 보내도 덧쓰기만 되므로
   (응답자ID + 과목코드 기준) 중복 저장될 걱정이 없습니다. */
function apiFetch(url, opts, isRetry) {
  var ctl = ('AbortController' in window) ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
  if (ctl) opts.signal = ctl.signal;

  return fetch(url, opts)
    .then(function (res) { return res.text(); })
    .then(function (text) {
      clearTimeout(timer);
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error('서버가 올바른 응답을 주지 않았습니다.');
      }
    })
    .catch(function (err) {
      clearTimeout(timer);
      if (isRetry) throw err;
      return apiFetch(url, opts, true);
    });
}

/* google.script.run 과 똑같이 쓸 수 있는 껍데기.
   .withSuccessHandler(...).withFailureHandler(...).startSession(...) 형태 그대로. */
var google = window.google || {};
google.script = google.script || {};
(function () {
  var METHODS = ['startSession', 'setSelection', 'saveProgramEval', 'saveCommon'];

  function runner(onOk, onFail) {
    var o = {
      withSuccessHandler: function (f) { return runner(f, onFail); },
      withFailureHandler: function (f) { return runner(onOk, f); }
    };
    METHODS.forEach(function (name) {
      o[name] = function () {
        var args = Array.prototype.slice.call(arguments);
        apiPost(name, args).then(
          function (res) { if (onOk) onOk(res); },
          function (err) { if (onFail) onFail(err); }
        );
      };
    });
    return o;
  }

  google.script.run = runner(null, null);
  window.google = google;
})();`;

html = html.replace(CFG_LINE, SHIM);

/* ---------- 2-1) CFG 가 도착하기 전에 실행되면 안 되는 줄 미루기 ----------
   survey.html 은 CFG 가 처음부터 있다고 보고 최상위에서 바로 씁니다.
   Vercel 에서는 CFG 가 나중에 도착하므로 boot() 안으로 옮깁니다. */
const SCALE_LINE =
  'var SCALE_OPTS = CFG.scale.map(function (s) { return { v: s.v, label: s.label }; });';
if (!html.includes(SCALE_LINE)) throw new Error('survey.html 에서 SCALE_OPTS 정의를 찾지 못했습니다');
html = html.replace(SCALE_LINE, 'var SCALE_OPTS = [];   // CFG 가 도착한 뒤 boot() 에서 채웁니다');

/* ---------- 4) 시작 부분을 boot() 로 감싸기 ---------- */
const START = '/* ================= 시작 ================= */';
const i = html.indexOf(START);
if (i === -1) throw new Error('survey.html 에서 시작 구분선을 찾지 못했습니다');

const head = html.slice(0, i);
const rest = html.slice(i + START.length);
const j = rest.lastIndexOf('</script>');
if (j === -1) throw new Error('survey.html 에서 </script> 를 찾지 못했습니다');

const bootBody = rest.slice(0, j).trimEnd();
const after = rest.slice(j);

const BOOT = `/* ================= 시작 ================= */
/* 원래는 여기서 바로 화면을 그렸지만, Vercel 에서는 문항을 먼저
   받아와야 하므로 설정이 도착한 뒤에 실행되도록 감싸 두었습니다. */

function boot() {
  SCALE_OPTS = CFG.scale.map(function (s) { return { v: s.v, label: s.label }; });
${bootBody.split('\n').map(function (l) { return l ? '  ' + l : l; }).join('\n')}
}

/* 문항·안내문구·접수기간을 Apps Script 에서 받아옵니다.
 *
 * 구글시트에서 설정을 받아오는 데 2초쯤 걸립니다. 매번 그걸 기다리면
 * 화면이 빈 채로 2초가 흐릅니다. 그래서 한 번 받은 설정을 이 기기에
 * 저장해 두고, 다음부터는 그걸로 먼저 그린 뒤 최신 설정을 뒤에서 받아옵니다.
 * 복지관 태블릿처럼 여러 분이 돌아가며 쓰는 경우에 특히 효과가 큽니다.
 */
(function () {
  var CACHE_KEY = 'dcse_cfg';
  var MAX_AGE = 6 * 60 * 60 * 1000;   // 6시간이 지난 설정은 쓰지 않습니다

  var cached = null;
  try {
    var raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      var o = JSON.parse(raw);
      if (o && o.at && (Date.now() - o.at) < MAX_AGE && o.data) cached = o.data;
    }
  } catch (e) {}

  if (!cached && CFG_SNAPSHOT) cached = CFG_SNAPSHOT;   // 처음 들어오신 분

  if (cached) { CFG = cached; boot(); }
  else { $('ttl').textContent = '불러오는 중입니다...'; }

  apiGet('config').then(function (res) {
    if (!res || !res.ok || !res.data) throw new Error((res && res.message) || '설정을 받지 못했습니다.');
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: res.data }));
    } catch (e) {}

    if (!cached) { CFG = res.data; boot(); return; }

    // 저장해 둔 설정으로 이미 그린 뒤입니다. 달라진 것이 있으면 맞춰줍니다.
    var changed = JSON.stringify(res.data) !== JSON.stringify(cached);
    CFG = res.data;
    if (CFG.period && CFG.period.open === false) { showClosed(CFG.period); return; }
    if (changed && step === 0) {   // 아직 시작 전일 때만 다시 그립니다
      SCALE_OPTS = CFG.scale.map(function (s) { return { v: s.v, label: s.label }; });
      STEPS = buildSteps();
      render();
    }
  }).catch(function () {
    if (cached) return;   // 저장해 둔 설정으로 이미 진행 중이면 그대로 둡니다
    $('ttl').textContent = '사회교육프로그램 강의평가';
    $('wrap').innerHTML =
      '<div class="card">' +
      '<h2>잠시 연결이 되지 않습니다</h2>' +
      '<p>인터넷 연결을 확인하신 뒤 화면을 새로고침해 주세요.</p>' +
      '<p>계속 같은 화면이 나오면 복지관 사무실로 알려주시기 바랍니다.</p>' +
      '</div>';
    $('navbar').style.display = 'none';
  });
})();
${after}`;

html = head + BOOT;

/* ---------- 쓰기 ---------- */
fs.writeFileSync(path.join(DIR, 'index.html'), html, 'utf8');
console.log('index.html 생성 완료 — ' + html.split('\n').length + '줄, ' +
            (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0) + 'KB' +
            (urlReady ? '' : '  (※ API 주소 없음)'));
