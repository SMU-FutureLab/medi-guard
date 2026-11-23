import { Redirect } from 'expo-router';

/** 없는 주소로 들어오면 홈으로 보낸다 (공유 링크·웹 배포에서 첫 주소가 다를 수 있음) */
export default function NotFound() {
  return <Redirect href="/" />;
}
