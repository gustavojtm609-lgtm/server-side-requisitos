import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client.js';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { useAuth } from '../hooks/useAuth.js';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mockEnabled = import.meta.env.VITE_USE_MOCK === 'true';

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível entrar. Verifique seus dados.'));
    } finally {
      setSubmitting(false);
    }
  }

  function useDemoAccount() {
    setForm({ email: 'demo@quiz.dev', password: 'Demo1234' });
  }

  return (
    <AuthLayout
      eyebrow="Bem-vindo de volta"
      title="Entre para continuar"
      description="Use sua conta para salvar pontuação, tempo e histórico."
      footer={<>Ainda não possui conta? <Link to="/cadastro">Criar conta</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label>
          <span>E-mail</span>
          <span className="input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="voce@exemplo.com"
              autoComplete="email"
              required
            />
          </span>
        </label>

        <label>
          <span>Senha</span>
          <span className="input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={updateField}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        <button className="primary-button full-button" type="submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
          {!submitting && <ArrowRight size={18} aria-hidden="true" />}
        </button>

        {mockEnabled && (
          <button className="demo-button" type="button" onClick={useDemoAccount}>
            Preencher conta de demonstração
          </button>
        )}
      </form>
    </AuthLayout>
  );
}

