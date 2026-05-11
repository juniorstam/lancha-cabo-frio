'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ASSUNTO_OPTIONS = [
  { value: '', label: 'Selecione um assunto' },
  { value: 'reserva', label: 'Dúvida sobre reserva' },
  { value: 'tecnico', label: 'Problema técnico' },
  { value: 'parceria', label: 'Parceria' },
  { value: 'outro', label: 'Outro' },
]

interface FormState {
  nome: string
  email: string
  telefone: string
  assunto: string
  mensagem: string
}

const INITIAL_STATE: FormState = {
  nome: '',
  email: '',
  telefone: '',
  assunto: '',
  mensagem: '',
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simula envio
    await new Promise(res => setTimeout(res, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#00b4d8]/10 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-[#00b4d8]" />
        </div>
        <h3 className="font-playfair text-2xl font-bold text-[#0a2540] mb-2">
          Mensagem enviada!
        </h3>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Recebemos seu contato e retornaremos em breve. Fique de olho no seu e-mail.
        </p>
        <button
          onClick={() => {
            setForm(INITIAL_STATE)
            setSubmitted(false)
          }}
          className="px-6 py-2.5 border border-[#0a2540] text-[#0a2540] text-sm font-semibold rounded-xl hover:bg-[#0a2540] hover:text-white transition-all"
        >
          Enviar nova mensagem
        </button>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm text-[#0a2540] placeholder-gray-400 focus:outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all'

  const labelClass = 'block text-xs font-semibold text-[#0a2540] mb-1.5 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Nome */}
      <div>
        <label htmlFor="nome" className={labelClass}>
          Nome <span className="text-[#00b4d8]">*</span>
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          placeholder="Seu nome completo"
          value={form.nome}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          E-mail <span className="text-[#00b4d8]">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="seu@email.com"
          value={form.email}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Telefone */}
      <div>
        <label htmlFor="telefone" className={labelClass}>
          Telefone <span className="text-gray-400 font-normal normal-case">(opcional)</span>
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          placeholder="(22) 99999-0000"
          value={form.telefone}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Assunto */}
      <div>
        <label htmlFor="assunto" className={labelClass}>
          Assunto <span className="text-[#00b4d8]">*</span>
        </label>
        <select
          id="assunto"
          name="assunto"
          required
          value={form.assunto}
          onChange={handleChange}
          className={cn(inputClass, form.assunto === '' ? 'text-gray-400' : 'text-[#0a2540]')}
        >
          {ASSUNTO_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mensagem */}
      <div>
        <label htmlFor="mensagem" className={labelClass}>
          Mensagem <span className="text-[#00b4d8]">*</span>
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          required
          rows={5}
          placeholder="Escreva sua mensagem aqui..."
          value={form.mensagem}
          onChange={handleChange}
          className={cn(inputClass, 'resize-none')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0a2540] text-white font-bold rounded-xl transition-all',
          loading
            ? 'opacity-70 cursor-not-allowed'
            : 'hover:bg-[#0d3060] hover:shadow-lg'
        )}
      >
        {loading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Enviar mensagem
          </>
        )}
      </button>
    </form>
  )
}
