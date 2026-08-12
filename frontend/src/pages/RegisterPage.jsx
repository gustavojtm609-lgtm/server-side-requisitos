import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client.js';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { useAuth } from '../hooks/useAuth.js';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível criar a conta.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Comece agora"
      title="Crie sua conta"
      description="Seu progresso e seus melhores resultados ficarão registrados."
      footer={<>Já possui uma conta? <Link to="/login">Entrar</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label>
          <span>Nome</span>
          <span className="input-wrap">
            <UserRound size={18} aria-hidden="true" />
            <input name="name" value={form.name} onChange={updateField} minLength="2" maxLength="100" placeholder="Seu nome" autoComplete="name" required />
          </span>
        </label>
        <label>
          <span>E-mail</span>
          <span className="input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input name="email" type="email" value={form.email} onChange={updateField} placeholder="voce@exemplo.com" autoComplete="email" required />
          </span>
        </label>
        <label>
          <span>Senha</span>
          <span className="input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input name="password" type="password" value={form.password} onChange={updateField} minLength="8" maxLength="72" placeholder="Mínimo de 8 caracteres" autoComplete="new-password" required />
          </span>
          <small className="field-help">Use letra maiúscula, minúscula e número.</small>
        </label>
        <button className="primary-button full-button" type="submit" disabled={submitting}>
          {submitting ? 'Criando conta...' : 'Criar conta'}
          {!submitting && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </form>
    </AuthLayout>
  );
}

