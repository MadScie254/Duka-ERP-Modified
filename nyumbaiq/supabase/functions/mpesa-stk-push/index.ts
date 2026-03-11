// Supabase Edge Function: mpesa-stk-push
// Handles tenant-initiated STK Push without exposing Daraja credentials to the client.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const darajaConsumerKey = Deno.env.get("DARAJA_CONSUMER_KEY")!;
const darajaConsumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET")!;
const businessShortCode = Deno.env.get("DARAJA_PAYBILL")!;
const callbackBase = Deno.env.get("DARAJA_CALLBACK_BASE")!; // e.g. https://xyz.supabase.co/functions/v1

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const base64Credentials = btoa(`${darajaConsumerKey}:${darajaConsumerSecret}`);

async function getDarajaToken() {
  const res = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: `Basic ${base64Credentials}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.access_token as string;
}

serve(async (req) => {
  try {
    const body = await req.json();
    const { amount, phone, lease_id, tenant_id, property_id, unit_id, payment_for_month } = body;

    if (!amount || !phone || !lease_id) {
      return new Response("Missing required fields", { status: 400 });
    }

    const accessToken = await getDarajaToken();
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const passkey = Deno.env.get("DARAJA_PASSKEY")!;
    const password = btoa(`${businessShortCode}${passkey}${timestamp}`);

    const stkPayload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: businessShortCode,
      PhoneNumber: phone,
      CallBackURL: `${callbackBase}/mpesa-callback`,
      AccountReference: unit_id ?? "RENT",
      TransactionDesc: "NyumbaIQ Rent Payment",
    };

    const stkRes = await fetch("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    const stkData = await stkRes.json();
    if (!stkRes.ok) {
      console.error(stkData);
      return new Response(JSON.stringify(stkData), { status: 400 });
    }

    // Record pending payment
    await supabase.from("rent_payments").insert({
      lease_id,
      tenant_id,
      property_id,
      unit_id,
      amount_expected: amount,
      payment_method: "mpesa",
      payment_for_month,
      status: "pending",
      mpesa_phone: phone,
      notes: "STK push initiated",
    });

    return new Response(JSON.stringify({ checkoutRequestID: stkData.CheckoutRequestID }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal error", { status: 500 });
  }
});
