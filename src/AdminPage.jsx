import React from 'react'
import {
  CalendarDays,
  Inbox,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { supabase, supabaseConfigured } from './lib/supabase'

const statusOptions = ['novo', 'em atendimento', 'agendado', 'finalizado']

function formatDate(value) {
  if (!value) return 'Não informada'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T12:00:00`))
}

function formatCreatedAt(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminPage() {
  const [session, setSession] = React.useState(null)
  const [checkingSession, setCheckingSession] = React.useState(true)
  const [contacts, setContacts] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [loginError, setLoginError] = React.useState('')
  const [dataError, setDataError] = React.useState('')

  React.useEffect(() => {
    if (!supabaseConfigured) {
      setCheckingSession(false)
      return undefined
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const loadContacts = React.useCallback(async () => {
    if (!supabase || !session) return
    setLoading(true)
    setDataError('')

    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .order('created_at', { ascending: false })

    setLoading(false)
    if (error) {
      setDataError('Não foi possível carregar os contatos.')
      return
    }
    setContacts(data ?? [])
  }, [session])

  React.useEffect(() => {
    if (session) loadContacts()
  }, [session, loadContacts])

  async function login(event) {
    event.preventDefault()
    setLoginError('')
    const form = new FormData(event.currentTarget)

    const { error } = await supabase.auth.signInWithPassword({
      email: form.get('email'),
      password: form.get('password'),
    })

    if (error) setLoginError('E-mail ou senha inválidos.')
  }

  async function updateStatus(id, status) {
    const previous = contacts
    setContacts((current) => current.map((item) => item.id === id ? { ...item, status } : item))

    const { error } = await supabase.from('contatos').update({ status }).eq('id', id)
    if (error) {
      setContacts(previous)
      setDataError('Não foi possível atualizar o status.')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setContacts([])
  }

  if (checkingSession) {
    return <div className="admin-loading"><LoaderCircle className="spin" /> Verificando acesso...</div>
  }

  if (!supabaseConfigured) {
    return <div className="admin-loading">O Supabase ainda não foi configurado.</div>
  }

  if (!session) {
    return (
      <main className="login-page">
        <section className="login-card">
          <a className="admin-brand" href="/"><span>IB</span><strong>Studio Isabella <small>beauty</small></strong></a>
          <div className="login-icon"><LockKeyhole /></div>
          <p className="admin-kicker">Área restrita</p>
          <h1>Acesso administrativo</h1>
          <p>Entre com o usuário autorizado para acompanhar os contatos do studio.</p>
          <form onSubmit={login}>
            <label>E-mail<input name="email" type="email" autoComplete="email" required placeholder="seu@email.com" /></label>
            <label>Senha<input name="password" type="password" autoComplete="current-password" required placeholder="Sua senha" /></label>
            <button className="button" type="submit">Entrar</button>
            {loginError && <p className="form-error" role="alert">{loginError}</p>}
          </form>
          <a className="back-site" href="/">← Voltar para o site</a>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="admin-brand" href="/"><span>IB</span><strong>Studio Isabella <small>beauty</small></strong></a>
        <div><span className="admin-email">{session.user.email}</span><button className="logout-button" onClick={logout}><LogOut /> Sair</button></div>
      </header>

      <section className="admin-content">
        <div className="admin-title">
          <div><p className="admin-kicker">Painel administrativo</p><h1>Contatos recebidos</h1><p>Acompanhe e atualize cada solicitação enviada pelo site.</p></div>
          <button className="refresh-button" onClick={loadContacts} disabled={loading}><RefreshCw className={loading ? 'spin' : ''} /> Atualizar</button>
        </div>

        <div className="admin-summary">
          <article><Inbox /><span>Total de contatos</span><strong>{contacts.length}</strong></article>
          <article><CalendarDays /><span>Novos contatos</span><strong>{contacts.filter((item) => item.status === 'novo').length}</strong></article>
          <article><MapPin /><span>Origem</span><strong>Site</strong></article>
        </div>

        {dataError && <p className="form-error" role="alert">{dataError}</p>}
        {loading && contacts.length === 0 ? <div className="empty-state"><LoaderCircle className="spin" /> Carregando contatos...</div> : null}
        {!loading && contacts.length === 0 ? <div className="empty-state"><Inbox /><h2>Nenhum contato recebido</h2><p>Os formulários enviados aparecerão aqui.</p></div> : null}

        <div className="contacts-grid">
          {contacts.map((contact) => (
            <article className="contact-card" key={contact.id}>
              <div className="contact-card-top"><div><span className="contact-id">Contato #{contact.id}</span><h2>{contact.nome}</h2><a href={`https://wa.me/55${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{contact.whatsapp}</a></div><span className={`status status-${contact.status.replace(' ', '-')}`}>{contact.status}</span></div>
              <dl><div><dt>Serviço</dt><dd>{contact.servico}</dd></div><div><dt>Data desejada</dt><dd>{formatDate(contact.data_desejada)}</dd></div><div><dt>Período</dt><dd>{contact.periodo || 'Não informado'}</dd></div><div><dt>Recebido</dt><dd>{formatCreatedAt(contact.created_at)}</dd></div></dl>
              {contact.mensagem && <div className="contact-message"><span>Mensagem</span><p>{contact.mensagem}</p></div>}
              <label className="status-control">Status do atendimento<select value={contact.status} onChange={(event) => updateStatus(contact.id, event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
