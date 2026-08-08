import React from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, CalendarDays, Camera, Check, Heart, MapPin, Menu, MessageCircle, Sparkles, Star, X } from 'lucide-react'
import './styles.css'
import { supabase, supabaseConfigured } from './lib/supabase'
import AdminPage from './AdminPage'

const whatsapp = 'https://wa.me/5514999999999?text=Olá!%20Vi%20o%20site%20do%20Studio%20Isabella%20Beauty%20e%20gostaria%20de%20agendar.'

const services = [
  { number: '01', title: 'Lash Design', text: 'Um olhar marcante, leve e personalizado para combinar com você.', tag: 'Realce o olhar' },
  { number: '02', title: 'Makeup', text: 'Beleza, duração e acabamento impecável para momentos especiais.', tag: 'Celebre seu momento' },
  { number: '03', title: 'Design de Sobrancelhas', text: 'Simetria e naturalidade, respeitando os traços únicos do seu rosto.', tag: 'Valorize seus traços' },
]

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState('')

  async function submit(event) {
    event.preventDefault()
    setSent(false)
    setFormError('')

    if (!supabaseConfigured) {
      setFormError('O formulário está em demonstração enquanto finalizamos a conexão com o Supabase.')
      return
    }

    const form = event.currentTarget
    const data = new FormData(form)
    setSubmitting(true)

    const { error } = await supabase.from('contatos').insert({
      nome: data.get('nome')?.trim(),
      whatsapp: data.get('telefone')?.trim(),
      servico: data.get('servico'),
      data_desejada: data.get('data') || null,
      periodo: data.get('periodo') || null,
      mensagem: data.get('mensagem')?.trim() || null,
      consentimento: data.get('consentimento') === 'on',
      origem: 'site',
    })

    setSubmitting(false)

    if (error) {
      setFormError('Não foi possível enviar agora. Tente novamente em alguns instantes.')
      return
    }

    setSent(true)
    form.reset()
  }

  return (
    <main>
      <header className="header">
        <a className="brand" href="#inicio" aria-label="Studio Isabella Beauty, início">
          <span className="monogram">IB</span>
          <span><strong>Studio Isabella</strong><small>beauty</small></span>
        </a>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navegação principal">
          <a href="#servicos" onClick={() => setMenuOpen(false)}>Serviços</a>
          <a href="#sobre" onClick={() => setMenuOpen(false)}>Sobre</a>
          <a href="#resultados" onClick={() => setMenuOpen(false)}>Resultados</a>
          <a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a>
        </nav>
        <a className="button header-cta" href={whatsapp} target="_blank" rel="noreferrer">Agendar horário</a>
        <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={15}/> Beleza que revela a sua essência</p>
          <h1>Seu momento de <em>se sentir ainda mais linda.</em></h1>
          <p className="lead">Lash Design, Makeup e Design de Sobrancelhas com atendimento delicado e personalizado em Águas de Santa Bárbara.</p>
          <div className="hero-actions">
            <a className="button" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={19}/> Agendar pelo WhatsApp</a>
            <a className="text-link" href="#servicos">Conhecer os serviços <ArrowRight size={17}/></a>
          </div>
          <div className="trust"><span><Check/> Atendimento com hora marcada</span><span><MapPin/> Águas de Santa Bárbara - SP</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo" role="img" aria-label="Atendimento delicado em studio de beleza" />
          <div className="floating-card"><span>Experiência</span><strong>feita para você</strong><Heart size={20}/></div>
        </div>
      </section>

      <section className="section services" id="servicos">
        <div className="section-heading"><div><p className="eyebrow">Nossos serviços</p><h2>Cuidado em cada detalhe</h2></div><p>Escolha o cuidado que combina com seu momento. Cada atendimento é pensado para valorizar sua beleza, sem perder sua essência.</p></div>
        <div className="service-grid">
          {services.map((item) => <article className="service-card" key={item.title}>
            <div className="service-top"><span>{item.number}</span><Sparkles size={24}/></div>
            <p className="service-tag">{item.tag}</p><h3>{item.title}</h3><p>{item.text}</p>
            <a href={`${whatsapp}%20Tenho%20interesse%20em%20${encodeURIComponent(item.title)}.`} target="_blank" rel="noreferrer">Quero agendar <ArrowRight size={17}/></a>
          </article>)}
        </div>
      </section>

      <section className="about" id="sobre">
        <div className="about-image" role="img" aria-label="Detalhes de um studio de beleza elegante" />
        <div className="about-copy"><p className="eyebrow">Sobre o studio</p><h2>Beleza com intenção, cuidado e leveza.</h2><p>Olá, sou Isabella. Acredito que cuidar da beleza também é reservar um momento para você. Cada atendimento acontece com escuta, técnica e atenção aos detalhes.</p>
          <ul><li><Check/> Atendimento personalizado</li><li><Check/> Ambiente acolhedor</li><li><Check/> Materiais de qualidade</li><li><Check/> Higiene e cuidado</li></ul>
          <a className="text-link" href="#contato">Conheça seu próximo momento <ArrowRight size={17}/></a>
        </div>
      </section>

      <section className="section results" id="resultados">
        <div className="center-heading"><p className="eyebrow">Resultados</p><h2>Realces que parecem seus</h2><p>Referências visuais para apresentar o futuro portfólio do Studio Isabella.</p></div>
        <div className="result-grid">
          <div className="result result-one"><span>Lash Design</span></div>
          <div className="result result-two"><span>Makeup</span></div>
          <div className="result result-three"><span>Brows</span></div>
        </div>
      </section>

      <section className="testimonials">
        <div><p className="eyebrow">Experiência de cuidado</p><h2>Um atendimento que começa antes do espelho.</h2><div className="rating"><Star/><Star/><Star/><Star/><Star/> <span>Espaço reservado para avaliações reais</span></div></div>
        <blockquote>“Aqui poderemos mostrar como uma cliente se sentiu após o atendimento. Antes da publicação comercial, este texto será substituído por um depoimento verdadeiro.”<footer>Exemplo de depoimento • Protótipo</footer></blockquote>
      </section>

      <section className="contact" id="contato">
        <div className="contact-copy"><p className="eyebrow">Vamos conversar?</p><h2>Seu próximo momento de beleza começa aqui.</h2><p>Preencha o formulário ou fale diretamente pelo WhatsApp. O atendimento é realizado com horário marcado.</p>
          <div className="contact-info"><span><MapPin/> Águas de Santa Bárbara - SP</span><span><CalendarDays/> Atendimento com hora marcada</span><span><Camera/> @studioisabellabeauty</span></div>
          <a className="button outline" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={19}/> Falar pelo WhatsApp</a>
        </div>
        <form onSubmit={submit}>
          <div className="field-row"><label>Nome<input name="nome" required placeholder="Como podemos te chamar?" /></label><label>WhatsApp<input name="telefone" required placeholder="(14) 99999-9999" /></label></div>
          <label>Serviço desejado<select name="servico" required defaultValue=""><option value="" disabled>Selecione uma opção</option><option>Lash Design</option><option>Makeup</option><option>Design de Sobrancelhas</option><option>Quero conhecer mais de um serviço</option></select></label>
          <div className="field-row"><label>Data desejada<input type="date" name="data" /></label><label>Melhor período<select name="periodo" defaultValue=""><option value="">Sem preferência</option><option>Manhã</option><option>Tarde</option><option>Noite</option></select></label></div>
          <label>Mensagem<textarea name="mensagem" rows="3" placeholder="Conte um pouco sobre o que deseja..." /></label>
          <label className="consent"><input type="checkbox" name="consentimento" required /> Autorizo o contato pelos dados informados.</label>
          <button className="button submit" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Solicitar atendimento'} {!submitting && <ArrowRight size={18}/>}</button>
          {sent && <p className="success" role="status">Solicitação enviada! Em breve entraremos em contato.</p>}
          {formError && <p className="form-error" role="alert">{formError}</p>}
        </form>
      </section>

      <footer className="footer"><div className="brand light"><span className="monogram">IB</span><span><strong>Studio Isabella</strong><small>beauty</small></span></div><p>Lash Design • Makeup • Design de Sobrancelhas</p><p>Projeto demonstrativo — Águas de Santa Bárbara, SP</p></footer>
      <a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Agendar pelo WhatsApp"><MessageCircle/></a>
    </main>
  )
}

const isAdminRoute = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(isAdminRoute ? <AdminPage /> : <App />)
