# chuk9check — EPL 팀별 뉴스 (한국어)

BBC Sport · Sky Sports · The Guardian 의 프리미어리그 기사를 모아 **팀 태그 + 한국어 제목/요약**으로 보여주는 사이트.
내 구단을 고르면 그 팀 기사가 위로 올라옵니다.

외부 LLM API 키·DB·서버 크론이 **필요 없습니다.** 분류·번역은 Claude Code 세션이 직접 하고, 결과는 `data/news.json`에 저장됩니다.

## 실행해서 보기

```bash
npm install
npm run dev
```

http://localhost:3000 → 처음 접속하면 내 구단 선택창이 뜹니다. (선택은 브라우저에 저장)
저장소에 이미 뉴스 데이터가 들어 있어서 바로 결과를 볼 수 있습니다.

## 뉴스 갱신하기

저장소 폴더에서 Claude Code를 열고:

```
/update-news
```

Claude가 RSS 수집 → 팀 분류·한국어 번역/요약 → `data/news.json` 갱신 → 커밋·푸시까지 수행합니다.
(수집만 따로 보려면 `npm run fetch`, 데이터 형식 검사는 `npm run validate`)

## 구조

```
data/teams.json     현재 시즌 20개 팀 + 별칭 (승강 시 이 파일만 수정)
data/sources.json   출처와 RSS 주소
data/news.json      ★ 화면에 표시되는 기사 (Claude가 작성)
data/inbox.json     수집 직후 처리 대기열 (처리 후 비워짐)
data/seen.json      EPL 외로 제외한 URL (재처리 방지)
scripts/fetch.mjs   RSS 수집 + 규칙 필터 (LLM 없음)
scripts/validate.mjs news.json 형식 검증
.claude/commands/update-news.md   갱신 절차 (Claude Code 슬래시 명령)
app/ components/ lib/             Next.js 화면
```

## 저작권 방침
기사 본문은 저장하지 않습니다. 원문 제목 + 직접 쓴 한국어 요약 + 원문 링크만 사용합니다.

## 로드맵
- 2단계: 웹 푸시 알림, 같은 소식 묶기, 기자 프로필
- 3단계: X(트위터) 기자 연동, Google 로그인
