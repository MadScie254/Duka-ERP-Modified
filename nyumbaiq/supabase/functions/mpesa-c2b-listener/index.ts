// C2B Paybill listener. Safaricom will POST transaction data here.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const data = await req.json();

  const amount = data?.TransAmount;
  const mpesaCode = data?.TransID;
  const phone = data?.MSISDN;
  const accountRef = data?.BillRefNumber; // Expected: unit_number or lease id

  if (!amount || !mpesaCode || !accountRef) {
    return new Response("Invalid payload", { status: 400 });
  }

  try {
    // Try to match lease by unit number
    const { data: leaseMatch } = await supabase
      .from("leases")
      .select("id, tenant_id, property_id, unit_id, monthly_rent")
      .eq("status", "active")
      .eq("unit_id", accountRef)
      .limit(1);

    const lease = leaseMatch?.[0];

    await supabase.from("rent_payments").insert({
      lease_id: lease?.id,
      tenant_id: lease?.tenant_id,
      property_id: lease?.property_id,
      unit_id: lease?.unit_id,
      amount_expected: lease?.monthly_rent ?? amount,
      amount_paid: amount,
      payment_method: "mpesa",
      mpesa_code: mpesaCode,
      mpesa_phone: phone,
      payment_for_month: new Date().toISOString().slice(0, 10),
      payment_date: new Date().toISOString(),
      status: "confirmed",
      notes: `C2B Paybill reference ${accountRef}`,
    });

    // Respond with success to Daraja
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: "Failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
