// Generates AI insights via Anthropic Claude and stores them in ai_insights.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;
const claudeUrl = "https://api.anthropic.com/v1/messages";
const systemPrompt = `
You are a Kenyan real estate analyst for NyumbaIQ (Danco Analytics). 
Always use KES currency and DD MMM YYYY dates. 
Consider county-specific demand, SGR corridor growth, Nairobi satellite towns, and IRA Kenya guidance for commercial properties.
Flag leases expiring within 60 days as opportunities. Output concise JSON insights array.`;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Accept optional ?user=<uuid> to scope insights to a landlord/admin
  const url = new URL(req.url);
  const generatedFor = url.searchParams.get("user");

  // Pull last 90 days of core metrics
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [payments, vacancies, maintenance, expiring] = await Promise.all([
    supabase.from("rent_payments").select("amount_paid, payment_date, property_id").gte("payment_date", since.toISOString()),
    supabase.from("units").select("id, property_id, status").eq("status", "vacant"),
    supabase.from("maintenance_requests").select("cost_incurred, category, status, property_id").gte("created_at", since.toISOString()),
    supabase.from("leases").select("id, tenant_id, end_date, property_id, unit_id").gte("end_date", new Date().toISOString()).lte("end_date", new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const payload = {
    payments: payments.data ?? [],
    vacancies: vacancies.data ?? [],
    maintenance: maintenance.data ?? [],
    expiring_leases: expiring.data ?? [],
  };

  const claudeRes = await fetch(claudeUrl, {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      system: systemPrompt,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
      max_tokens: 800,
    }),
  });

  const claudeData = await claudeRes.json();
  const insightText = claudeData?.content?.[0]?.text ?? "[]";
  let insights: any[] = [];
  try {
    insights = JSON.parse(insightText);
  } catch (_err) {
    insights = [];
  }

  if (insights.length) {
    const rows = insights.map((ins) => ({
      generated_for: generatedFor,
      insight_type: ins.type ?? "market",
      title: ins.title,
      body: ins.body ?? ins.recommended_action,
      severity: ins.severity ?? "info",
      data_snapshot: payload,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));
    await supabase.from("ai_insights").insert(rows);
  }

  return new Response(JSON.stringify({ inserted: insights.length }), { status: 200 });
});
