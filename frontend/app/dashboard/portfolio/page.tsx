'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react'
import { apiPrivate } from '@/lib/api'
import { useDashboardTheme } from '../theme-context'

// ─── Types ───────────────────────────────────────────────────────────────────
type ProjectImages = { thumbnail?: string; long?: string; gallery?: string[] }
type ProjectCategory = 'web_development' | 'cybersecurity' | 'network'
type LegacyProjectCategory = ProjectCategory | 'it_systems'
type Project    = { id: string; title: string; slug: string; description: string | null; done_for?: string | null; category: LegacyProjectCategory | null; tech_stack: string[] | string | null; source_code_url?: string | null; live_url?: string | null; images: ProjectImages | null; featured: boolean; order_index: number }
type Stack      = { id: string; name: string; category: string | null; icon_url: string | null; order_index: number }
type Skill      = { id: string; name: string; icon_url: string | null; order_index: number }
type Cert       = { id: string; name: string; issuer: string | null; issue_date: string | null; credential_id: string | null; url: string | null }
type Experience = { id: string; company: string; role: string; start_date: string | null; end_date: string | null; description: string[] | null; featured: boolean; order_index: number }
type ResumeInfo = { url: string; hasCustom: boolean }
type UploadedProjectImage = { url: string; path: string }
type Tab        = 'projects' | 'stacks' | 'skills' | 'certs' | 'experiences' | 'resume'

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
  background: 'hsl(var(--dash-input))', border: '1px solid hsl(var(--dash-border))',
  color: 'hsl(var(--dash-fg))', fontSize: 12, letterSpacing: '0.04em',
  outline: 'none', fontFamily: 'var(--font-roboto-flex)',
}
const thSt: React.CSSProperties = { padding: '8px 14px', textAlign: 'left', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'hsl(var(--dash-fg-dim))', borderBottom: '1px solid hsl(var(--dash-border-subtle))', whiteSpace: 'nowrap' }
const tdSt: React.CSSProperties = { padding: '9px 14px', fontSize: 11, letterSpacing: '0.04em', color: 'hsl(var(--dash-fg-muted))', borderBottom: '1px solid hsl(var(--dash-border-subtle))', verticalAlign: 'middle' }

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.28em', color: 'hsl(var(--dash-fg-dim))', textTransform: 'uppercase', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
  function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseCsvUrls(csv: string) {
  return csv.split(',').map((s) => s.trim()).filter(Boolean)
}

const PROJECT_CATEGORIES: ProjectCategory[] = ['web_development', 'cybersecurity', 'network']
const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  web_development: 'Web Development',
  cybersecurity: 'Cybersecurity',
  network: 'Network',
}

function normalizeProjectCategory(value: LegacyProjectCategory | null | undefined): ProjectCategory {
  if (!value || value === 'it_systems') return 'network'
  return value
}

function toTechStackArray(value: Project['tech_stack']): string[] {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const { isLight } = useDashboardTheme()
  const [tab, setTab]               = useState<Tab>('projects')
  const [panelOpen, setPanelOpen]   = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [status, setStatus]         = useState<{ ok: boolean; msg: string } | null>(null)
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [query, setQuery] = useState('')
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<'all' | ProjectCategory>('all')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [uploadingProjectImage, setUploadingProjectImage] = useState({
    thumbnail: false,
    long: false,
    gallery: false,
  })

  // ── Data ──────────────────────────────────────────────────────────────────
  const [projects,    setProjects]    = useState<Project[]>([])
  const [stacks,      setStacks]      = useState<Stack[]>([])
  const [skills,      setSkills]      = useState<Skill[]>([])
  const [certs,       setCerts]       = useState<Cert[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [resumeInfo, setResumeInfo]   = useState<ResumeInfo>({ url: '/resume.pdf', hasCustom: false })
  const [resumeFile, setResumeFile]   = useState<File | null>(null)

  // ── Form state per tab ────────────────────────────────────────────────────
  const [pf, setPf] = useState({
    title: '',
    slug: '',
    description: '',
    done_for: '',
    category: 'web_development' as ProjectCategory,
    tech_stack: '',
    source_code_url: '',
    live_url: '',
    image_thumbnail: '',
    image_long: '',
    image_gallery: '',
    order_index: '0',
    featured: false,
  })
  const [stf, setStf] = useState({ name: '', category: '', icon_url: '', order_index: '0' })
  const [sf, setSf] = useState({ name: '', icon_url: '', order_index: '0' })
  const [cf, setCf] = useState({ name: '', issuer: '', issue_date: '', credential_id: '', url: '' })
  const [ef, setEf] = useState({ company: '', role: '', start_date: '', end_date: '', description: '', featured: false, order_index: '0' })

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'projects')    setProjects(await apiPrivate<Project[]>('/portfolio/projects'))
      if (tab === 'stacks') {
        const loaded = await apiPrivate<Stack[]>('/portfolio/stacks')
        setStacks(loaded)
      }
      if (tab === 'skills') {
        const loaded = await apiPrivate<Skill[]>('/portfolio/currently_using')
        setSkills(loaded)
      }
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
    setPf({
      title: '',
      slug: '',
      description: '',
      done_for: '',
      category: 'web_development',
      tech_stack: '',
      source_code_url: '',
      live_url: '',
      image_thumbnail: '',
      image_long: '',
      image_gallery: '',
      order_index: '0',
      featured: false,
    })
    setStf({ name: '', category: '', icon_url: '', order_index: '0' })
    setSf({ name: '', icon_url: '', order_index: '0' })
    setCf({ name: '', issuer: '', issue_date: '', credential_id: '', url: '' })
    setEf({ company: '', role: '', start_date: '', end_date: '', description: '', featured: false, order_index: '0' })
  }

  function openAdd() {
    setEditingId(null)
    resetForms()
    setPanelOpen(true)
  }

  function openEdit(item: Project | Stack | Skill | Cert | Experience) {
    setEditingId(item.id)
    if (tab === 'projects') {
      const p = item as Project
      const images = p.images ?? {}
      setPf({
        title: p.title,
        slug: p.slug,
        description: p.description ?? '',
        done_for: p.done_for ?? '',
        category: normalizeProjectCategory(p.category),
        tech_stack: toTechStackArray(p.tech_stack).join(', '),
        source_code_url: p.source_code_url ?? '',
        live_url: p.live_url ?? '',
        image_thumbnail: images.thumbnail ?? '',
        image_long: images.long ?? '',
        image_gallery: (images.gallery ?? []).join(', '),
        order_index: String(p.order_index),
        featured: p.featured,
      })
    } else if (tab === 'stacks') {
      const s = item as Stack
      setStf({ name: s.name, category: s.category ?? '', icon_url: s.icon_url ?? '', order_index: String(s.order_index) })
    } else if (tab === 'skills') {
      const s = item as Skill
      setSf({ name: s.name, icon_url: s.icon_url ?? '', order_index: String(s.order_index) })
    } else if (tab === 'certs') {
      const c = item as Cert
      setCf({ name: c.name, issuer: c.issuer ?? '', issue_date: c.issue_date ?? '', credential_id: c.credential_id ?? '', url: c.url ?? '' })
    } else {
      const e = item as Experience
      setEf({ company: e.company, role: e.role, start_date: e.start_date ?? '', end_date: e.end_date ?? '', description: (e.description ?? []).join('\n'), featured: !!e.featured, order_index: String(e.order_index) })
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
        const body = {
          title: pf.title,
          slug: pf.slug,
          description: pf.description || null,
          done_for: pf.done_for.trim() || null,
          category: pf.category,
          tech_stack: pf.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
          source_code_url: pf.source_code_url.trim() || null,
          live_url: pf.live_url.trim() || null,
          images: {
            thumbnail: pf.image_thumbnail.trim(),
            long: pf.image_long.trim(),
            gallery: pf.image_gallery.split(',').map(s => s.trim()).filter(Boolean),
          },
          order_index: parseInt(pf.order_index) || 0,
          featured: pf.featured,
        }
        const path = editingId ? `/portfolio/projects/${editingId}` : '/portfolio/projects'
        const r = await apiPrivate<Project>(path, { method, body: JSON.stringify(body) })
        setProjects(prev => editingId ? prev.map(p => p.id === editingId ? r : p) : [...prev, r])

      } else if (tab === 'stacks') {
        const body = {
          name: stf.name,
          category: stf.category.trim() || null,
          icon_url: stf.icon_url || null,
          order_index: parseInt(stf.order_index) || 0,
        }
        const path = editingId ? `/portfolio/stacks/${editingId}` : '/portfolio/stacks'
        const r = await apiPrivate<Stack>(path, { method, body: JSON.stringify(body) })
        setStacks(prev => editingId ? prev.map(s => s.id === editingId ? r : s) : [...prev, r])

      } else if (tab === 'skills') {
        const body = {
          name: sf.name,
          icon_url: sf.icon_url.trim() || null,
          order_index: parseInt(sf.order_index) || 0,
        }
        const path = editingId ? `/portfolio/currently_using/${editingId}` : '/portfolio/currently_using'
        const r = await apiPrivate<Skill>(path, { method, body: JSON.stringify(body) })
        setSkills(prev => editingId ? prev.map(s => s.id === editingId ? r : s) : [...prev, r])

      } else if (tab === 'certs') {
        const body = { name: cf.name, issuer: cf.issuer || null, issue_date: cf.issue_date || null, credential_id: cf.credential_id || null, url: cf.url || null }
        const path = editingId ? `/portfolio/certifications/${editingId}` : '/portfolio/certifications'
        const r = await apiPrivate<Cert>(path, { method, body: JSON.stringify(body) })
        setCerts(prev => editingId ? prev.map(c => c.id === editingId ? r : c) : [...prev, r])

      } else {
        const body = { company: ef.company, role: ef.role, start_date: ef.start_date || null, end_date: ef.end_date || null, description: ef.description ? ef.description.split('\n').filter(Boolean) : null, featured: ef.featured, order_index: parseInt(ef.order_index) || 0 }
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
      const ep = tab === 'certs'
        ? 'certifications'
        : tab === 'skills'
          ? 'currently_using'
          : tab
      await apiPrivate(`/portfolio/${ep}/${id}`, { method: 'DELETE' })
      if (tab === 'projects')    setProjects(prev => prev.filter(p => p.id !== id))
      if (tab === 'stacks')      setStacks(prev => prev.filter(s => s.id !== id))
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

  async function uploadProjectImage(file: File, folder: 'thumbnail' | 'long' | 'gallery') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return apiPrivate<UploadedProjectImage>('/portfolio/project-images', {
      method: 'POST',
      body: formData,
    })
  }

  async function handleSingleProjectImageUpload(
    folder: 'thumbnail' | 'long',
    file: File | null,
  ) {
    if (!file) return
    setUploadingProjectImage((prev) => ({ ...prev, [folder]: true }))
    try {
      const uploaded = await uploadProjectImage(file, folder)
      if (folder === 'thumbnail') {
        setPf((prev) => ({ ...prev, image_thumbnail: uploaded.url }))
      } else {
        setPf((prev) => ({ ...prev, image_long: uploaded.url }))
      }
      flash(true, `${folder}_uploaded`)
    } catch (err) {
      flash(false, (err as Error).message)
    } finally {
      setUploadingProjectImage((prev) => ({ ...prev, [folder]: false }))
    }
  }

  async function handleGalleryProjectImageUpload(files: FileList | null) {
    const picked = files ? Array.from(files) : []
    if (picked.length === 0) return

    setUploadingProjectImage((prev) => ({ ...prev, gallery: true }))
    try {
      const uploaded = await Promise.all(
        picked.map((file) => uploadProjectImage(file, 'gallery')),
      )
      const newUrls = uploaded.map((u) => u.url).filter(Boolean)
      setPf((prev) => {
        const existing = parseCsvUrls(prev.image_gallery)
        const combined = [...existing, ...newUrls]
        return { ...prev, image_gallery: combined.join(', ') }
      })
      flash(true, `gallery_uploaded_${newUrls.length}`)
    } catch (err) {
      flash(false, (err as Error).message)
    } finally {
      setUploadingProjectImage((prev) => ({ ...prev, gallery: false }))
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
        <Fld label="done_for (who this project was for)">
          <input style={iSt} value={pf.done_for} placeholder="Client / Organization / Team"
            onChange={e => setPf(p => ({ ...p, done_for: e.target.value }))} />
        </Fld>
        <Fld label="category">
          <select style={{ ...iSt, appearance: 'none' }} value={pf.category}
            onChange={e => setPf(p => ({ ...p, category: e.target.value as ProjectCategory }))}>
            {PROJECT_CATEGORIES.map(c => (
              <option key={c} value={c}>{PROJECT_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </Fld>
        <Fld label="tech_stack (comma-separated)">
          <input style={iSt} value={pf.tech_stack} placeholder="React, TypeScript, Tailwind CSS"
            onChange={e => setPf(p => ({ ...p, tech_stack: e.target.value }))} />
        </Fld>
        <Fld label="github_url (optional)">
          <input style={iSt} value={pf.source_code_url} placeholder="https://github.com/username/repo"
            onChange={e => setPf(p => ({ ...p, source_code_url: e.target.value }))} />
        </Fld>
        <Fld label="website_url (optional)">
          <input style={iSt} value={pf.live_url} placeholder="https://example.com"
            onChange={e => setPf(p => ({ ...p, live_url: e.target.value }))} />
        </Fld>
        <Fld label="image_thumbnail (url/path/gif)">
          <input style={iSt} value={pf.image_thumbnail} placeholder="/projects/thumbnail/portfolio-thumbnail.jpg or .gif"
            onChange={e => setPf(p => ({ ...p, image_thumbnail: e.target.value }))} />
          <div style={{ marginTop: 8 }}>
            <input
              type="file"
              accept="image/*,.gif,image/gif"
              disabled={uploadingProjectImage.thumbnail}
              onChange={async (e) => {
                await handleSingleProjectImageUpload('thumbnail', e.target.files?.[0] ?? null)
                e.currentTarget.value = ''
              }}
              style={{ ...iSt, padding: '6px 11px' }}
            />
            <div style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(var(--dash-fg-dim))', marginTop: 6 }}>
              {uploadingProjectImage.thumbnail ? 'uploading_thumbnail...' : 'upload thumbnail (jpg/png/webp/gif) from computer'}
            </div>
          </div>
        </Fld>
        <Fld label="image_long (url/path)">
          <input style={iSt} value={pf.image_long} placeholder="/projects/long/portfolio-long.jpg"
            onChange={e => setPf(p => ({ ...p, image_long: e.target.value }))} />
          <div style={{ marginTop: 8 }}>
            <input
              type="file"
              accept="image/*,.gif,image/gif"
              disabled={uploadingProjectImage.long}
              onChange={async (e) => {
                await handleSingleProjectImageUpload('long', e.target.files?.[0] ?? null)
                e.currentTarget.value = ''
              }}
              style={{ ...iSt, padding: '6px 11px' }}
            />
            <div style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(var(--dash-fg-dim))', marginTop: 6 }}>
              {uploadingProjectImage.long ? 'uploading_long...' : 'upload long image from computer'}
            </div>
          </div>
        </Fld>
        <Fld label="image_gallery (comma-separated)">
          <input style={iSt} value={pf.image_gallery} placeholder="/projects/images/p1.jpg, /projects/images/p2.jpg"
            onChange={e => setPf(p => ({ ...p, image_gallery: e.target.value }))} />
          <div style={{ marginTop: 8 }}>
            <input
              type="file"
              accept="image/*,.gif,image/gif"
              multiple
              disabled={uploadingProjectImage.gallery}
              onChange={async (e) => {
                await handleGalleryProjectImageUpload(e.target.files)
                e.currentTarget.value = ''
              }}
              style={{ ...iSt, padding: '6px 11px' }}
            />
            <div style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(var(--dash-fg-dim))', marginTop: 6 }}>
              {uploadingProjectImage.gallery ? 'uploading_gallery...' : 'upload one or many gallery images from computer'}
            </div>
          </div>
        </Fld>
        {(pf.image_thumbnail || pf.image_long || pf.image_gallery) && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'hsl(158 64% 36%)', textTransform: 'uppercase', marginBottom: 8 }}>
              &gt; image_preview
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {pf.image_thumbnail && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'hsl(var(--dash-fg-dim))', marginBottom: 4 }}>
                    thumbnail (recommended 1200x800, ratio 3:2)
                  </div>
                  <img
                    src={pf.image_thumbnail}
                    alt="Thumbnail preview"
                    style={{ width: '100%', maxHeight: 120, objectFit: 'cover', border: '1px solid hsl(var(--dash-border))', borderRadius: 6 }}
                  />
                </div>
              )}
              {pf.image_long && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'hsl(var(--dash-fg-dim))', marginBottom: 4 }}>
                    long (recommended 900x1200, ratio 3:4 portrait)
                  </div>
                  <img
                    src={pf.image_long}
                    alt="Long image preview"
                    style={{ width: '100%', maxHeight: 120, objectFit: 'cover', border: '1px solid hsl(var(--dash-border))', borderRadius: 6 }}
                  />
                </div>
              )}
              {parseCsvUrls(pf.image_gallery).length > 0 && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'hsl(var(--dash-fg-dim))', marginBottom: 4 }}>
                    gallery (recommended 1500x800, ratio 15:8)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
                    {parseCsvUrls(pf.image_gallery).slice(0, 6).map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt="Gallery preview"
                        style={{ width: '100%', height: 64, objectFit: 'cover', border: '1px solid hsl(var(--dash-border))', borderRadius: 4 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <Fld label="order_index">
          <input style={iSt} type="number" value={pf.order_index}
            onChange={e => setPf(p => ({ ...p, order_index: e.target.value }))} />
        </Fld>
        <Fld label="featured">
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <input type="checkbox" checked={pf.featured} style={{ accentColor: 'hsl(158 64% 36%)', width: 13, height: 13 }}
              onChange={e => setPf(p => ({ ...p, featured: e.target.checked }))} />
            <span style={{ fontSize: 11, color: 'hsl(var(--dash-fg-muted))', letterSpacing: '0.08em' }}>show on homepage</span>
          </label>
        </Fld>
      </>
    )

    if (tab === 'stacks') return (
      <>
        <Fld label="name">
          <input style={iSt} value={stf.name} placeholder="Stack item name"
            onChange={e => setStf(p => ({ ...p, name: e.target.value }))} />
        </Fld>
        <Fld label="category">
          <input style={iSt} value={stf.category} placeholder="frontend / backend / database / tools / languages"
            onChange={e => setStf(p => ({ ...p, category: e.target.value }))} />
        </Fld>
        <Fld label="icon_url">
          <input style={iSt} value={stf.icon_url} placeholder="/logo/react.png"
            onChange={e => setStf(p => ({ ...p, icon_url: e.target.value }))} />
        </Fld>
        <Fld label="order_index">
          <input style={iSt} type="number" value={stf.order_index}
            onChange={e => setStf(p => ({ ...p, order_index: e.target.value }))} />
        </Fld>
      </>
    )

    if (tab === 'skills') return (
      <>
        <Fld label="name">
          <input style={iSt} value={sf.name} placeholder="Skill name"
            onChange={e => setSf(p => ({ ...p, name: e.target.value }))} />
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
        <Fld label="featured">
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={ef.featured}
              style={{ accentColor: 'hsl(158 64% 36%)', width: 13, height: 13 }}
              onChange={e => setEf(p => ({ ...p, featured: e.target.checked }))}
            />
            <span style={{ fontSize: 11, color: 'hsl(var(--dash-fg-muted))', letterSpacing: '0.08em' }}>pin as featured experience</span>
          </label>
        </Fld>
        <Fld label="order_index">
          <input style={iSt} type="number" value={ef.order_index}
            onChange={e => setEf(p => ({ ...p, order_index: e.target.value }))} />
        </Fld>
      </>
    )
  }

  // ── Table data ────────────────────────────────────────────────────────────
  type Row = { id: string; item: Project | Stack | Skill | Cert | Experience; cells: React.ReactNode[] }

  function buildRows(): { headers: string[]; rows: Row[] } {
    if (tab === 'resume') return { headers: [], rows: [] }
    const q = query.trim().toLowerCase()
    const includesQ = (...values: Array<string | null | undefined>) =>
      q.length === 0 || values.some((v) => (v ?? '').toLowerCase().includes(q))

    if (tab === 'projects') return {
      headers: ['// title', '// slug', '// done for', '// category', '// links', '// thumb', '// long', '// tech', '// featured', '// order'],
      rows: projects
        .filter((p) => {
          const categoryPass = projectCategoryFilter === 'all' || normalizeProjectCategory(p.category) === projectCategoryFilter
          const featuredPass = featuredFilter === 'all' || (featuredFilter === 'yes' ? p.featured : !p.featured)
          const queryPass = includesQ(
            p.title,
            p.slug,
            p.description ?? '',
            PROJECT_CATEGORY_LABELS[normalizeProjectCategory(p.category)],
            toTechStackArray(p.tech_stack).join(' '),
            p.source_code_url ?? '',
            p.live_url ?? '',
          )
          return categoryPass && featuredPass && queryPass
        })
        .map(p => ({ id: p.id, item: p, cells: [
        <span key="title" style={{ color: 'hsl(var(--dash-fg))' }}>{p.title}</span>,
        <span key="slug" style={{ fontFamily: 'monospace', fontSize: 10, color: 'hsl(var(--dash-fg-muted))' }}>{p.slug}</span>,
        <span key="done_for" style={{ color: 'hsl(var(--dash-fg-muted))', fontSize: 10 }}>{p.done_for ?? '—'}</span>,
        <span key="category" style={{ color: 'hsl(193 80% 45%)', fontSize: 10, letterSpacing: '0.12em' }}>
          {PROJECT_CATEGORY_LABELS[normalizeProjectCategory(p.category)]}
        </span>,
        <span key="links" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {p.source_code_url ? (
            <span title="GitHub link" style={{ color: 'hsl(var(--dash-fg))', fontSize: 12 }}>🐙</span>
          ) : (
            <span style={{ color: 'hsl(var(--dash-border))', fontSize: 11 }}>—</span>
          )}
          {p.live_url ? (
            <span title="Website link" style={{ color: 'hsl(193 88% 60%)', fontSize: 12 }}>🔗</span>
          ) : (
            <span style={{ color: 'hsl(var(--dash-border))', fontSize: 11 }}>—</span>
          )}
        </span>,
        p.images?.thumbnail ? (
          <img
            key="thumb"
            src={p.images.thumbnail}
            alt={`${p.title} thumbnail`}
            style={{ width: 64, height: 42, objectFit: 'cover', borderRadius: 4, border: '1px solid hsl(var(--dash-border))' }}
          />
        ) : (
          <span key="thumb-empty" style={{ color: 'hsl(var(--dash-fg-dim))', fontSize: 10 }}>—</span>
        ),
        p.images?.long ? (
          <img
            key="long"
            src={p.images.long}
            alt={`${p.title} long`}
            style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 4, border: '1px solid hsl(var(--dash-border))' }}
          />
        ) : (
          <span key="long-empty" style={{ color: 'hsl(var(--dash-fg-dim))', fontSize: 10 }}>—</span>
        ),
        <span key="tech" style={{ fontSize: 10, color: 'hsl(var(--dash-fg-muted))' }}>{toTechStackArray(p.tech_stack).slice(0, 2).join(', ')}{toTechStackArray(p.tech_stack).length > 2 ? ' …' : ''}</span>,
        <span key="featured" style={{ color: p.featured ? 'hsl(158 64% 45%)' : 'hsl(var(--dash-fg-dim))', fontSize: 10, letterSpacing: '0.15em' }}>{p.featured ? 'yes' : 'no'}</span>,
        <span key="order" style={{ color: 'hsl(var(--dash-fg-dim))' }}>{p.order_index}</span>,
      ]})),
    }

    if (tab === 'stacks') return {
      headers: ['// name', '// category', '// icon', '// order'],
      rows: stacks
        .filter((s) => includesQ(s.name, s.category ?? '', s.icon_url ?? ''))
        .map(s => ({ id: s.id, item: s, cells: [
        <span key="name" style={{ color: 'hsl(var(--dash-fg))' }}>{s.name}</span>,
        <span key="category" style={{ color: 'hsl(193 80% 45%)', fontSize: 10, letterSpacing: '0.12em' }}>{s.category ?? '—'}</span>,
        <span key="icon" style={{ fontSize: 10, color: s.icon_url ? 'hsl(158 64% 42%)' : 'hsl(var(--dash-fg-dim))' }}>{s.icon_url ? '✓ set' : '—'}</span>,
        <span key="order" style={{ color: 'hsl(var(--dash-fg-dim))' }}>{s.order_index}</span>,
      ]})),
    }

    if (tab === 'skills') return {
      headers: ['// name', '// icon', '// order'],
      rows: skills
        .filter((s) => includesQ(s.name, s.icon_url ?? ''))
        .map(s => ({ id: s.id, item: s, cells: [
        <span key="name" style={{ color: 'hsl(var(--dash-fg))' }}>{s.name}</span>,
        <span key="icon" style={{ fontSize: 10, color: s.icon_url ? 'hsl(158 64% 42%)' : 'hsl(var(--dash-fg-dim))' }}>{s.icon_url ? '✓ set' : '—'}</span>,
        <span key="order" style={{ color: 'hsl(var(--dash-fg-dim))' }}>{s.order_index}</span>,
      ]})),
    }

    if (tab === 'certs') return {
      headers: ['// name', '// issuer', '// date', '// id'],
      rows: certs
        .filter((c) => includesQ(c.name, c.issuer ?? '', c.credential_id ?? '', c.url ?? ''))
        .map(c => ({ id: c.id, item: c, cells: [
        <span key="name" style={{ color: 'hsl(var(--dash-fg))' }}>{c.name}</span>,
        <span key="issuer">{c.issuer ?? '—'}</span>,
        <span key="date" style={{ fontSize: 10, color: 'hsl(var(--dash-fg-muted))', fontFamily: 'monospace' }}>{c.issue_date ?? '—'}</span>,
        <span key="id" style={{ fontSize: 10, color: 'hsl(var(--dash-fg-dim))', fontFamily: 'monospace' }}>{c.credential_id ?? '—'}</span>,
      ]})),
    }

    return {
      headers: ['// role', '// company', '// featured', '// start', '// end'],
      rows: experiences
        .filter((e) => includesQ(e.role, e.company, (e.description ?? []).join(' ')))
        .map(e => ({ id: e.id, item: e, cells: [
        <span key="role" style={{ color: 'hsl(var(--dash-fg))' }}>{e.role}</span>,
        <span key="company" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{e.company}</span>,
        <span key="featured" style={{ color: e.featured ? 'hsl(158 64% 45%)' : 'hsl(var(--dash-fg-dim))', fontSize: 10, letterSpacing: '0.15em' }}>{e.featured ? 'yes' : 'no'}</span>,
        <span key="start" style={{ fontSize: 10, color: 'hsl(var(--dash-fg-muted))', fontFamily: 'monospace' }}>{e.start_date ?? '—'}</span>,
        <span key="end" style={{ fontSize: 10, color: e.end_date ? 'hsl(var(--dash-fg-muted))' : 'hsl(158 64% 38%)', fontFamily: 'monospace' }}>{e.end_date ?? 'Present'}</span>,
      ]})),
    }
  }

  const { headers, rows } = buildRows()
  const counts: Record<Tab, number> = {
    projects: projects.length,
    stacks: stacks.length,
    skills: skills.length,
    certs: certs.length,
    experiences: experiences.length,
    resume: 1,
  }
  const TABS: Tab[] = ['projects', 'stacks', 'skills', 'certs', 'experiences', 'resume']
  const TAB_LABELS: Record<Tab, string> = {
    projects: 'projects',
    stacks: 'stacks',
    skills: 'currently using',
    certs: 'certs',
    experiences: 'experiences',
    resume: 'resume',
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'var(--font-roboto-flex)', maxWidth: 960 }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'hsl(var(--dash-fg-dim))', marginBottom: 8 }}>
          $ portfolio.cms --mode manage
        </p>
        <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 26, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(var(--dash-fg))', lineHeight: 1 }}>
          PORTFOLIO CMS
        </h1>
      </div>

      {/* Status */}
      {status && (
        <div style={{
          padding: '8px 14px', marginBottom: 20,
          background: status.ok ? 'hsl(158 64% 36% / 0.10)' : 'hsl(0 62% 52% / 0.10)',
          border: `1px solid ${status.ok ? 'hsl(158 64% 36% / 0.35)' : 'hsl(0 62% 52% / 0.35)'}`,
          fontSize: 11, letterSpacing: '0.1em',
          color: status.ok ? 'hsl(var(--dash-fg))' : 'hsl(var(--dash-fg))',
        }}>
          {status.ok ? '> ok: ' : '> err: '}{status.msg}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--dash-border))' }}>
        {TABS.map(t => {
          const active = tab === t
          return (
            <button key={t}
              onClick={() => { setTab(t); setConfirmDel(null); setPanelOpen(false) }}
              style={{
                padding: '10px 18px 9px',
                fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
                color: active ? 'hsl(var(--dash-fg))' : 'hsl(var(--dash-fg-dim))',
                background: 'none', border: 'none', outline: 'none',
                borderBottom: `2px solid ${active ? 'hsl(var(--dash-fg-muted))' : 'transparent'}`,
                marginBottom: -1, cursor: 'pointer', transition: 'color 0.12s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget).style.color = 'hsl(var(--dash-fg-muted))' }}
              onMouseLeave={e => { if (!active) (e.currentTarget).style.color = 'hsl(var(--dash-fg-dim))' }}
            >
              {'// '}
              {TAB_LABELS[t]}
            </button>
          )
        })}
      </div>

      {/* Table panel */}
      {tab !== 'resume' && (
      <div style={{ border: '1px solid hsl(var(--dash-border))', borderTop: 'none', background: 'hsl(var(--dash-panel))' }}>

        {/* Toolbar */}
        <div style={{ padding: '11px 16px', borderBottom: '1px solid hsl(var(--dash-border-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter records..."
              style={{ ...iSt, width: 220, padding: '6px 10px', fontSize: 11, letterSpacing: '0.06em' }}
            />
            {tab === 'projects' && (
              <>
                <select
                  value={projectCategoryFilter}
                  onChange={(e) => setProjectCategoryFilter(e.target.value as 'all' | ProjectCategory)}
                  style={{ ...iSt, width: 170, padding: '6px 10px', fontSize: 11, letterSpacing: '0.05em' }}
                >
                  <option value="all">all categories</option>
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{PROJECT_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value as 'all' | 'yes' | 'no')}
                  style={{ ...iSt, width: 130, padding: '6px 10px', fontSize: 11, letterSpacing: '0.05em' }}
                >
                  <option value="all">all featured</option>
                  <option value="yes">featured yes</option>
                  <option value="no">featured no</option>
                </select>
              </>
            )}
          </div>
          <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'hsl(var(--dash-fg-dim))' }}>
            {loading ? '// loading...' : `// ${rows.length} shown (${counts[tab]} total)`}
          </span>
          <button onClick={openAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, letterSpacing: '0.15em',
              color: 'hsl(var(--dash-fg))', background: 'none',
              border: '1px solid hsl(var(--dash-border))',
              padding: '5px 11px', cursor: 'pointer', transition: 'all 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'hsl(var(--dash-fg))'
              e.currentTarget.style.borderColor = 'hsl(var(--dash-fg-dim))'
              e.currentTarget.style.background = isLight ? 'hsl(0 0% 0% / 0.03)' : 'hsl(0 0% 100% / 0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'hsl(var(--dash-fg))'
              e.currentTarget.style.borderColor = 'hsl(var(--dash-border))'
              e.currentTarget.style.background = 'none'
            }}
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
                <th style={{ ...thSt, width: 90, textAlign: 'right' }}>{'// act'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={headers.length + 1} style={{ ...tdSt, textAlign: 'center', color: 'hsl(var(--dash-border))', padding: '28px 0', letterSpacing: '0.2em', fontSize: 10, textTransform: 'uppercase' }}>
                    {'// no records'}
                  </td>
                </tr>
              )}
              {rows.map(({ id, cells, item }) => (
                <tr key={id}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'hsl(var(--dash-bg))'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  {cells.map((cell, i) => <td key={i} style={tdSt}>{cell}</td>)}
                  <td style={{ ...tdSt, textAlign: 'right' }}>
                    {confirmDel === id ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', fontSize: 10, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                        <span style={{ color: 'hsl(var(--dash-fg-dim))' }}>rm?</span>
                        <button onClick={() => handleDelete(id)} style={{ color: 'hsl(0 62% 55%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, padding: 0 }}>yes</button>
                        <button onClick={() => setConfirmDel(null)} style={{ color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, padding: 0 }}>no</button>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(item)} title="edit"
                          style={{ color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget).style.color = 'hsl(193 100% 47%)'}
                          onMouseLeave={e => (e.currentTarget).style.color = 'hsl(var(--dash-fg-dim))'}
                        ><IcEdit /></button>
                        <button onClick={() => setConfirmDel(id)} title="delete"
                          style={{ color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget).style.color = 'hsl(0 62% 55%)'}
                          onMouseLeave={e => (e.currentTarget).style.color = 'hsl(var(--dash-fg-dim))'}
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
        <div style={{ border: '1px solid hsl(var(--dash-border))', borderTop: 'none', background: 'hsl(var(--dash-panel))' }}>
          <div style={{ padding: '11px 16px', borderBottom: '1px solid hsl(var(--dash-border-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'hsl(var(--dash-fg-dim))' }}>
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

            <div style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(var(--dash-fg-dim))', marginBottom: 14 }}>
              upload a pdf to replace your public resume link on the homepage
            </div>

            <button
              onClick={handleResumeUpload}
              disabled={uploadingResume || !resumeFile}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 14px',
                fontSize: 11, letterSpacing: '0.15em',
                color: uploadingResume || !resumeFile ? 'hsl(var(--dash-fg-dim))' : 'hsl(158 64% 55%)',
                background: 'hsl(158 64% 36% / 0.1)',
                border: `1px solid ${uploadingResume || !resumeFile ? 'hsl(var(--dash-border))' : 'hsl(158 64% 24%)'}`,
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
        background: 'hsl(var(--dash-panel))',
        borderLeft: '1px solid hsl(var(--dash-border))',
        zIndex: 60,
        transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Panel header */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid hsl(var(--dash-border-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'hsl(158 64% 36%)', textTransform: 'uppercase', marginBottom: 3 }}>
              {'// '}
              {editingId ? 'edit' : 'new'} record
            </div>
            <div style={{ fontFamily: 'var(--font-anton)', fontSize: 14, letterSpacing: '0.18em', color: 'hsl(var(--dash-fg))', textTransform: 'uppercase' }}>
              {tab}
            </div>
          </div>
          <button onClick={closePanel}
            style={{ color: 'hsl(var(--dash-fg-dim))', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', transition: 'color 0.12s' }}
            onMouseEnter={e => (e.currentTarget).style.color = 'hsl(var(--dash-fg-muted))'}
            onMouseLeave={e => (e.currentTarget).style.color = 'hsl(var(--dash-fg-dim))'}
          ><IcX /></button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {renderForm()}
        </div>

        {/* Panel footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid hsl(var(--dash-border-subtle))', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={handleSave} disabled={saving}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '9px 0',
              fontSize: 11, letterSpacing: '0.15em',
              color: saving ? 'hsl(var(--dash-fg-dim))' : 'hsl(158 64% 55%)',
              background: 'hsl(158 64% 36% / 0.1)',
              border: `1px solid ${saving ? 'hsl(var(--dash-border))' : 'hsl(158 64% 24%)'}`,
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
              border: '1px solid hsl(var(--dash-border))', cursor: 'pointer', transition: 'border-color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget).style.borderColor = 'hsl(0 62% 32%)'}
            onMouseLeave={e => (e.currentTarget).style.borderColor = 'hsl(var(--dash-border))'}
          >
            &gt; cancel
          </button>
        </div>
      </div>
    </div>
  )
}
