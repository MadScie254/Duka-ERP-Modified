import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const payload = await req.json();
  console.log("M-Pesa callback", payload);
  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
