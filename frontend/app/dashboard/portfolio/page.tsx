'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiPrivate } from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────
type Project    = { id: string; title: string; slug: string; description: string | null; tech_stack: string[]; images: object | null; featured: boolean; order_index: number }
type Skill      = { id: string; name: string; category: string; icon_url: string | null; order_index: number }
type Cert       = { id: string; name: string; issuer: string | null; issue_date: string | null; credential_id: string | null; url: string | null }
type Experience = { id: string; company: string; role: string; start_date: string | null; end_date: string | null; description: string[] | null; order_index: number }
type ResumeInfo = { url: string; hasCustom: boolean }
type Tab        = 'projects' | 'skills' | 'certs' | 'experiences' | 'resume'

// ─── Icons ────────────────────────────────────────────────────────────────────
const sv = { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style: { display: 'block' as const } }
function IcEdit()  { return <svg {...sv}><path d="M11 2.5L13.5 5 6 12.5H3.5v-2.5L11 2.5z"/></svg> }
function IcTrash() { return <svg {...sv}><polyline points="2,5 14,5"/><path d="M5 5V3h6v2"/><path d="M4 5l1 9h6l1-9"/></svg> }
function IcX()     { return <svg {...sv}><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg> }
function IcPlus()  { return <svg {...sv}><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg> }
function IcSave()  { return <svg {...sv}><polyline points="2,9 6,13 14,3"/></svg> }

// ─── Shared styles ────────────────────────────────────────────────────────────
const iSt: React.CSSProperties = {
  width: '100%', padding: '8px 11px', boxSizing: 'border-box',
  background: 'hsl(0 0% 5%)', border: '1px solid hsl(0 0% 20%)',
  color: 'hsl(0 0% 78%)', fontSize: 12, letterSpacing: '0.04em',
  outline: 'none', fontFamily: 'var(--font-roboto-flex)',
}
const thSt: React.CSSProperties = { padding: '8px 14px', textAlign: 'left', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'hsl(0 0% 26%)', borderBottom: '1px solid hsl(0 0% 15%)', whiteSpace: 'nowrap' }
const tdSt: React.CSSProperties = { padding: '9px 14px', fontSize: 11, letterSpacing: '0.04em', color: 'hsl(0 0% 55%)', borderBottom: '1px solid hsl(0 0% 12%)', verticalAlign: 'middle' }

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'hsl(158 64% 36%)', textTransform: 'uppercase', marginBottom: 5 }}>
        &gt; {label}
      </div>
      {children}
    </div>
  )
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [tab, setTab]               = useState<Tab>('projects')
  const [panelOpen, setPanelOpen]   = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [status, setStatus]         = useState<{ ok: boolean; msg: string } | null>(null)
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)

  // ── Data ──────────────────────────────────────────────────────────────────
  const [projects,    setProjects]    = useState<Project[]>([])
  const [skills,      setSkills]      = useState<Skill[]>([])
  const [certs,       setCerts]       = useState<Cert[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [resumeInfo, setResumeInfo]   = useState<ResumeInfo>({ url: '/resume.pdf', hasCustom: false })
  const [resumeFile, setResumeFile]   = useState<File | null>(null)

  // ── Form state per tab ────────────────────────────────────────────────────
  const [pf, setPf] = useState({ title: '', slug: '', description: '', tech_stack: '', order_index: '0', featured: false })
  const [sf, setSf] = useState({ name: '', category: '', icon_url: '', order_index: '0' })
  const [cf, setCf] = useState({ name: '', issuer: '', issue_date: '', credential_id: '', url: '' })
  const [ef, setEf] = useState({ company: '', role: '', start_date: '', end_date: '', description: '', order_index: '0' })

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'projects')    setProjects(await apiPrivate<Project[]>('/portfolio/projects'))
      if (tab === 'skills')      setSkills(await apiPrivate<Skill[]>('/portfolio/skills'))
      if (tab === 'certs')       setCerts(await apiPrivate<Cert[]>('/portfolio/certifications'))
      if (tab === 'experiences') setExperiences(await apiPrivate<Experience[]>('/portfolio/experiences'))
      if (tab === 'resume')      setResumeInfo(await apiPrivate<ResumeInfo>('/portfolio/resume'))
    } catch (err) {
      flash(false, (err as Error).message || 'failed to load records')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [load])

  // ── Helpers ───────────────────────────────────────────────────────────────
  function flash(ok: boolean, msg: string) {
    setStatus({ ok, msg })
    setTimeout(() => setStatus(null), 4000)
  }

  function resetForms() {
    setPf({ title: '', slug: '', description: '', tech_stack: '', order_index: '0', featured: false })
    setSf({ name: '', category: '', icon_url: '', order_index: '0' })
    setCf({ name: '', issuer: '', issue_date: '', credential_id: '', url: '' })
    setEf({ company: '', role: '', start_date: '', end_date: '', description: '', order_index: '0' })
  }

  function openAdd() {
    setEditingId(null)
    resetForms()
    setPanelOpen(true)
  }

  function openEdit(item: Project | Skill | Cert | Experience) {
    setEditingId(item.id)
    if (tab === 'projects') {
      const p = item as Project
      setPf({ title: p.title, slug: p.slug, description: p.description ?? '', tech_stack: (p.tech_stack ?? []).join(', '), order_index: String(p.order_index), featured: p.featured })
    } else if (tab === 'skills') {
      const s = item as Skill
      setSf({ name: s.name, category: s.category, icon_url: s.icon_url ?? '', order_index: String(s.order_index) })
    } else if (tab === 'certs') {
      const c = item as Cert
      setCf({ name: c.name, issuer: c.issuer ?? '', issue_date: c.issue_date ?? '', credential_id: c.credential_id ?? '', url: c.url ?? '' })
    } else {
      const e = item as Experience
      setEf({ company: e.company, role: e.role, start_date: e.start_date ?? '', end_date: e.end_date ?? '', description: (e.description ?? []).join('\n'), order_index: String(e.order_index) })
    }
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditingId(null)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'

      if (tab === 'projects') {
        const body = { title: pf.title, slug: pf.slug, description: pf.description || null, tech_stack: pf.tech_stack.split(',').map(s => s.trim()).filter(Boolean), order_index: parseInt(pf.order_index) || 0, featured: pf.featured }
        const path = editingId ? `/portfolio/projects/${editingId}` : '/portfolio/projects'
        const r = await apiPrivate<Project>(path, { method, body: JSON.stringify(body) })
        setProjects(prev => editingId ? prev.map(p => p.id === editingId ? r : p) : [...prev, r])

      } else if (tab === 'skills') {
        const body = { name: sf.name, category: sf.category, icon_url: sf.icon_url || null, order_index: parseInt(sf.order_index) || 0 }
        const path = editingId ? `/portfolio/skills/${editingId}` : '/portfolio/skills'
        const r = await apiPrivate<Skill>(path, { method, body: JSON.stringify(body) })
        setSkills(prev => editingId ? prev.map(s => s.id === editingId ? r : s) : [...prev, r])

      } else if (tab === 'certs') {
        const body = { name: cf.name, issuer: cf.issuer || null, issue_date: cf.issue_date || null, credential_id: cf.credential_id || null, url: cf.url || null }
        const path = editingId ? `/portfolio/certifications/${editingId}` : '/portfolio/certifications'
        const r = await apiPrivate<Cert>(path, { method, body: JSON.stringify(body) })
        setCerts(prev => editingId ? prev.map(c => c.id === editingId ? r : c) : [...prev, r])

      } else {
        const body = { company: ef.company, role: ef.role, start_date: ef.start_date || null, end_date: ef.end_date || null, description: ef.description ? ef.description.split('\n').filter(Boolean) : null, order_index: parseInt(ef.order_index) || 0 }
        const path = editingId ? `/portfolio/experiences/${editingId}` : '/portfolio/experiences'
        const r = await apiPrivate<Experience>(path, { method, body: JSON.stringify(body) })
        setExperiences(prev => editingId ? prev.map(e => e.id === editingId ? r : e) : [...prev, r])
      }

      flash(true, editingId ? 'record_updated' : 'record_created')
      closePanel()
    } catch (err) {
      flash(false, (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      const ep = tab === 'certs' ? 'certifications' : tab
      await apiPrivate(`/portfolio/${ep}/${id}`, { method: 'DELETE' })
      if (tab === 'projects')    setProjects(prev => prev.filter(p => p.id !== id))
      if (tab === 'skills')      setSkills(prev => prev.filter(s => s.id !== id))
      if (tab === 'certs')       setCerts(prev => prev.filter(c => c.id !== id))
      if (tab === 'experiences') setExperiences(prev => prev.filter(e => e.id !== id))
      flash(true, 'record_deleted')
    } catch {
      flash(false, 'delete_failed')
    } finally {
      setConfirmDel(null)
    }
  }

  async function handleResumeUpload() {
    if (!resumeFile) {
      flash(false, 'select_a_pdf_first')
      return
    }
    if (resumeFile.type !== 'application/pdf') {
      flash(false, 'resume_must_be_pdf')
      return
    }

    setUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append('file', resumeFile)
      const r = await apiPrivate<ResumeInfo>('/portfolio/resume', {
        method: 'POST',
        body: formData,
      })
      setResumeInfo({
        ...r,
        url: `${r.url}${r.url.includes('?') ? '&' : '?'}v=${Date.now()}`,
      })
      setResumeFile(null)
      flash(true, 'resume_updated')
    } catch (err) {
      flash(false, (err as Error).message)
    } finally {
      setUploadingResume(false)
    }
  }

  // ── Form render ───────────────────────────────────────────────────────────
  function renderForm() {
    if (tab === 'projects') return (
      <>
        <Fld label="title">
          <input style={iSt} value={pf.title} placeholder="Project title"
            onChange={e => setPf(p => ({ ...p, title: e.target.value, slug: p.slug || toSlug(e.target.value) }))} />
        </Fld>
        <Fld label="slug">
          <input style={iSt} value={pf.slug} placeholder="project-slug"
            onChange={e => setPf(p => ({ ...p, slug: e.target.value }))} />
        </Fld>
        <Fld label="description">
          <textarea style={{ ...iSt, resize: 'vertical' }} rows={4} value={pf.description} placeholder="Project description..."
            onChange={e => setPf(p => ({ ...p, description: e.target.value }))} />
        </Fld>
        <Fld label="tech_stack (comma-separated)">
          <input style={iSt} value={pf.tech_stack} placeholder="React, TypeScript, Tailwind CSS"
            onChange={e => setPf(p => ({ ...p, tech_stack: e.target.value }))} />
        </Fld>
        <Fld label="order_index">
          <input style={iSt} type="number" value={pf.order_index}
            onChange={e => setPf(p => ({ ...p, order_index: e.target.value }))} />
        </Fld>
        <Fld label="featured">
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <input type="checkbox" checked={pf.featured} style={{ accentColor: 'hsl(158 64% 36%)', width: 13, height: 13 }}
              onChange={e => setPf(p => ({ ...p, featured: e.target.checked }))} />
            <span style={{ fontSize: 11, color: 'hsl(0 0% 45%)', letterSpacing: '0.08em' }}>show on homepage</span>
          </label>
        </Fld>
      </>
    )

    if (tab === 'skills') return (
      <>
        <Fld label="name">
          <input style={iSt} value={sf.name} placeholder="Skill name"
            onChange={e => setSf(p => ({ ...p, name: e.target.value }))} />
        </Fld>
        <Fld label="category">
          <select style={{ ...iSt, appearance: 'none' }} value={sf.category}
            onChange={e => setSf(p => ({ ...p, category: e.target.value }))}>
            <option value="">-- select category --</option>
            {['frontend', 'backend', 'database', 'tools', 'it_support'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Fld>
        <Fld label="icon_url">
          <input style={iSt} value={sf.icon_url} placeholder="/logo/react.png"
            onChange={e => setSf(p => ({ ...p, icon_url: e.target.value }))} />
        </Fld>
        <Fld label="order_index">
          <input style={iSt} type="number" value={sf.order_index}
            onChange={e => setSf(p => ({ ...p, order_index: e.target.value }))} />
        </Fld>
      </>
    )

    if (tab === 'certs') return (
      <>
        <Fld label="name">
          <input style={iSt} value={cf.name} placeholder="Certification name"
            onChange={e => setCf(p => ({ ...p, name: e.target.value }))} />
        </Fld>
        <Fld label="issuer">
          <input style={iSt} value={cf.issuer} placeholder="CompTIA, AWS, Google..."
            onChange={e => setCf(p => ({ ...p, issuer: e.target.value }))} />
        </Fld>
        <Fld label="issue_date">
          <input style={{ ...iSt, colorScheme: 'dark' }} type="date" value={cf.issue_date}
            onChange={e => setCf(p => ({ ...p, issue_date: e.target.value }))} />
        </Fld>
        <Fld label="credential_id">
          <input style={iSt} value={cf.credential_id} placeholder="Credential ID"
            onChange={e => setCf(p => ({ ...p, credential_id: e.target.value }))} />
        </Fld>
        <Fld label="url">
          <input style={iSt} value={cf.url} placeholder="https://verify.example.com/..."
            onChange={e => setCf(p => ({ ...p, url: e.target.value }))} />
        </Fld>
      </>
    )

    return (
      <>
        <Fld label="company">
          <input style={iSt} value={ef.company} placeholder="Company — City, ST"
            onChange={e => setEf(p => ({ ...p, company: e.target.value }))} />
        </Fld>
        <Fld label="role">
          <input style={iSt} value={ef.role} placeholder="Job title / role"
            onChange={e => setEf(p => ({ ...p, role: e.target.value }))} />
        </Fld>
        <Fld label="start_date">
          <input style={{ ...iSt, colorScheme: 'dark' }} type="date" value={ef.start_date}
            onChange={e => setEf(p => ({ ...p, start_date: e.target.value }))} />
        </Fld>
        <Fld label="end_date (leave blank = present)">
          <input style={{ ...iSt, colorScheme: 'dark' }} type="date" value={ef.end_date}
            onChange={e => setEf(p => ({ ...p, end_date: e.target.value }))} />
        </Fld>
        <Fld label="description (one bullet per line)">
          <textarea style={{ ...iSt, resize: 'vertical' }} rows={4} value={ef.description}
            placeholder={"Led the team...\nBuilt the system..."}
            onChange={e => setEf(p => ({ ...p, description: e.target.value }))} />
        </Fld>
        <Fld label="order_index">
          <input style={iSt} type="number" value={ef.order_index}
            onChange={e => setEf(p => ({ ...p, order_index: e.target.value }))} />
        </Fld>
      </>
    )
  }

  // ── Table data ────────────────────────────────────────────────────────────
  type Row = { id: string; item: Project | Skill | Cert | Experience; cells: React.ReactNode[] }

  function buildRows(): { headers: string[]; rows: Row[] } {
    if (tab === 'resume') return { headers: [], rows: [] }

    if (tab === 'projects') return {
      headers: ['// title', '// slug', '// tech', '// featured', '// order'],
      rows: projects.map(p => ({ id: p.id, item: p, cells: [
        <span style={{ color: 'hsl(0 0% 76%)' }}>{p.title}</span>,
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'hsl(0 0% 38%)' }}>{p.slug}</span>,
        <span style={{ fontSize: 10, color: 'hsl(0 0% 38%)' }}>{(p.tech_stack ?? []).slice(0, 2).join(', ')}{(p.tech_stack?.length ?? 0) > 2 ? ' …' : ''}</span>,
        <span style={{ color: p.featured ? 'hsl(158 64% 45%)' : 'hsl(0 0% 26%)', fontSize: 10, letterSpacing: '0.15em' }}>{p.featured ? 'yes' : 'no'}</span>,
        <span style={{ color: 'hsl(0 0% 35%)' }}>{p.order_index}</span>,
      ]})),
    }

    if (tab === 'skills') return {
      headers: ['// name', '// category', '// icon', '// order'],
      rows: skills.map(s => ({ id: s.id, item: s, cells: [
        <span style={{ color: 'hsl(0 0% 76%)' }}>{s.name}</span>,
        <span style={{ color: 'hsl(193 80% 45%)', fontSize: 10, letterSpacing: '0.12em' }}>{s.category}</span>,
        <span style={{ fontSize: 10, color: s.icon_url ? 'hsl(158 64% 42%)' : 'hsl(0 0% 25%)' }}>{s.icon_url ? '✓ set' : '—'}</span>,
        <span style={{ color: 'hsl(0 0% 35%)' }}>{s.order_index}</span>,
      ]})),
    }

    if (tab === 'certs') return {
      headers: ['// name', '// issuer', '// date', '// id'],
      rows: certs.map(c => ({ id: c.id, item: c, cells: [
        <span style={{ color: 'hsl(0 0% 76%)' }}>{c.name}</span>,
        <span>{c.issuer ?? '—'}</span>,
        <span style={{ fontSize: 10, color: 'hsl(0 0% 38%)', fontFamily: 'monospace' }}>{c.issue_date ?? '—'}</span>,
        <span style={{ fontSize: 10, color: 'hsl(0 0% 32%)', fontFamily: 'monospace' }}>{c.credential_id ?? '—'}</span>,
      ]})),
    }

    return {
      headers: ['// role', '// company', '// start', '// end'],
      rows: experiences.map(e => ({ id: e.id, item: e, cells: [
        <span style={{ color: 'hsl(0 0% 76%)' }}>{e.role}</span>,
        <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{e.company}</span>,
        <span style={{ fontSize: 10, color: 'hsl(0 0% 38%)', fontFamily: 'monospace' }}>{e.start_date ?? '—'}</span>,
        <span style={{ fontSize: 10, color: e.end_date ? 'hsl(0 0% 38%)' : 'hsl(158 64% 38%)', fontFamily: 'monospace' }}>{e.end_date ?? 'Present'}</span>,
      ]})),
    }
  }

  const { headers, rows } = buildRows()
  const counts: Record<Tab, number> = {
    projects: projects.length,
    skills: skills.length,
    certs: certs.length,
    experiences: experiences.length,
    resume: 1,
  }
  const TABS: Tab[] = ['projects', 'skills', 'certs', 'experiences', 'resume']

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'var(--font-roboto-flex)', maxWidth: 960 }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'hsl(158 64% 36%)', marginBottom: 8 }}>
          $ portfolio.cms --mode manage
        </p>
        <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 26, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(0 0% 87%)', lineHeight: 1 }}>
          PORTFOLIO CMS
        </h1>
      </div>

      {/* Status */}
      {status && (
        <div style={{
          padding: '8px 14px', marginBottom: 20,
          background: status.ok ? 'hsl(158 50% 7%)' : 'hsl(0 50% 7%)',
          border: `1px solid ${status.ok ? 'hsl(158 64% 20%)' : 'hsl(0 62% 22%)'}`,
          fontSize: 11, letterSpacing: '0.1em',
          color: status.ok ? 'hsl(158 64% 52%)' : 'hsl(0 62% 55%)',
        }}>
          {status.ok ? '> ok: ' : '> err: '}{status.msg}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid hsl(0 0% 16%)' }}>
        {TABS.map(t => {
          const active = tab === t
          return (
            <button key={t}
              onClick={() => { setTab(t); setConfirmDel(null); setPanelOpen(false) }}
              style={{
                padding: '10px 18px 9px',
                fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
                color: active ? 'hsl(158 64% 55%)' : 'hsl(0 0% 30%)',
                background: 'none', border: 'none', outline: 'none',
                borderBottom: `2px solid ${active ? 'hsl(158 64% 36%)' : 'transparent'}`,
                marginBottom: -1, cursor: 'pointer', transition: 'color 0.12s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget).style.color = 'hsl(0 0% 52%)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget).style.color = 'hsl(0 0% 30%)' }}
            >
              // {t}
            </button>
          )
        })}
      </div>

      {/* Table panel */}
      {tab !== 'resume' && (
      <div style={{ border: '1px solid hsl(0 0% 16%)', borderTop: 'none', background: 'hsl(0 0% 8%)' }}>

        {/* Toolbar */}
        <div style={{ padding: '11px 16px', borderBottom: '1px solid hsl(0 0% 14%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'hsl(0 0% 26%)' }}>
            {loading ? '// loading...' : `// ${counts[tab]} records`}
          </span>
          <button onClick={openAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, letterSpacing: '0.15em',
              color: 'hsl(158 64% 42%)', background: 'none',
              border: '1px solid hsl(158 64% 18%)',
              padding: '5px 11px', cursor: 'pointer', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'hsl(158 64% 60%)'; e.currentTarget.style.borderColor = 'hsl(158 64% 32%)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'hsl(158 64% 42%)'; e.currentTarget.style.borderColor = 'hsl(158 64% 18%)' }}
          >
            <IcPlus /> add_new
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {headers.map(h => <th key={h} style={thSt}>{h}</th>)}
                <th style={{ ...thSt, width: 90, textAlign: 'right' }}>// act</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={headers.length + 1} style={{ ...tdSt, textAlign: 'center', color: 'hsl(0 0% 24%)', padding: '28px 0', letterSpacing: '0.2em', fontSize: 10, textTransform: 'uppercase' }}>
                    // no records
                  </td>
                </tr>
              )}
              {rows.map(({ id, cells, item }) => (
                <tr key={id}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'hsl(0 0% 9.5%)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  {cells.map((cell, i) => <td key={i} style={tdSt}>{cell}</td>)}
                  <td style={{ ...tdSt, textAlign: 'right' }}>
                    {confirmDel === id ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', fontSize: 10, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                        <span style={{ color: 'hsl(0 0% 30%)' }}>rm?</span>
                        <button onClick={() => handleDelete(id)} style={{ color: 'hsl(0 62% 55%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, padding: 0 }}>yes</button>
                        <button onClick={() => setConfirmDel(null)} style={{ color: 'hsl(0 0% 32%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, padding: 0 }}>no</button>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(item)} title="edit"
                          style={{ color: 'hsl(0 0% 32%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget).style.color = 'hsl(193 100% 47%)'}
                          onMouseLeave={e => (e.currentTarget).style.color = 'hsl(0 0% 32%)'}
                        ><IcEdit /></button>
                        <button onClick={() => setConfirmDel(id)} title="delete"
                          style={{ color: 'hsl(0 0% 32%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget).style.color = 'hsl(0 62% 55%)'}
                          onMouseLeave={e => (e.currentTarget).style.color = 'hsl(0 0% 32%)'}
                        ><IcTrash /></button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Resume panel */}
      {tab === 'resume' && (
        <div style={{ border: '1px solid hsl(0 0% 16%)', borderTop: 'none', background: 'hsl(0 0% 8%)' }}>
          <div style={{ padding: '11px 16px', borderBottom: '1px solid hsl(0 0% 14%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'hsl(0 0% 26%)' }}>
              {loading ? '// loading...' : `// ${resumeInfo.hasCustom ? 'custom resume active' : 'using default /resume.pdf'}`}
            </span>
            <a
              href={resumeInfo.url}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 10, letterSpacing: '0.16em', color: 'hsl(193 100% 47%)', textDecoration: 'none' }}
            >
              open_current_resume
            </a>
          </div>

          <div style={{ padding: 20 }}>
            <Fld label="resume_pdf">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                style={{ ...iSt, padding: '6px 11px' }}
              />
            </Fld>

            <div style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(0 0% 32%)', marginBottom: 14 }}>
              upload a pdf to replace your public resume link on the homepage
            </div>

            <button
              onClick={handleResumeUpload}
              disabled={uploadingResume || !resumeFile}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 14px',
                fontSize: 11, letterSpacing: '0.15em',
                color: uploadingResume || !resumeFile ? 'hsl(0 0% 30%)' : 'hsl(158 64% 55%)',
                background: 'hsl(158 64% 36% / 0.1)',
                border: `1px solid ${uploadingResume || !resumeFile ? 'hsl(0 0% 18%)' : 'hsl(158 64% 24%)'}`,
                cursor: uploadingResume || !resumeFile ? 'not-allowed' : 'pointer',
              }}
            >
              <IcSave /> {uploadingResume ? 'uploading...' : '> upload_resume'}
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div onClick={closePanel} style={{
        position: 'fixed', inset: 0, zIndex: 55,
        background: 'hsl(0 0% 0% / 0.45)',
        opacity: panelOpen ? 1 : 0,
        pointerEvents: panelOpen ? 'all' : 'none',
        transition: 'opacity 0.2s',
      }} />

      {/* Slide panel */}
      <div style={{
        position: 'fixed', top: 44, right: 0, bottom: 0, width: 420,
        background: 'hsl(0 0% 7%)',
        borderLeft: '1px solid hsl(0 0% 17%)',
        zIndex: 60,
        transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Panel header */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid hsl(0 0% 14%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'hsl(158 64% 36%)', textTransform: 'uppercase', marginBottom: 3 }}>
              // {editingId ? 'edit' : 'new'} record
            </div>
            <div style={{ fontFamily: 'var(--font-anton)', fontSize: 14, letterSpacing: '0.18em', color: 'hsl(0 0% 80%)', textTransform: 'uppercase' }}>
              {tab}
            </div>
          </div>
          <button onClick={closePanel}
            style={{ color: 'hsl(0 0% 32%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', transition: 'color 0.12s' }}
            onMouseEnter={e => (e.currentTarget).style.color = 'hsl(0 0% 60%)'}
            onMouseLeave={e => (e.currentTarget).style.color = 'hsl(0 0% 32%)'}
          ><IcX /></button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {renderForm()}
        </div>

        {/* Panel footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid hsl(0 0% 14%)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={handleSave} disabled={saving}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '9px 0',
              fontSize: 11, letterSpacing: '0.15em',
              color: saving ? 'hsl(0 0% 30%)' : 'hsl(158 64% 55%)',
              background: 'hsl(158 64% 36% / 0.1)',
              border: `1px solid ${saving ? 'hsl(0 0% 18%)' : 'hsl(158 64% 24%)'}`,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.12s',
            }}
          >
            <IcSave /> {saving ? 'saving...' : '> save_record'}
          </button>
          <button onClick={closePanel}
            style={{
              padding: '9px 16px', fontSize: 11, letterSpacing: '0.15em',
              color: 'hsl(0 62% 50%)', background: 'none',
              border: '1px solid hsl(0 0% 17%)', cursor: 'pointer', transition: 'border-color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget).style.borderColor = 'hsl(0 62% 32%)'}
            onMouseLeave={e => (e.currentTarget).style.borderColor = 'hsl(0 0% 17%)'}
          >
            &gt; cancel
          </button>
        </div>
      </div>
    </div>
  )
}
