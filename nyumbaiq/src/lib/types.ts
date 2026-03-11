import type { Profile } from '../store/authStore';

export type Property = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  property_type: 'residential' | 'commercial' | 'mixed';
  county: string;
  sub_county: string | null;
  area_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  total_units: number | null;
  year_built: number | null;
  amenities: string[];
  images: string[];
  is_listed_publicly: boolean;
  status: 'active' | 'inactive' | 'under_renovation';
  created_at: string;
  updated_at: string;
  owner?: Profile;
  units?: Unit[];
};

export type Unit = {
  id: string;
  property_id: string;
  unit_number: string;
  floor_number: string | null;
  unit_type: 'bedsitter' | '1br' | '2br' | '3br' | 'penthouse' | 'office' | 'warehouse' | 'retail' | 'studio';
  size_sqft: number | null;
  monthly_rent: number;
  deposit_amount: number | null;
  status: 'vacant' | 'occupied' | 'reserved' | 'under_maintenance';
  furnished: boolean;
  features: unknown;
  images: string[];
  created_at: string;
  updated_at: string;
  property?: Property;
};

export type Lease = {
  id: string;
  property_id: string;
  unit_id: string;
  tenant_id: string;
  landlord_id: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  deposit_paid: number | null;
  lease_terms: string | null;
  payment_day: number;
  auto_renew: boolean;
  status: 'active' | 'expired' | 'terminated' | 'pending_signature';
  signed_at: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
  unit?: Unit;
  tenant?: Profile;
  landlord?: Profile;
};

export type RentPayment = {
  id: string;
  lease_id: string;
  tenant_id: string;
  property_id: string;
  unit_id: string;
  amount_expected: number;
  amount_paid: number | null;
  payment_method: 'mpesa' | 'bank_transfer' | 'cash' | 'cheque';
  mpesa_code: string | null;
  mpesa_phone: string | null;
  mpesa_receipt_url: string | null;
  payment_for_month: string;
  payment_date: string | null;
  status: 'confirmed' | 'partial' | 'pending' | 'failed' | 'refunded';
  late_fee_applied: number | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  lease?: Lease;
  tenant?: Profile;
  property?: Property;
  unit?: Unit;
};

export type MaintenanceRequest = {
  id: string;
  unit_id: string | null;
  property_id: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  category: 'plumbing' | 'electrical' | 'structural' | 'appliance' | 'security' | 'cleaning' | 'pest_control' | 'other';
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'in_progress' | 'awaiting_parts' | 'resolved' | 'closed';
  images: string[];
  resolution_notes: string | null;
  cost_incurred: number | null;
  opened_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  unit?: Unit;
  property?: Property;
  reporter?: Profile;
};

export type Listing = {
  id: string;
  property_id: string;
  unit_id: string | null;
  listed_by: string | null;
  title: string;
  description: string | null;
  listing_type: 'rent' | 'sale' | 'lease';
  asking_price: number | null;
  negotiable: boolean;
  available_from: string | null;
  highlights: unknown;
  virtual_tour_url: string | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  views_count: number;
  is_featured: boolean;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
  unit?: Unit;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'rent_due' | 'rent_paid' | 'rent_overdue' | 'maintenance_update' | 'lease_expiring' | 'new_listing' | 'system_alert';
  title: string;
  body: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
};

export type AIInsight = {
  id: string;
  generated_for: string | null;
  insight_type: 'vacancy' | 'revenue' | 'risk' | 'market' | 'maintenance' | 'forecast';
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical' | 'opportunity';
  data_snapshot: unknown;
  expires_at: string | null;
  created_at: string;
};
