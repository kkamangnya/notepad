# Noteapad

React + Firebase 메모 앱.

## 보안

- Firestore는 `users/{uid}/notes/{noteId}` 경로를 사용합니다.
- 각 문서에는 `userId`가 포함되어야 하며, 인증된 사용자 본인만 읽기/쓰기할 수 있습니다.
- Storage는 `users/{uid}/notes/...` 경로를 사용하며 동일한 사용자만 접근할 수 있습니다.

## 환경변수

- 로컬 개발은 `.env` 파일을 사용합니다.
- `.env` 파일은 Git 저장소에 포함하지 않습니다.
- 환경 예시는 [.env.example](./.env.example)를 참고합니다.

## 배포

- Vercel, Netlify, Firebase Hosting에서는 프로젝트 설정의 Environment Variables 기능에 Firebase 설정값을 등록합니다.
- 클라이언트에 포함되는 Firebase API 키는 프로젝트 식별용이며, 실제 보호는 Firebase Authentication과 Security Rules로 수행합니다.
