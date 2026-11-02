# 축구체크 (chuk9check) — EPL 팀별 뉴스 피드

사이트명은 **축구체크**(저장소명 chuk9check). 프리미어리그 팀별 뉴스를 한국어로 보여주는 사이트. 외부 LLM API·DB 없이, **Claude Code 세션이 직접 분류·번역**하고 결과를 `data/`의 JSON으로 저장한다.

## 데이터 흐름
`scripts/fetch.mjs`(RSS 수집·규칙 필터) → `data/inbox.json` → **`/update-news` (Claude가 분류·번역)** → `data/news.json` → Next.js 앱이 읽어서 표시

## 규칙
- 뉴스 갱신은 `/update-news` 절차(`.claude/commands/update-news.md`)를 따른다.
- 저작권: 본문은 저장하지 않는다. 원문 제목 + 직접 쓴 한국어 요약 + 링크만 저장한다.
- `data/teams.json` 은 현재 시즌 20개 팀. 승강 반영 시 이 파일만 수정한다(별칭 포함).
- `data/*.json` 외에 갱신 작업 중 코드를 수정하지 않는다.
