'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Anchor, Plus, X } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'lancha', label: 'Lancha' },
  { value: 'lancha_cabinada', label: 'Lancha Cabinada' },
  { value: 'jet_ski', label: 'Jet Ski' },
  { value: 'veleiro', label: 'Veleiro' },
  { value: 'catamarao', label: 'Catamarã' },
  { value: 'escuna', label: 'Escuna' },
]

const AMENITIES_OPTIONS = [
  { key: 'marinheiro', label: '👨‍✈️ Marinheiro' },
  { key: 'churrasqueira', label: '🔥 Churrasqueira' },
  { key: 'cooler', label: '🧊 Cooler' },
  { key: 'banheiro', label: '🚽 Banheiro' },
  { key: 'ducha', label: '🚿 Ducha' },
  { key: 'som', label: '🔊 Som' },
  { key: 'wifi', label: '📶 Wi-Fi' },
  { key: 'toldo', label: '⛱️ Toldo' },
  { key: 'ancora', label: '⚓ Âncora' },
]

export default function NovaEmbarcacaoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    category: 'lancha',
    capacity: 10,
    size_ft: 22,
    base_price: 800,
    description: '',
    rules: '• Proibido fumar a bordo\n• Uso obrigatório de colete ao entrar na água\n• Respeite o limite de passageiros\n• Não é permitido levar animais\n• Lixo não deve ser jogado no mar',
  })

  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    marinheiro: true, churrasqueira: false, cooler: true, banheiro: false,
    ducha: false, som: true, wifi: false, toldo: false, ancora: true,
  })

  const [photoUrls, setPhotoUrls] = useState<string[]>([''])

  function set(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleAmenity(key: string) {
    setAmenities(a => ({ ...a, [key]: !a[key] }))
  }

  function addPhotoField() {
    setPhotoUrls(p => [...p, ''])
  }

  function removePhotoField(i: number) {
    setPhotoUrls(p => p.filter((_, idx) => idx !== i))
  }

  function setPhoto(i: number, val: string) {
    setPhotoUrls(p => p.map((u, idx) => idx === i ? val : u))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    if (!form.description.trim()) { setError('Descrição é obrigatória.'); return }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()

    if (!profile) { setError('Perfil não encontrado.'); setSaving(false); return }

    // Busca a marina padrão (Marina Pier 98)
    const { data: marina } = await supabase
      .from('marinas').select('id').limit(1).single()

    // Gera slug
    const slug = form.name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Cria a embarcação
    const { data: boat, error: boatErr } = await supabase
      .from('boats')
      .insert({
        name: form.name,
        slug,
        category: form.category,
        capacity: Number(form.capacity),
        size_ft: Number(form.size_ft),
        base_price: Number(form.base_price),
        description: form.description,
        rules: form.rules,
        owner_id: profile.id,
        marina_id: marina?.id ?? null,
        active: true,
        amenities,
      })
      .select('id')
      .single()

    if (boatErr || !boat) {
      setError('Erro ao salvar embarcação: ' + (boatErr?.message ?? ''))
      setSaving(false)
      return
    }

    // Salva fotos
    const validPhotos = photoUrls.filter(u => u.trim())
    if (validPhotos.length > 0) {
      await supabase.from('boat_photos').insert(
        validPhotos.map((url, i) => ({ boat_id: boat.id, url, order: i }))
      )
    }

    router.push('/painel/embarcacoes')
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/painel/embarcacoes" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0a2540]">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Nova Embarcação</h1>
              <p className="text-gray-400 text-sm mt-0.5">Preencha os dados para cadastrar sua embarcação</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Dados básicos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-5 flex items-center gap-2">
                <Anchor className="w-4 h-4 text-[#00b4d8]" /> Dados básicos
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">NOME DA EMBARCAÇÃO *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Ex: Focker 310" required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">CATEGORIA</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">PREÇO BASE (R$)</label>
                  <input type="number" value={form.base_price} onChange={e => set('base_price', e.target.value)}
                    min={0} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">CAPACIDADE (pessoas)</label>
                  <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                    min={1} max={50} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">TAMANHO (pés)</label>
                  <input type="number" value={form.size_ft} onChange={e => set('size_ft', e.target.value)}
                    min={1} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">DESCRIÇÃO *</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={4} placeholder="Descreva sua embarcação..." required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">REGRAS DE BORDO</label>
                  <textarea value={form.rules} onChange={e => set('rules', e.target.value)}
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors resize-none font-mono text-xs" />
                </div>
              </div>
            </div>

            {/* Comodidades */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-5">O que está incluso</h2>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map(a => (
                  <button key={a.key} type="button" onClick={() => toggleAmenity(a.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      amenities[a.key]
                        ? 'bg-[#0a2540] text-white border-[#0a2540]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fotos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-1">Fotos</h2>
              <p className="text-xs text-gray-400 mb-4">Cole as URLs das fotos (Unsplash, Google Drive público, etc.)</p>
              <div className="space-y-3">
                {photoUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={url} onChange={e => setPhoto(i, e.target.value)}
                      placeholder={`URL da foto ${i + 1}`}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors" />
                    {photoUrls.length > 1 && (
                      <button type="button" onClick={() => removePhotoField(i)}
                        className="p-2.5 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addPhotoField}
                  className="flex items-center gap-2 text-sm text-[#00b4d8] font-medium hover:underline">
                  <Plus className="w-4 h-4" /> Adicionar foto
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <Link href="/painel/embarcacoes"
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 text-center hover:bg-gray-50 transition-colors">
                Cancelar
              </Link>
              <button type="submit" disabled={saving}
                className="flex-1 py-3 bg-[#0a2540] hover:bg-[#0d3060] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
                {saving ? 'Salvando...' : 'Cadastrar embarcação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
