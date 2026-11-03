import Header from './components/Header';
import Hero from './components/Hero';
import AuthForm from './components/AuthForm';
import TeamApp from './TeamApp';
import useAuth from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';

// 로그인 게이트: 로그인 전에는 가입/로그인 화면만, 로그인 후 팀 화면(TeamApp)
export default function App() {
  const auth = useAuth();

  if (auth.user) return <TeamApp key={auth.user.id} auth={auth} />;

  return (
    <>
      <Header />
      <main className="container">
        <Hero />
        {!isSupabaseConfigured ? (
          <div className="demo-note warn">
            Supabase 접속 정보가 없어요. <code>.env.example</code>을 <code>.env.local</code>로 복사해 URL과 키를
            채운 뒤 dev 서버를 다시 시작하세요.
          </div>
        ) : auth.loading ? (
          <div className="empty">불러오는 중…</div>
        ) : (
          <AuthForm auth={auth} />
        )}
      </main>
      <footer>HARMONY MONY · 함께 뛰는 즐거움</footer>
    </>
  );
}
