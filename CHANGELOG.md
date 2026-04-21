# Changelog

## [1.0.1] - 2026-04-21 KST

### Added
- Firestore Security Rules를 추가하여 인증된 사용자만 자신의 `users/{uid}/notes/{noteId}` 문서에 접근하도록 설정.
- Firebase Storage Security Rules를 추가하여 업로드 이미지와 캔버스 JSON이 사용자별 경로에서만 접근되도록 설정.
- `README.md`에 환경변수 관리와 배포 환경 변수 설정 방법을 문서화.

### Changed
- 메모 데이터 모델에 `userId`를 추가하고 Firestore 및 Storage 경로를 사용자별로 분리.
- Firebase 클라이언트 저장소를 인증 사용자 기준으로만 읽기/쓰기 하도록 수정.
- `.env` 파일을 명시적으로 Git 추적 대상에서 제외하고 `.env.example`만 예시로 유지하도록 정리.

### Fixed
- 인증 정보와 일치하지 않는 사용자가 다른 사용자의 메모/이미지에 접근할 수 있는 위험을 차단.
- Firestore와 Storage 저장 경로를 분리해 보안 규칙 적용 범위를 명확히 함.

### Removed
- 없음.

### Files
- `firestore.rules`
- `storage.rules`
- `firebase.json`
- `README.md`
- `src/lib/firebase.ts`
- `src/App.tsx`
- `src/types.ts`
- `.gitignore`

## [1.0.0] - 2026-04-21 KST

### Added
- React 기반 메모 앱 전체 구현.
- 텍스트 메모의 생성, 수정, 삭제 기능.
- 자동 저장 및 수동 저장 흐름.
- `createdAt` / `updatedAt` 기록과 `updatedAt` 기준 최신순 정렬.
- 제목, 본문 검색 필터.
- 카드형 메모 리스트 UI.
- 편집 화면의 텍스트 입력 영역과 드로잉 캔버스 병렬 구성.
- 펜 두께, 색상 선택, 지우개 기능을 포함한 fabric.js 드로잉 도구.
- 업로드 이미지를 캔버스에 추가하고 이동, 크기 조절, 회전하는 기능.
- Firebase Authentication, Firestore, Storage 연동 계층.
- 다크 모드와 PWA 준비용 매니페스트 구조.

### Changed
- 메모 데이터 모델에 `canvasData`와 `images` 필드를 포함하도록 설계.
- Firebase 사용 가능 시 원격 저장, 미설정 시 로컬 저장으로 동작하는 저장소 추상화 추가.

### Fixed
- 메모 편집 중 캔버스 상태가 저장되지 않는 문제를 방지하도록 변경 감지 흐름을 통합.
- 이미지와 드로잉 상태가 재열람 시 복원되도록 저장/로드 경로를 정리.

### Removed
- 없음.

### Files
- `package.json`
- `package-lock.json`
- `.gitignore`
- `index.html`
- `public/manifest.webmanifest`
- `public/icon.svg`
- `src/App.tsx`
- `src/components/*`
- `src/lib/*`
- `src/types.ts`
- `src/vite-env.d.ts`
- `src/types/fabric.d.ts`
- `src/styles.css`
