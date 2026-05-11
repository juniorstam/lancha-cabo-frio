'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Phone, Shield, Save, LogOut, Camera, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  client: { label: 'Cliente', color: 'bg-blue-100 text-blue-700' },
  owner:  { label: 'Proprietário', color: 'bg-purple-100 text-purple-700' },
  admin:  { label: 'Admin', color: 'bg-red-100 text-red-700' },
}

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', role: 'client' })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()

      if (profile) {
        setForm({
          full_name: profile.full_name || data.user.user_metadata?.full_name || '',
          phone: profile.phone || '',
          role: profile.role || 'client',
        })
      }
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('user_id', user.id)

    if (err) {
      setError('Erro ao salvar. Tente novamente.')
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] pt-20">
          <div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = (form.full_name || user?.email || 'U').slice(0, 2).toUpperCase()
  const roleConfig = ROLE_LABELS[form.role] ?? ROLE_LABELS.client

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-2xl mx-auto px-4 py-10">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={form.full_name} className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0a2540] to-[#00b4d8] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-lg">
                    {initials}
                  </div>
                )}
              </div>
              <h1 className="font-playfair text-2xl font-bold text-[#0a2540] mt-4">{form.full_name || 'Usuário'}</h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full ${roleConfig.color}`}>
                {roleConfig.label}
              </span>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] text-lg mb-5">Informações pessoais</h2>

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-4">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Perfil atualizado com sucesso!
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00b4d8] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="(22) 99999-9999"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00b4d8] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Tipo de conta</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={roleConfig.label}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-[#0a2540] hover:bg-[#0d3060] text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Save className="w-4 h-4" /> Salvar alterações</>
                  }
                </button>
              </form>
            </div>

            {/* Zona de perigo */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
              <h2 className="font-semibold text-[#0a2540] mb-4">Sessão</h2>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>

          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
