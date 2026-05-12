'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Anchor, Plus, X, Upload, Image as ImageIcon, ChevronDown, MapPin } from 'lucide-react'
import Link from 'next/link'
import { LocationPicker, type LocationValue } from '@/components/ui/LocationPicker'

const CATEGORIES = [
  { value: 'lancha',   label: 'Lancha' },
  { value: 'jetski',   label: 'Jet Ski' },
  { value: 'barco',    label: 'Barco' },
  { value: 'veleiro',  label: 'Veleiro' },
  { value: 'catamara', label: 'Catamarã' },
]

const AMENITIES_OPTIONS = [
  { key: 'marinheiro',   label: '👨‍✈️ Marinheiro' },
  { key: 'churrasqueira',label: '🔥 Churrasqueira' },
  { key: 'cooler',       label: '🧊 Cooler' },
  { key: 'banheiro',     label: '🚽 Banheiro' },
  { key: 'ducha',        label: '🚿 Ducha' },
  { key: 'som',          label: '🔊 Som' },
  { key: 'wifi',         label: '📶 Wi-Fi' },
  { key: 'toldo',        label: '⛱️ Toldo' },
  { key: 'ancora',       label: '⚓ Âncora' },
]

const RULES_SUGGESTIONS = [
  'Proibido fumar a bordo',
  'Uso obrigatório de colete ao entrar na água',
  'Respeite o limite de passageiros',
  'Não é permitido levar animais',
  'Lixo não deve ser jogado no mar',
  'Bebidas alcoólicas com moderação',
  'Crianças devem estar sempre sob supervisão',
  'Proibido uso de fogos de artifício',
  'Respeite os horários de saída e retorno',
]

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors bg-white'

export default function NovaEmbarcacaoPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [termsOk, setTermsOk]   = useState(false)

  const [form, setForm] = useState({
    name:                 '',
    category:             'lancha',
    capacity:             10,
    base_passengers:      4,
    size_ft:              22,
    base_price:           800,
    price_per_extra_person: 80,
    description:          '',
  })

  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    marinheiro: true, churrasqueira: false, cooler: true, banheiro: false,
    ducha: false, som: true, wifi: false, toldo: false, ancora: true,
  })

  // Regras
  const [activeRules, setActiveRules] = useState<string[]>([
    'Proibido fumar a bordo',
    'Uso obrigatório de colete ao entrar na água',
    'Lixo não deve ser jogado no mar',
  ])
  const [customRule, setCustomRule] = useState('')

  // Local de embarque
  const [boarding, setBoarding] = useState<LocationValue>({
    name: '', address: '', lat: 0, lng: 0,
  })

  // Fotos
  const [photoFiles,    setPhotoFiles]    = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleAmenity(key: string) {
    setAmenities(a => ({ ...a, [key]: !a[key] }))
  }

  function toggleSuggestedRule(rule: string) {
    setActiveRules(r =>
      r.includes(rule) ? r.filter(x => x !== rule) : [...r, rule]
    )
  }

  function addCustomRule() {
    const trimmed = customRule.trim()
    if (trimmed && !activeRules.includes(trimmed)) {
      setActiveRules(r => [...r, trimmed])
    }
    setCustomRule('')
  }

  function removeRule(rule: string) {
    setActiveRules(r => r.filter(x => x !== rule))
  }

  function addFiles(files: File[]) {
    const images = files.filter(f => f.type.startsWith('image/'))
    if (!images.length) return
    setPhotoFiles(prev => [...prev, ...images])
    images.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setPhotoPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  function removePhoto(i: number) {
    setPhotoFiles(p => p.filter((_, idx) => idx !== i))
    setPhotoPreviews(p => p.filter((_, idx) => idx !== i))
  }

  async function uploadPhotos(profileId: string): Promise<string[]> {
    const urls: string[] = []
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i]
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `boats/${profileId}/${Date.now()}-${i}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('boat-photos')
        .upload(path, file, { upsert: false, contentType: file.type })
      if (!upErr) {
        const { data } = supabase.storage.from('boat-photos').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
      setUploadProgress(Math.round(((i + 1) / photoFiles.length) * 100))
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim())        { setError('Nome é obrigatório.'); return }
    if (!form.description.trim()) { setError('Descrição é obrigatória.'); return }
    if (!termsOk)                 { setError('Você precisa concordar com os Termos de Uso.'); return }
    if (Number(form.base_passengers) > Number(form.capacity)) {
      setError('Passageiros inclusos no preço não pode ser maior que a capacidade máxima.')
      return
    }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) { setError('Perfil não encontrado.'); setSaving(false); return }

    const { data: marina } = await supabase
      .from('marinas').select('id').limit(1).single()

    const slug = form.name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const rulesText = activeRules.map(r => `• ${r}`).join('\n')

    const { data: boat, error: boatErr } = await supabase
      .from('boats')
      .insert({
        name:                   form.name,
        slug,
        category:               form.category,
        capacity:               Number(form.capacity),
        base_passengers:        Number(form.base_passengers),
        size_ft:                Number(form.size_ft),
        base_price:             Number(form.base_price),
        price_per_extra_person: Number(form.price_per_extra_person),
        description:            form.description,
        rules:                  rulesText,
        boarding_name:          boarding.name || null,
        boarding_address:       boarding.address || null,
        boarding_lat:           boarding.lat || null,
        boarding_lng:           boarding.lng || null,
        owner_id:               profile.id,
        city_id:                (await supabase.from('cities').select('id').eq('slug', 'cabo-frio').single()).data?.id,
        marina_id:              marina?.id ?? null,
        status:                 'active',
        amenities,
      })
      .select('id')
      .single()

    if (boatErr || !boat) {
      setError('Erro ao salvar embarcação: ' + (boatErr?.message ?? ''))
      setSaving(false)
      return
    }

    // Upload e salvar fotos
    if (photoFiles.length > 0) {
      const uploadedUrls = await uploadPhotos(profile.id)
      if (uploadedUrls.length > 0) {
        await supabase.from('boat_photos').insert(
          uploadedUrls.map((url, i) => ({
            boat_id:  boat.id,
            url,
            order:    i,
            is_cover: i === 0,
          }))
        )
        // Capa da embarcação = primeira foto
        await supabase.from('boats').update({ cover_photo: uploadedUrls[0] }).eq('id', boat.id)
      }
    }

    router.push('/painel/embarcacoes')
  }

  return (
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
                    placeholder="Ex: Focker 310" required className={inputCls} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">CATEGORIA</label>
                  <div className="relative">
                    <select value={form.category} onChange={e => set('category', e.target.value)}
                      className={inputCls + ' appearance-none pr-9'}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">TAMANHO (pés)</label>
                  <input type="number" value={form.size_ft} onChange={e => set('size_ft', e.target.value)}
                    min={1} className={inputCls} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">PREÇO BASE (R$)</label>
                  <input type="number" value={form.base_price} onChange={e => set('base_price', e.target.value)}
                    min={0} className={inputCls} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">PASSAGEIROS INCLUSOS NO PREÇO</label>
                  <input type="number" value={form.base_passengers} onChange={e => set('base_passengers', e.target.value)}
                    min={1} max={form.capacity} className={inputCls} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">CAPACIDADE MÁXIMA (pessoas)</label>
                  <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                    min={1} max={50} className={inputCls} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">PREÇO POR PASSAGEIRO EXTRA (R$)</label>
                  <input type="number" value={form.price_per_extra_person} onChange={e => set('price_per_extra_person', e.target.value)}
                    min={0} className={inputCls} />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">DESCRIÇÃO *</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={4} placeholder="Descreva sua embarcação..." required
                    className={inputCls + ' resize-none'} />
                </div>
              </div>
            </div>

            {/* Regras de bordo */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-1">Regras de bordo</h2>
              <p className="text-xs text-gray-400 mb-4">Selecione as sugestões e adicione regras personalizadas</p>

              {/* Sugestões */}
              <div className="flex flex-wrap gap-2 mb-4">
                {RULES_SUGGESTIONS.map(rule => (
                  <button key={rule} type="button" onClick={() => toggleSuggestedRule(rule)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      activeRules.includes(rule)
                        ? 'bg-[#00b4d8]/10 text-[#00b4d8] border-[#00b4d8]'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}>
                    {activeRules.includes(rule) ? '✓ ' : '+ '}{rule}
                  </button>
                ))}
              </div>

              {/* Regras ativas */}
              {activeRules.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  {activeRules.map(rule => (
                    <div key={rule} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="flex-1 text-sm text-gray-700">{rule}</span>
                      <button type="button" onClick={() => removeRule(rule)}
                        className="text-gray-300 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar regra personalizada */}
              <div className="flex gap-2">
                <input value={customRule} onChange={e => setCustomRule(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomRule())}
                  placeholder="Adicionar regra personalizada..."
                  className={inputCls} />
                <button type="button" onClick={addCustomRule}
                  className="px-4 py-2.5 bg-[#0a2540] text-white rounded-xl text-sm font-semibold hover:bg-[#0d3060] transition-colors whitespace-nowrap">
                  <Plus className="w-4 h-4" />
                </button>
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
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-[#0a2540]">Fotos</h2>
                <Link href="/painel/midias" target="_blank"
                  className="flex items-center gap-1.5 text-xs text-[#00b4d8] font-semibold hover:underline">
                  <ImageIcon className="w-3.5 h-3.5" /> Gerenciar mídias
                </Link>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                A primeira foto será a capa da embarcação. Formatos aceitos: JPG, PNG, WEBP.
              </p>

              {/* Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-[#00b4d8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          CAPA
                        </span>
                      )}
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 cursor-pointer transition-all select-none ${
                  dragging
                    ? 'border-[#00b4d8] bg-[#00b4d8]/10 scale-[1.01]'
                    : 'border-gray-200 hover:border-[#00b4d8] hover:bg-[#00b4d8]/5'
                }`}
              >
                <Upload className={`w-6 h-6 transition-colors ${dragging ? 'text-[#00b4d8]' : 'text-gray-300'}`} />
                <span className={`text-sm font-medium transition-colors ${dragging ? 'text-[#00b4d8]' : 'text-gray-400'}`}>
                  {dragging ? 'Solte as fotos aqui' : 'Clique para selecionar fotos'}
                </span>
                <span className="text-xs text-gray-300">ou arraste os arquivos aqui</span>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*"
                onChange={handleFiles} className="hidden" />
            </div>

            {/* Local de embarque */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00b4d8]" /> Local de embarque
              </h2>
              <p className="text-xs text-gray-400 mb-5">
                Informe onde os passageiros devem se apresentar. Clique no mapa ou arraste o marcador para ajustar a posição.
              </p>
              <LocationPicker value={boarding} onChange={setBoarding} />
            </div>

            {/* Termos de uso */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input type="checkbox" checked={termsOk} onChange={e => setTermsOk(e.target.checked)}
                  className="sr-only peer" />
                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                  termsOk ? 'bg-[#0a2540] border-[#0a2540]' : 'bg-white border-gray-300 group-hover:border-[#00b4d8]'
                }`}>
                  {termsOk && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600 leading-snug">
                Li e concordo com os{' '}
                <Link href="/termos" target="_blank" className="text-[#00b4d8] hover:underline font-medium">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link href="/privacidade" target="_blank" className="text-[#00b4d8] hover:underline font-medium">
                  Política de Privacidade
                </Link>.
                Ao cadastrar, minha embarcação ficará disponível imediatamente na plataforma.
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {saving && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between text-sm text-blue-600 mb-2">
                  <span>Enviando fotos...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-[#00b4d8] h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

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
  )
}
