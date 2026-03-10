import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { phone, amount, shop_id, sale_id } = await req.json();

  const auth = btoa(`${Deno.env.get('MPESA_CONSUMER_KEY')}:${Deno.env.get('MPESA_CONSUMER_SECRET')}`);
  const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  const { access_token } = await tokenRes.json();

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const shortcode = Deno.env.get('MPESA_SHORTCODE')!;
  const passkey = Deno.env.get('MPESA_PASSKEY')!;
  const password = btoa(`${shortcode}${passkey}${timestamp}`);

  const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline',
      Amount: Math.ceil(amount),
      PartyA: `254${phone.replace(/^0/, '')}`,
      PartyB: shortcode,
      PhoneNumber: `254${phone.replace(/^0/, '')}`,
      CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`,
      AccountReference: `DukaERP-${sale_id?.slice(0, 8) || 'PAY'}`,
      TransactionDesc: 'DukaERP Payment'
    })
  });

  const stkData = await stkRes.json();

  await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/mpesa_transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
      apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      shop_id,
      checkout_request_id: stkData.CheckoutRequestID,
      merchant_request_id: stkData.MerchantRequestID,
      amount,
      phone_number: phone,
      status: 'pending',
      raw_response: stkData
    })
  });

  return new Response(JSON.stringify(stkData), {
    headers: { 'Content-Type': 'application/json' }
  });
});
