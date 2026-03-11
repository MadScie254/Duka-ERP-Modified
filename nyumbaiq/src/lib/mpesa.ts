import { supabase } from './supabaseClient';

type StkPayload = {
  amount: number;
  phone: string;
  lease_id: string;
  tenant_id: string;
  property_id: string;
  unit_id: string;
  payment_for_month: string; // YYYY-MM-01
};

export async function initiateStkPush(payload: StkPayload) {
  const { data, error } = await supabase.functions.invoke('mpesa-stk-push', { body: payload });
  if (error) throw error;
  return data;
}
