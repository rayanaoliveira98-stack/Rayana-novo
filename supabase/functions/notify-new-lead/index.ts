import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const ADMIN_EMAIL    = Deno.env.get('ADMIN_EMAIL')    ?? ''
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL')     ?? 'noreply@rayana.at'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Verify the request comes from Supabase webhook
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET') ?? ''
  const signature = req.headers.get('x-webhook-secret') ?? ''
  if (webhookSecret && signature !== webhookSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: { record: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const lead = body.record
  if (!lead) {
    return new Response('No record in payload', { status: 400 })
  }

  const createdAt = new Date(lead.created_at).toLocaleString('de-AT', {
    timeZone: 'Europe/Vienna',
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
      <div style="background:#16a34a;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;color:#fff;font-size:20px;">⭐ Neuer Partner-Lead</h1>
        <p style="margin:6px 0 0;color:#bbf7d0;font-size:14px;">Rayana · ${createdAt}</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;width:120px;">Unternehmen</td>
            <td style="padding:8px 0;font-weight:600;">${lead.name ?? '–'}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">E-Mail</td>
            <td style="padding:8px 0;">
              <a href="mailto:${lead.email}" style="color:#16a34a;">${lead.email ?? '–'}</a>
            </td>
          </tr>
          ${lead.phone ? `
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Telefon</td>
            <td style="padding:8px 0;">
              <a href="tel:${lead.phone}" style="color:#16a34a;">${lead.phone}</a>
            </td>
          </tr>` : ''}
          ${lead.city ? `
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Stadt</td>
            <td style="padding:8px 0;">${lead.city}</td>
          </tr>` : ''}
          ${lead.category ? `
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Kategorie</td>
            <td style="padding:8px 0;">${lead.category}</td>
          </tr>` : ''}
        </table>

        <div style="margin-top:24px;">
          <a
            href="${Deno.env.get('DASHBOARD_URL') ?? 'https://rayana.at'}/admin"
            style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;"
          >
            Im Dashboard öffnen →
          </a>
        </div>
      </div>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Rayana Leads <${FROM_EMAIL}>`,
      to:   [ADMIN_EMAIL],
      subject: `⭐ Neuer Partner-Lead: ${lead.name ?? 'Unbekannt'}`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    return new Response('Email failed', { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
