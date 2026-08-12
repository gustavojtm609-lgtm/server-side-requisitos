import { Edit3, ListChecks, Plus, Search, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/admin.js';
import { getApiErrorMessage } from '../api/client.js';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { PageLoader } from '../components/PageLoader.jsx';

const emptyForm = { themeId: '', statement: '', explanation: '', difficulty: 'EASY', status: 'DRAFT', correctType: 'FUNCTIONAL' };
const labels = { EASY: 'Fácil', MEDIUM: 'Média', HARD: 'Difícil', DRAFT: 'Rascunho', ACTIVE: 'Ativa', INACTIVE: 'Inativa', ARCHIVED: 'Arquivada', FUNCTIONAL: 'Funcional', NON_FUNCTIONAL: 'Não funcional' };

export function QuestionsAdminPage() {
  const [questions, setQuestions] = useState([]);
  const [themes, setThemes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: '', themeId: '', difficulty: '', status: '', page: 1 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadQuestions = useCallback(async (values = filters) => {
    setLoading(true); setError('');
    try {
      const params = Object.fromEntries(Object.entries({ ...values, limit: 10 }).filter(([, value]) => value !== ''));
      const data = await adminApi.listQuestions(params);
      setQuestions(data.items); setPagination(data.pagination);
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Não foi possível carregar as perguntas.')); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { adminApi.listThemes({ limit: 100 }).then((data) => setThemes(data.items)).catch(() => setThemes([])); }, []);
  useEffect(() => { const timer = setTimeout(() => loadQuestions(filters), 250); return () => clearTimeout(timer); }, [filters, loadQuestions]);

  function changeFilter(event) { setFilters((current) => ({ ...current, [event.target.name]: event.target.value, page: 1 })); }
  function changeForm(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function openCreate() { setEditingId(null); setForm(emptyForm); setShowForm(true); setError(''); }
  function openEdit(question) {
    const correct = question.Alternatives?.find((item) => item.isCorrect)?.optionType || 'FUNCTIONAL';
    setEditingId(question.id);
    setForm({ themeId: String(question.themeId), statement: question.statement, explanation: question.explanation, difficulty: question.difficulty, status: question.status, correctType: correct });
    setShowForm(true); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const payload = { ...form, themeId: Number(form.themeId) };
      if (editingId) await adminApi.updateQuestion(editingId, payload); else await adminApi.createQuestion(payload);
      setNotice(editingId ? 'Pergunta atualizada com sucesso.' : 'Pergunta cadastrada com sucesso.');
      setShowForm(false); setEditingId(null); setForm(emptyForm); await loadQuestions(filters);
    } catch (requestError) { setError(getApiErrorMessage(requestError)); }
    finally { setSaving(false); }
  }

  async function archive(question) {
    if (!window.confirm('Arquivar esta pergunta? Ela deixará de estar disponível no quiz.')) return;
    setError(''); setNotice('');
    try { await adminApi.archiveQuestion(question.id); setNotice('Pergunta arquivada.'); await loadQuestions(filters); }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'Não foi possível arquivar a pergunta.')); }
  }

  return <div className="page-container questions-admin-page">
    <section className="page-heading-row">
      <div><span className="eyebrow"><ListChecks size={15} /> Administração</span><h1>Perguntas do quiz</h1><p>Cadastre, revise e organize as perguntas disponíveis para as partidas.</p></div>
      <button className="primary-button" type="button" onClick={openCreate}><Plus size={18} /> Nova pergunta</button>
    </section>
    {showForm && <form className="question-admin-form" onSubmit={submit}>
      <div className="admin-form-heading"><div><h2>{editingId ? 'Editar pergunta' : 'Nova pergunta'}</h2><p>Todos os campos são obrigatórios.</p></div><button className="icon-button" type="button" onClick={() => setShowForm(false)} aria-label="Fechar"><X size={20} /></button></div>
      <label className="admin-field admin-field-wide"><span>Enunciado</span><textarea name="statement" minLength="10" maxLength="2000" value={form.statement} onChange={changeForm} required /></label>
      <label className="admin-field admin-field-wide"><span>Explicação</span><textarea name="explanation" minLength="10" maxLength="3000" value={form.explanation} onChange={changeForm} required /></label>
      <label className="admin-field"><span>Tema</span><select name="themeId" value={form.themeId} onChange={changeForm} required><option value="">Selecione</option>{themes.filter((t) => t.status !== 'ARCHIVED').map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <label className="admin-field"><span>Dificuldade</span><select name="difficulty" value={form.difficulty} onChange={changeForm}>{['EASY','MEDIUM','HARD'].map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
      <label className="admin-field"><span>Resposta correta</span><select name="correctType" value={form.correctType} onChange={changeForm}><option value="FUNCTIONAL">Funcional</option><option value="NON_FUNCTIONAL">Não funcional</option></select></label>
      <label className="admin-field"><span>Status</span><select name="status" value={form.status} onChange={changeForm}>{['DRAFT','ACTIVE','INACTIVE'].map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select></label>
      <div className="admin-form-actions"><button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Salvando...' : 'Salvar pergunta'}</button></div>
    </form>}
    <ErrorMessage message={error} />{notice && <div className="admin-notice" role="status">{notice}</div>}
    <section className="admin-filter-bar">
      <label className="admin-search"><Search size={17} /><input name="search" placeholder="Buscar no enunciado" value={filters.search} onChange={changeFilter} /></label>
      <select name="themeId" value={filters.themeId} onChange={changeFilter}><option value="">Todos os temas</option>{themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <select name="difficulty" value={filters.difficulty} onChange={changeFilter}><option value="">Todas as dificuldades</option>{['EASY','MEDIUM','HARD'].map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select>
      <select name="status" value={filters.status} onChange={changeFilter}><option value="">Todos os status</option>{['DRAFT','ACTIVE','INACTIVE','ARCHIVED'].map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select>
    </section>
    {loading ? <PageLoader label="Carregando perguntas..." /> : <div className="admin-question-list">{questions.length === 0 ? <div className="admin-empty">Nenhuma pergunta encontrada.</div> : questions.map((q) => <article key={q.id} className="admin-question-card"><div className="admin-question-main"><div className="admin-tags"><span>{q.Theme?.name}</span><span className={`difficulty-pill difficulty-${q.difficulty.toLowerCase()}`}>{labels[q.difficulty]}</span><span>{labels[q.status]}</span></div><h2>{q.statement}</h2><p>{q.explanation}</p><strong>Resposta: {labels[q.Alternatives?.find((a) => a.isCorrect)?.optionType]}</strong></div><div className="admin-card-actions"><button className="icon-button bordered-icon" onClick={() => openEdit(q)} aria-label="Editar pergunta"><Edit3 size={17} /></button>{q.status !== 'ARCHIVED' && <button className="icon-button bordered-icon danger-button" onClick={() => archive(q)} aria-label="Arquivar pergunta"><Trash2 size={17} /></button>}</div></article>)}</div>}
    {pagination && pagination.totalPages > 1 && <nav className="admin-pagination" aria-label="Paginação"><button className="secondary-button" disabled={pagination.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Anterior</button><span>Página {pagination.page} de {pagination.totalPages}</span><button className="secondary-button" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Próxima</button></nav>}
  </div>;
}
