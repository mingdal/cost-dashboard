# 원가/관리회계 시스템

> 금융 IT 신입 개발자 포트폴리오 — AI 바이브코딩 기반 개발

## 시스템 개요

5개 본부, 20개 프로젝트의 원가를 집계하고 표준원가 대비 실적을 분석하는 웹 대시보드입니다.

| 기능 | 설명 |
|------|------|
| 탭1 원가 입력 | 본부/프로젝트 선택 후 인건비·경비·감가상각비·공통배부비 입력 |
| 탭2 차이 분석 | 표준원가 vs 실제원가 비교, 초과/절감 색상 구분 |
| 탭3 대시보드 | 전사 요약 카드, 본부별 막대그래프, 상위/하위 5개 순위 |

## 기술 스택

- React 18 + Vite
- Recharts (차트 라이브러리)
- In-Memory State (외부 API 없음)

---

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
# → http://localhost:5173/cost-dashboard/ 에서 확인
```

---

## GitHub Pages 배포 방법

### 1단계 — vite.config.js 수정

`vite.config.js`에서 `base`를 **본인의 저장소 이름**으로 변경합니다.

```js
// 저장소 이름이 "my-portfolio"라면:
base: '/my-portfolio/',
```

### 2단계 — GitHub 저장소 생성 및 코드 푸시

```bash
git init
git add .
git commit -m "feat: 원가관리회계 시스템 초기 커밋"
git branch -M main
git remote add origin https://github.com/[본인계정]/[저장소이름].git
git push -u origin main
```

### 3단계 — GitHub Pages 설정

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: `GitHub Actions` 선택
3. `main` 브랜치에 푸시하면 자동 배포 시작

### 4단계 — 배포 확인

```
https://[본인계정].github.io/[저장소이름]/
```

배포 완료까지 약 1~2분 소요됩니다.

---

## 프로젝트 구조

```
cost-dashboard/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 자동 배포
├── src/
│   ├── App.jsx               # 메인 앱 (전체 로직 포함)
│   └── main.jsx              # React 엔트리포인트
├── index.html
├── package.json
├── vite.config.js            # ⚠️ base 경로 수정 필요
└── README.md
```

---

## 개발 배경

본 프로젝트는 AI(Claude)를 활용한 바이브코딩 방식으로 개발되었습니다.
기획서(PDF)와 함께 포트폴리오로 제출합니다.
