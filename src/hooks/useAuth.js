import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// 로그인 세션 상태. 이름은 가입 시 user_metadata.name 에 저장
export default function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;

  return {
    loading,
    user,
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, name) =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          // 이메일 인증 링크를 누르면 돌아올 주소 (로컬 / GitHub Pages 모두 대응)
          emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        },
      }),
    signOut: () => supabase.auth.signOut(),
    updateName: (name) => supabase.auth.updateUser({ data: { name } }),
  };
}
