// Edge Function: send-notification — processes notification_jobs with retries; requires RESEND_API_KEY (email) and/or SMS provider secrets.
// Marks logs in notification_logs; increments attempts; dead-letters after max_attempts.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
Deno.serve(async (req) => {
  const resendKey = Deno.env.get('RESEND_API_KEY'); if (!resendKey) return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { jobId } = await req.json().catch(() => ({}))
  let q = supabase.from('notification_jobs').select('*').eq('status', 'queued').lte('run_at', new Date().toISOString()).limit(10)
  if (jobId) q = supabase.from('notification_jobs').select('*').eq('id', jobId)
  const { data: jobs, error } = await q; if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  let sent = 0
  for (const job of jobs ?? []) {
    try {
      if (job.channel === 'email') {
        const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') ?? 'Bookora <no-reply@example.com>', to: job.recipient, subject: job.template_key, html: `<p>${JSON.stringify(job.payload)}</p>` }) })
        if (!r.ok) throw new Error(`Resend ${r.status}`)
      } else { throw new Error(`Channel ${job.channel} provider not configured`) }
      await supabase.from('notification_jobs').update({ status: 'sent' }).eq('id', job.id)
      await supabase.from('notification_logs').insert({ business_id: job.business_id, job_id: job.id, channel: job.channel, recipient: job.recipient, status: 'sent' }); sent++
    } catch (e) {
      const attempts = job.attempts + 1
      await supabase.from('notification_jobs').update({ status: attempts >= job.max_attempts ? 'failed' : 'queued', attempts, run_at: new Date(Date.now() + attempts * 60000).toISOString() }).eq('id', job.id)
      await supabase.from('notification_logs').insert({ business_id: job.business_id, job_id: job.id, channel: job.channel, recipient: job.recipient, status: 'failed', error: String(e) })
    }
  }
  return new Response(JSON.stringify({ sent, processed: jobs?.length ?? 0 }), { headers: { 'Content-Type': 'application/json' } })
})
