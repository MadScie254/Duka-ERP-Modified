// Safaricom STK callback handler.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const payload = await req.json();
  const body = payload?.Body?.stkCallback;
  if (!body) return new Response("No body", { status: 400 });

  const resultCode = body.ResultCode;
  const meta = body.CallbackMetadata?.Item ?? [];

  const mpesaCode = meta.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
  const amount = meta.find((i: any) => i.Name === "Amount")?.Value;
  const phone = meta.find((i: any) => i.Name === "PhoneNumber")?.Value;

  const checkoutId = body.CheckoutRequestID;

  try {
    // Mark pending payment rows that match this checkout as confirmed
    const { data: pending } = await supabase
      .from("rent_payments")
      .select("id, tenant_id, property_id")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!pending?.length) {
      return new Response("No pending payment found", { status: 200 });
    }

    const paymentId = pending[0].id;

    const status = resultCode === 0 ? "confirmed" : "failed";

    await supabase
      .from("rent_payments")
      .update({
        status,
        amount_paid: amount,
        mpesa_code: mpesaCode,
        mpesa_phone: phone,
        payment_date: new Date().toISOString(),
        notes: `STK callback: ${checkoutId}`,
      })
      .eq("id", paymentId);

    // Notification insert
    if (status === "confirmed") {
      const message = `KES ${amount} received. M-Pesa code ${mpesaCode}`;
      await supabase.from("notifications").insert([
        {
          user_id: pending[0].tenant_id,
          type: "rent_paid",
          title: "Rent payment confirmed",
          body: message,
        },
      ]);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("error", { status: 500 });
  }
});
