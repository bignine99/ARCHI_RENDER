# ARCHI RENDER — 배포 가이드

## 📋 사전 요구사항
- Git 설치 (https://git-scm.com)
- GitHub 계정
- Vercel 계정 (https://vercel.com — GitHub 계정으로 가입 가능)

---

## 1단계: Git 커밋

프로젝트 폴더에서 **PowerShell** 또는 **Git Bash**를 열고:

```bash
# Git 초기화 (이미 되어있으면 skip)
git init

# 모든 파일 스테이지
git add .

# 첫 커밋
git commit -m "feat: ARCHI RENDER v2.5 - AI 건축 렌더링 도구"
```

---

## 2단계: GitHub 리포지토리 생성 & 푸시

### 방법 A: GitHub CLI (추천)
```bash
# GitHub CLI 설치 후
gh repo create archi-render --public --source=. --push
```

### 방법 B: 수동
1. https://github.com/new 에서 새 리포지토리 생성
   - Repository name: `archi-render`
   - Public 선택
   - README 생성하지 않음
2. 터미널에서 푸시:
```bash
git remote add origin https://github.com/YOUR_USERNAME/archi-render.git
git branch -M main
git push -u origin main
```

---

## 3단계: Vercel 배포

### 방법 A: Vercel 대시보드 (추천)
1. https://vercel.com 접속 → **Add New Project**
2. GitHub 리포지토리 `archi-render` 선택
3. **Framework Preset**: `Vite` 자동 감지됨
4. **Build Settings** 확인:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Deploy** 클릭!

> ⚠️ **환경 변수**: 이 프로젝트는 사용자가 UI에서 API 키를 직접 입력하므로, 
> Vercel 환경 변수에 별도 설정이 필요하지 않습니다.

### 방법 B: Vercel CLI
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

## 4단계: 커스텀 도메인 연결 (선택)

1. Vercel 프로젝트 → **Settings** → **Domains**
2. 원하는 도메인 입력 (예: `render.ninetynine.co.kr`)
3. DNS 레코드 설정:
   - **CNAME**: `render` → `cname.vercel-dns.com`
   - 또는 **A 레코드**: `76.76.21.21`

---

## 5단계: 회사 홈페이지 연결

회사 홈페이지의 solutions 데이터에 새 카드를 추가합니다.

### solutions.ts에 추가할 항목 예시:
```typescript
{
  id: 'archi-render',
  title: 'ARCHI RENDER',
  description: 'AI 기반 건축 스케치 → 3D 렌더링 & 시네마틱 영상 생성 도구',
  url: 'https://archi-render.vercel.app', // 또는 커스텀 도메인
  icon: '🏛️',
  category: 'Architecture',
  folder: 'Public',
  isNew: true,
}
```

### 또는 iframe 임베드:
```html
<iframe 
  src="https://archi-render.vercel.app" 
  width="100%" 
  height="900" 
  frameborder="0"
  allow="clipboard-write"
  title="ARCHI RENDER"
></iframe>
```

---

## 🔧 배포 후 업데이트

코드를 수정한 후 GitHub에 push하면 Vercel이 자동으로 재배포합니다:

```bash
git add .
git commit -m "fix: 디자인 수정"
git push
```

## ⚡ 주의사항

1. `.env.local`은 `.gitignore`에 의해 제외됩니다 (보안)
2. API 키는 사용자가 UI에서 직접 입력하므로 서버 측 설정 불필요
3. Vite 빌드 시 `process.env.API_KEY`는 빈 값이 되며, 런타임 키 입력 방식으로 동작
