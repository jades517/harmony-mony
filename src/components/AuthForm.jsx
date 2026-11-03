import { useState } from 'react';

const MESSAGES = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않아요.',
  'Email not confirmed': '이메일 인증이 아직 안 됐어요. 받은 메일의 링크를 눌러 주세요.',
  'User already registered': '이미 가입된 이메일이에요. 로그인해 주세요.',
};

export default function AuthForm({ auth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isSignup = mode === 'signup';
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    const { data, error } = isSignup
      ? await auth.signUp(form.email.trim(), form.password, form.name.trim())
      : await auth.signIn(form.email.trim(), form.password);
    setBusy(false);
    if (error) {
      setError(MESSAGES[error.message] || error.message);
      return;
    }
    // 이메일 인증이 켜져 있으면 세션 없이 가입만 완료됨
    if (isSignup && !data.session) {
      setNotice(`${form.email}로 인증 메일을 보냈어요. 메일의 링크를 누르면 로그인돼요.`);
      setMode('login');
    }
  };

  return (
    <section className="section auth">
      <div className="section-title">
        <div>
          <span className="eyebrow dark">{isSignup ? 'JOIN THE TEAM' : 'WELCOME BACK'}</span>
          <h2>{isSignup ? '하모니모니 가입하기' : '로그인'}</h2>
        </div>
      </div>
      <form className="form-card auth-card" onSubmit={submit}>
        {isSignup && (
          <label className="wide">
            이름 (팀에서 보일 이름)
            <input value={form.name} onChange={set('name')} placeholder="예: 김하모" maxLength={20} required />
          </label>
        )}
        <label className="wide">
          이메일
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </label>
        <label className="wide">
          비밀번호{isSignup && ' (6자 이상)'}
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            minLength={6}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />
        </label>
        {error && <p className="auth-msg error wide">{error}</p>}
        {notice && <p className="auth-msg wide">{notice}</p>}
        <div className="form-actions wide">
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setMode(isSignup ? 'login' : 'signup');
              setError('');
            }}
          >
            {isSignup ? '이미 계정이 있어요 · 로그인' : '처음이에요 · 가입하기'}
          </button>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? '잠시만요…' : isSignup ? '가입하기' : '로그인'}
          </button>
        </div>
      </form>
    </section>
  );
}
