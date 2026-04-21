# Changelog

## [1.0.6] - 2026-04-21 KST

### Added
- 상단 인증 상태를 아바타와 배지 형태로 노출하는 UI 추가.
- 메모 카드 하단에 작성자 닉네임 메타를 표시.

### Changed
- 다크 모드 색조를 더 낮고 부드러운 톤으로 조정.
- 카드, 패널, 배지의 대비를 완화해 장시간 사용 시 눈부심을 줄이도록 수정.

### Fixed
- 다크 모드에서 과도하게 강한 대비로 눈이 피로한 문제를 개선.
- 닉네임이 단순 입력값이 아니라 카드 메타로 읽히도록 UI를 정리.

### Removed
- 없음.

### Files
- `src/App.tsx`
- `src/components/Layout.tsx`
- `src/components/NoteCard.tsx`
- `src/components/NoteList.tsx`
- `src/styles.css`

## [1.0.5] - 2026-04-21 KST

### Added
- 상단 프로필 영역에 닉네임 입력과 인증 상태 표시를 추가.

### Changed
- 익명 인증은 백그라운드에서 유지하되, 사용자가 상단에서 닉네임을 입력해 식별할 수 있도록 UI를 개선.
- 로그인 상태 메시지를 사이드바 상단에 노출하도록 변경.

### Fixed
- 사용자 입장에서 로그인 위치가 보이지 않던 혼란을 완화.

### Removed
- 없음.

### Files
- `src/App.tsx`
- `src/components/Layout.tsx`
- `src/styles.css`

## [1.0.4] - 2026-04-21 KST

### Added
- Fabric 이미지 로딩을 HTML 이미지 엘리먼트 기반으로 처리하는 안정화 경로 추가.

### Changed
- 업로드/복원 시 이미지 객체를 캔버스에 추가하는 방식을 더 직접적으로 갱신하도록 수정.
- 이미지 추가 직후 `setCoords()`와 `requestRenderAll()`을 호출해 즉시 반영되도록 개선.

### Fixed
- 이미지 업로드 후 캔버스에 보이지 않던 문제를 수정.

### Removed
- 없음.

### Files
- `src/components/CanvasEditor.tsx`

## [1.0.3] - 2026-04-21 KST

### Added
- 캔버스 상태를 유지한 채 브러시/지우개 설정만 바꾸는 안정화 로직 추가.

### Changed
- 캔버스를 도구/두께/색상 변경마다 재생성하지 않고 기존 인스턴스만 갱신하도록 수정.
- 이미지 추가 시 현재 메모의 캔버스 상태와 충돌하지 않도록 로드/동기화 시점을 분리.

### Fixed
- 펜/지우개 두께를 바꾸면 그림이 사라지던 문제를 수정.
- 이미지 추가가 캔버스 재초기화에 의해 반영되지 않던 문제를 수정.

### Removed
- 없음.

### Files
- `src/components/CanvasEditor.tsx`

## [1.0.2] - 2026-04-21 KST

### Added
- Firebase Anonymous Auth가 꺼져 있을 때 원인을 바로 알 수 있는 에러 안내를 추가.

### Changed
- 인증 사용자 ID가 준비되기 전에는 저장/삭제/이미지 업로드가 진행되지 않도록 가드 추가.
- 저장 버튼을 인증 완료 전에는 비활성화하도록 수정.
- Firebase Auth 실패 메시지를 구체화해 설정 누락과 권한 거부를 구분하기 쉽게 개선.

### Fixed
- `userId`가 비어 있는 상태에서 저장 시도되며 Firestore/Storage에서 오류가 나던 문제를 방지.
- 익명 로그인 실패 시 저장 오류가 모호하게 보이던 문제를 수정.

### Removed
- 없음.

### Files
- `src/App.tsx`
- `src/lib/firebase.ts`

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
