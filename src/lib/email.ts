import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Em dev/sem domínio verificado: usa o remetente padrão do Resend
// Em prod com domínio verificado: usar RESEND_FROM_EMAIL no .env
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

// ─────────────────────────────────────────────────────────
// Email para o CLIENTE: confirmação de reserva
// ─────────────────────────────────────────────────────────
export async function sendBookingConfirmationToClient({
  to,
  clientName,
  bookingCode,
  boatName,
  routeName,
  date,
  passengers,
  total,
  marina,
}: {
  to: string
  clientName: string
  bookingCode: string
  boatName: string
  routeName: string
  date: string
  passengers: number
  total: number
  marina: string
}) {
  const dateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f8fafc; margin:0; padding:32px 16px;">
  <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0a2540; padding:32px; text-align:center;">
      <p style="color:#00b4d8; font-size:13px; font-weight:600; margin:0 0 8px; letter-spacing:1px; text-transform:uppercase;">⚓ Lancha em Cabo Frio</p>
      <h1 style="color:#fff; font-size:24px; margin:0; font-weight:700;">Reserva confirmada! 🎉</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#374151; font-size:15px; margin:0 0 24px;">Olá, <strong>${clientName}</strong>! Sua reserva foi recebida com sucesso.</p>

      <!-- Card de detalhes -->
      <div style="background:#f8fafc; border-radius:16px; padding:20px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Código</span>
          <span style="color:#0a2540; font-size:13px; font-weight:700; font-family:monospace;">${bookingCode}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Embarcação</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600;">${boatName}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Roteiro</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600;">${routeName}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Data</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600; text-transform:capitalize;">${dateFormatted}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Passageiros</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600;">${passengers} pessoa${passengers > 1 ? 's' : ''}</span>
        </div>
        <div style="border-top:1px solid #e5e7eb; padding-top:12px; display:flex; justify-content:space-between;">
          <span style="color:#0a2540; font-size:15px; font-weight:700;">Total pago</span>
          <span style="color:#0a2540; font-size:15px; font-weight:700;">R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <!-- Local de embarque -->
      <div style="background:#e0f7fc; border-radius:12px; padding:16px; margin-bottom:24px;">
        <p style="color:#0a2540; font-weight:700; margin:0 0 4px; font-size:14px;">📍 Local de embarque</p>
        <p style="color:#374151; font-size:13px; margin:0;">${marina}</p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="https://lanchaemcabofrio.com.br/reservas"
          style="display:inline-block; background:#0a2540; color:#fff; padding:14px 32px; border-radius:50px; font-weight:700; font-size:14px; text-decoration:none;">
          Ver minhas reservas
        </a>
      </div>

      <p style="color:#9ca3af; font-size:12px; text-align:center; margin-top:24px;">
        Cancele gratuitamente em até 24h após a reserva.<br>
        Dúvidas? Entre em contato via WhatsApp.
      </p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({ from: FROM, to, subject: `✅ Reserva ${bookingCode} confirmada — ${boatName}`, html })
}

// ─────────────────────────────────────────────────────────
// Email para o PROPRIETÁRIO: nova reserva recebida
// ─────────────────────────────────────────────────────────
export async function sendNewBookingToOwner({
  to,
  ownerName,
  bookingCode,
  clientName,
  clientPhone,
  boatName,
  routeName,
  date,
  passengers,
  ownerReceives,
}: {
  to: string
  ownerName: string
  bookingCode: string
  clientName: string
  clientPhone?: string
  boatName: string
  routeName: string
  date: string
  passengers: number
  ownerReceives: number
}) {
  const dateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f8fafc; margin:0; padding:32px 16px;">
  <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="background:#0a2540; padding:32px; text-align:center;">
      <p style="color:#00b4d8; font-size:13px; font-weight:600; margin:0 0 8px; letter-spacing:1px; text-transform:uppercase;">⚓ Nova Reserva</p>
      <h1 style="color:#fff; font-size:24px; margin:0; font-weight:700;">Você tem uma nova reserva! 🚤</h1>
    </div>

    <div style="padding:32px;">
      <p style="color:#374151; font-size:15px; margin:0 0 24px;">Olá, <strong>${ownerName}</strong>! Uma nova reserva foi feita na sua embarcação.</p>

      <div style="background:#f8fafc; border-radius:16px; padding:20px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Código</span>
          <span style="color:#0a2540; font-size:13px; font-weight:700; font-family:monospace;">${bookingCode}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Cliente</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600;">${clientName}</span>
        </div>
        ${clientPhone ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Telefone</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600;">${clientPhone}</span>
        </div>` : ''}
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Embarcação</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600;">${boatName}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Roteiro</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600;">${routeName}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Data</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600; text-transform:capitalize;">${dateFormatted}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <span style="color:#6b7280; font-size:13px;">Passageiros</span>
          <span style="color:#0a2540; font-size:13px; font-weight:600;">${passengers}</span>
        </div>
        <div style="border-top:1px solid #e5e7eb; padding-top:12px; display:flex; justify-content:space-between;">
          <span style="color:#16a34a; font-size:15px; font-weight:700;">Você recebe</span>
          <span style="color:#16a34a; font-size:18px; font-weight:800;">R$ ${ownerReceives.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div style="text-align:center;">
        <a href="https://lanchaemcabofrio.com.br/painel/reservas"
          style="display:inline-block; background:#0a2540; color:#fff; padding:14px 32px; border-radius:50px; font-weight:700; font-size:14px; text-decoration:none;">
          Ver no painel
        </a>
      </div>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({ from: FROM, to, subject: `🚤 Nova reserva ${bookingCode} — ${clientName}`, html })
}
