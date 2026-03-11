// Mock data for dev preview — realistic Kenyan real estate data
import type { Profile } from '../store/authStore';
import type { Property, Unit, Lease, RentPayment, MaintenanceRequest, Listing, Notification, AIInsight } from './types';

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => iso(new Date(now.getTime() - n * 86400000));
const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

// ─── Profiles ──────────────────────────────────────────────
export const profiles: Profile[] = [
  { id: 'dev-user', full_name: 'Dev Admin', email: 'dev@nyumbaiq.test', phone: '+254700000000', role: 'admin', avatar_url: null, county: 'Nairobi', national_id: null, is_active: true },
  { id: 'landlord-1', full_name: 'James Kamau', email: 'kamau@mail.com', phone: '+254712345678', role: 'landlord', avatar_url: null, county: 'Nairobi', national_id: null, is_active: true },
  { id: 'landlord-2', full_name: 'Grace Wanjiku', email: 'gwanjiku@mail.com', phone: '+254723456789', role: 'landlord', avatar_url: null, county: 'Kiambu', national_id: null, is_active: true },
  { id: 'agent-1', full_name: 'Peter Ochieng', email: 'ochieng@mail.com', phone: '+254734567890', role: 'agent', avatar_url: null, county: 'Nairobi', national_id: null, is_active: true },
  { id: 'tenant-1', full_name: 'Mary Akinyi', email: 'akinyi@mail.com', phone: '+254745678901', role: 'tenant', avatar_url: null, county: 'Nairobi', national_id: null, is_active: true },
  { id: 'tenant-2', full_name: 'Hassan Ali', email: 'hali@mail.com', phone: '+254756789012', role: 'tenant', avatar_url: null, county: 'Mombasa', national_id: null, is_active: true },
  { id: 'tenant-3', full_name: 'Wambui Njeri', email: 'wnjeri@mail.com', phone: '+254767890123', role: 'tenant', avatar_url: null, county: 'Nairobi', national_id: null, is_active: false },
  { id: 'agent-2', full_name: 'Faith Chebet', email: 'chebet@mail.com', phone: '+254778901234', role: 'agent', avatar_url: null, county: 'Nakuru', national_id: null, is_active: true },
];

// ─── Properties ────────────────────────────────────────────
export const properties: Property[] = [
  { id: 'prop-1', owner_id: 'landlord-1', name: 'Sunrise Apartments', description: 'Modern apartments in the heart of Kilimani', property_type: 'residential', county: 'Nairobi', sub_county: 'Dagoretti North', area_name: 'Kilimani', address: 'Argwings Kodhek Rd', latitude: -1.2921, longitude: 36.7814, total_units: 24, year_built: 2019, amenities: ['parking', 'gym', 'garden'], images: [], is_listed_publicly: true, status: 'active', created_at: daysAgo(180), updated_at: daysAgo(5) },
  { id: 'prop-2', owner_id: 'landlord-1', name: 'Westlands Business Hub', description: 'Premium office spaces in Westlands', property_type: 'commercial', county: 'Nairobi', sub_county: 'Westlands', area_name: 'Westlands', address: 'Waiyaki Way', latitude: -1.2697, longitude: 36.8112, total_units: 12, year_built: 2021, amenities: ['parking', 'lift', 'security'], images: [], is_listed_publicly: true, status: 'active', created_at: daysAgo(120), updated_at: daysAgo(3) },
  { id: 'prop-3', owner_id: 'landlord-2', name: 'Nyali Beach Villas', description: 'Luxurious beachside living', property_type: 'residential', county: 'Mombasa', sub_county: 'Nyali', area_name: 'Nyali', address: 'Links Road', latitude: -4.0435, longitude: 39.6682, total_units: 8, year_built: 2017, amenities: ['pool', 'garden', 'beach access'], images: [], is_listed_publicly: true, status: 'active', created_at: daysAgo(300), updated_at: daysAgo(10) },
  { id: 'prop-4', owner_id: 'landlord-2', name: 'Kiambu Gardens', description: 'Affordable residential complex in Kiambu', property_type: 'residential', county: 'Kiambu', sub_county: null, area_name: 'Kiambu Town', address: 'Biashara Street', latitude: -1.1714, longitude: 36.8356, total_units: 16, year_built: 2020, amenities: ['parking', 'playground'], images: [], is_listed_publicly: false, status: 'active', created_at: daysAgo(90), updated_at: daysAgo(1) },
  { id: 'prop-5', owner_id: 'landlord-1', name: 'Lavington Towers', description: 'Under renovation — luxury upgrade', property_type: 'mixed', county: 'Nairobi', sub_county: 'Dagoretti North', area_name: 'Lavington', address: 'James Gichuru Rd', latitude: -1.2799, longitude: 36.7718, total_units: 20, year_built: 2015, amenities: ['lift', 'parking'], images: [], is_listed_publicly: false, status: 'under_renovation', created_at: daysAgo(400), updated_at: daysAgo(2) },
];

// ─── Units ─────────────────────────────────────────────────
export const units: Unit[] = [
  { id: 'unit-1', property_id: 'prop-1', unit_number: 'A-101', floor_number: '1', unit_type: '1br', size_sqft: 550, monthly_rent: 35000, deposit_amount: 70000, status: 'occupied', furnished: false, features: null, images: [], created_at: daysAgo(180), updated_at: daysAgo(30) },
  { id: 'unit-2', property_id: 'prop-1', unit_number: 'A-102', floor_number: '1', unit_type: '2br', size_sqft: 850, monthly_rent: 55000, deposit_amount: 110000, status: 'occupied', furnished: true, features: null, images: [], created_at: daysAgo(180), updated_at: daysAgo(30) },
  { id: 'unit-3', property_id: 'prop-1', unit_number: 'A-201', floor_number: '2', unit_type: 'studio', size_sqft: 400, monthly_rent: 25000, deposit_amount: 50000, status: 'vacant', furnished: false, features: null, images: [], created_at: daysAgo(180), updated_at: daysAgo(1) },
  { id: 'unit-4', property_id: 'prop-1', unit_number: 'A-202', floor_number: '2', unit_type: '3br', size_sqft: 1200, monthly_rent: 85000, deposit_amount: 170000, status: 'occupied', furnished: true, features: null, images: [], created_at: daysAgo(180), updated_at: daysAgo(15) },
  { id: 'unit-5', property_id: 'prop-2', unit_number: 'W-01', floor_number: 'G', unit_type: 'office', size_sqft: 1500, monthly_rent: 120000, deposit_amount: 240000, status: 'occupied', furnished: false, features: null, images: [], created_at: daysAgo(120), updated_at: daysAgo(60) },
  { id: 'unit-6', property_id: 'prop-2', unit_number: 'W-02', floor_number: 'G', unit_type: 'retail', size_sqft: 800, monthly_rent: 95000, deposit_amount: 190000, status: 'vacant', furnished: false, features: null, images: [], created_at: daysAgo(120), updated_at: daysAgo(3) },
  { id: 'unit-7', property_id: 'prop-3', unit_number: 'V-1', floor_number: null, unit_type: '3br', size_sqft: 2000, monthly_rent: 150000, deposit_amount: 300000, status: 'occupied', furnished: true, features: null, images: [], created_at: daysAgo(300), updated_at: daysAgo(90) },
  { id: 'unit-8', property_id: 'prop-3', unit_number: 'V-2', floor_number: null, unit_type: 'penthouse', size_sqft: 2800, monthly_rent: 250000, deposit_amount: 500000, status: 'reserved', furnished: true, features: null, images: [], created_at: daysAgo(300), updated_at: daysAgo(5) },
  { id: 'unit-9', property_id: 'prop-4', unit_number: 'K-A1', floor_number: '1', unit_type: 'bedsitter', size_sqft: 300, monthly_rent: 12000, deposit_amount: 24000, status: 'occupied', furnished: false, features: null, images: [], created_at: daysAgo(90), updated_at: daysAgo(30) },
  { id: 'unit-10', property_id: 'prop-4', unit_number: 'K-A2', floor_number: '1', unit_type: '1br', size_sqft: 450, monthly_rent: 18000, deposit_amount: 36000, status: 'vacant', furnished: false, features: null, images: [], created_at: daysAgo(90), updated_at: daysAgo(2) },
  { id: 'unit-11', property_id: 'prop-4', unit_number: 'K-B1', floor_number: '2', unit_type: '2br', size_sqft: 700, monthly_rent: 28000, deposit_amount: 56000, status: 'under_maintenance', furnished: false, features: null, images: [], created_at: daysAgo(90), updated_at: daysAgo(1) },
  { id: 'unit-12', property_id: 'prop-1', unit_number: 'A-301', floor_number: '3', unit_type: '2br', size_sqft: 900, monthly_rent: 60000, deposit_amount: 120000, status: 'vacant', furnished: true, features: null, images: [], created_at: daysAgo(180), updated_at: daysAgo(7) },
];

// ─── Leases ─────────────────────────────────────────────
export const leases: Lease[] = [
  { id: 'lease-1', property_id: 'prop-1', unit_id: 'unit-1', tenant_id: 'tenant-1', landlord_id: 'landlord-1', start_date: daysAgo(365), end_date: null, monthly_rent: 35000, deposit_paid: 70000, lease_terms: null, payment_day: 5, auto_renew: true, status: 'active', signed_at: daysAgo(365), pdf_url: null, created_at: daysAgo(365), updated_at: daysAgo(30) },
  { id: 'lease-2', property_id: 'prop-1', unit_id: 'unit-2', tenant_id: 'tenant-2', landlord_id: 'landlord-1', start_date: daysAgo(200), end_date: null, monthly_rent: 55000, deposit_paid: 110000, lease_terms: null, payment_day: 1, auto_renew: true, status: 'active', signed_at: daysAgo(200), pdf_url: null, created_at: daysAgo(200), updated_at: daysAgo(15) },
  { id: 'lease-3', property_id: 'prop-3', unit_id: 'unit-7', tenant_id: 'tenant-3', landlord_id: 'landlord-2', start_date: daysAgo(500), end_date: daysAgo(30), monthly_rent: 150000, deposit_paid: 300000, lease_terms: null, payment_day: 10, auto_renew: false, status: 'expired', signed_at: daysAgo(500), pdf_url: null, created_at: daysAgo(500), updated_at: daysAgo(30) },
  { id: 'lease-4', property_id: 'prop-4', unit_id: 'unit-9', tenant_id: 'tenant-1', landlord_id: 'landlord-2', start_date: daysAgo(60), end_date: null, monthly_rent: 12000, deposit_paid: 24000, lease_terms: null, payment_day: 5, auto_renew: true, status: 'active', signed_at: daysAgo(60), pdf_url: null, created_at: daysAgo(60), updated_at: daysAgo(10) },
  { id: 'lease-5', property_id: 'prop-2', unit_id: 'unit-5', tenant_id: 'tenant-2', landlord_id: 'landlord-1', start_date: daysAgo(100), end_date: null, monthly_rent: 120000, deposit_paid: 240000, lease_terms: null, payment_day: 1, auto_renew: true, status: 'active', signed_at: daysAgo(100), pdf_url: null, created_at: daysAgo(100), updated_at: daysAgo(5) },
  { id: 'lease-6', property_id: 'prop-1', unit_id: 'unit-4', tenant_id: 'tenant-3', landlord_id: 'landlord-1', start_date: daysAgo(150), end_date: null, monthly_rent: 85000, deposit_paid: 170000, lease_terms: null, payment_day: 5, auto_renew: true, status: 'active', signed_at: daysAgo(150), pdf_url: null, created_at: daysAgo(150), updated_at: daysAgo(3) },
];

// ─── Rent Payments ────────────────────────────────────────
export const rentPayments: RentPayment[] = [
  { id: 'pay-1', lease_id: 'lease-1', tenant_id: 'tenant-1', property_id: 'prop-1', unit_id: 'unit-1', amount_expected: 35000, amount_paid: 35000, payment_method: 'mpesa', mpesa_code: 'SLK4J7M2QR', mpesa_phone: '+254745678901', mpesa_receipt_url: null, payment_for_month: monthStart, payment_date: daysAgo(3), status: 'confirmed', late_fee_applied: null, notes: null, recorded_by: null, created_at: daysAgo(3) },
  { id: 'pay-2', lease_id: 'lease-2', tenant_id: 'tenant-2', property_id: 'prop-1', unit_id: 'unit-2', amount_expected: 55000, amount_paid: 55000, payment_method: 'mpesa', mpesa_code: 'RKJ8N3P5QT', mpesa_phone: '+254756789012', mpesa_receipt_url: null, payment_for_month: monthStart, payment_date: daysAgo(2), status: 'confirmed', late_fee_applied: null, notes: null, recorded_by: null, created_at: daysAgo(2) },
  { id: 'pay-3', lease_id: 'lease-5', tenant_id: 'tenant-2', property_id: 'prop-2', unit_id: 'unit-5', amount_expected: 120000, amount_paid: 120000, payment_method: 'bank_transfer', mpesa_code: null, mpesa_phone: null, mpesa_receipt_url: null, payment_for_month: monthStart, payment_date: daysAgo(1), status: 'confirmed', late_fee_applied: null, notes: 'Bank reference: KCB-2026-XXXXX', recorded_by: null, created_at: daysAgo(1) },
  { id: 'pay-4', lease_id: 'lease-6', tenant_id: 'tenant-3', property_id: 'prop-1', unit_id: 'unit-4', amount_expected: 85000, amount_paid: 40000, payment_method: 'mpesa', mpesa_code: 'QWE9K4L1MS', mpesa_phone: '+254767890123', mpesa_receipt_url: null, payment_for_month: monthStart, payment_date: daysAgo(5), status: 'partial', late_fee_applied: null, notes: null, recorded_by: null, created_at: daysAgo(5) },
  { id: 'pay-5', lease_id: 'lease-4', tenant_id: 'tenant-1', property_id: 'prop-4', unit_id: 'unit-9', amount_expected: 12000, amount_paid: null, payment_method: 'mpesa', mpesa_code: null, mpesa_phone: null, mpesa_receipt_url: null, payment_for_month: monthStart, payment_date: null, status: 'pending', late_fee_applied: null, notes: null, recorded_by: null, created_at: daysAgo(1) },
  { id: 'pay-6', lease_id: 'lease-1', tenant_id: 'tenant-1', property_id: 'prop-1', unit_id: 'unit-1', amount_expected: 35000, amount_paid: 35000, payment_method: 'mpesa', mpesa_code: 'ABC1D2E3FG', mpesa_phone: '+254745678901', mpesa_receipt_url: null, payment_for_month: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-01`, payment_date: daysAgo(33), status: 'confirmed', late_fee_applied: null, notes: null, recorded_by: null, created_at: daysAgo(33) },
];

// ─── Maintenance Requests ─────────────────────────────────
export const maintenanceRequests: MaintenanceRequest[] = [
  { id: 'maint-1', unit_id: 'unit-1', property_id: 'prop-1', reported_by: 'tenant-1', assigned_to: null, category: 'plumbing', title: 'Kitchen sink leaking', description: 'Water dripping from under the kitchen sink, getting worse each day', priority: 'high', status: 'open', images: [], resolution_notes: null, cost_incurred: null, opened_at: daysAgo(3), resolved_at: null, created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 'maint-2', unit_id: 'unit-2', property_id: 'prop-1', reported_by: 'tenant-2', assigned_to: null, category: 'electrical', title: 'Power outlet not working in bedroom', description: 'The socket near the window stopped working after the last storm', priority: 'medium', status: 'in_progress', images: [], resolution_notes: null, cost_incurred: null, opened_at: daysAgo(7), resolved_at: null, created_at: daysAgo(7), updated_at: daysAgo(2) },
  { id: 'maint-3', unit_id: 'unit-7', property_id: 'prop-3', reported_by: 'tenant-3', assigned_to: null, category: 'structural', title: 'Ceiling crack in living room', description: 'Visible crack expanding on the ceiling, about 30cm long', priority: 'high', status: 'awaiting_parts', images: [], resolution_notes: null, cost_incurred: 15000, opened_at: daysAgo(14), resolved_at: null, created_at: daysAgo(14), updated_at: daysAgo(4) },
  { id: 'maint-4', unit_id: 'unit-9', property_id: 'prop-4', reported_by: 'tenant-1', assigned_to: null, category: 'pest_control', title: 'Ant infestation in kitchen', description: 'Large ants coming through the back door area', priority: 'low', status: 'resolved', images: [], resolution_notes: 'Fumigation completed by PestOff Ltd', cost_incurred: 5000, opened_at: daysAgo(20), resolved_at: daysAgo(15), created_at: daysAgo(20), updated_at: daysAgo(15) },
  { id: 'maint-5', unit_id: 'unit-4', property_id: 'prop-1', reported_by: 'tenant-3', assigned_to: null, category: 'security', title: 'Front door lock jammed', description: 'Key getting stuck, hard to open', priority: 'emergency', status: 'in_progress', images: [], resolution_notes: null, cost_incurred: null, opened_at: daysAgo(1), resolved_at: null, created_at: daysAgo(1), updated_at: daysAgo(0) },
];

// ─── Listings ──────────────────────────────────────────────
export const listings: Listing[] = [
  { id: 'list-1', property_id: 'prop-1', unit_id: 'unit-3', listed_by: 'agent-1', title: 'Cozy Studio in Kilimani', description: 'Bright studio apartment with modern finishes, close to Yaya Centre', listing_type: 'rent', asking_price: 25000, negotiable: true, available_from: daysAgo(-7), highlights: null, virtual_tour_url: null, cover_image_url: null, gallery_urls: [], views_count: 142, is_featured: true, is_active: true, expires_at: null, created_at: daysAgo(10), updated_at: daysAgo(1) },
  { id: 'list-2', property_id: 'prop-1', unit_id: 'unit-12', listed_by: 'agent-1', title: 'Spacious 2BR with City Views', description: 'Third floor furnished 2-bedroom with panoramic views of the Nairobi skyline', listing_type: 'rent', asking_price: 60000, negotiable: false, available_from: daysAgo(-14), highlights: null, virtual_tour_url: null, cover_image_url: null, gallery_urls: [], views_count: 89, is_featured: false, is_active: true, expires_at: null, created_at: daysAgo(7), updated_at: daysAgo(2) },
  { id: 'list-3', property_id: 'prop-2', unit_id: 'unit-6', listed_by: 'agent-1', title: 'Prime Retail Space – Westlands', description: 'Ground floor retail unit on Waiyaki Way with high foot traffic', listing_type: 'lease', asking_price: 95000, negotiable: true, available_from: daysAgo(-3), highlights: null, virtual_tour_url: null, cover_image_url: null, gallery_urls: [], views_count: 56, is_featured: true, is_active: true, expires_at: null, created_at: daysAgo(5), updated_at: daysAgo(1) },
  { id: 'list-4', property_id: 'prop-3', unit_id: 'unit-8', listed_by: 'agent-2', title: 'Luxury Penthouse – Nyali Beach', description: 'Furnished beachfront penthouse with ocean views and private rooftop', listing_type: 'sale', asking_price: 45000000, negotiable: true, available_from: null, highlights: null, virtual_tour_url: null, cover_image_url: null, gallery_urls: [], views_count: 312, is_featured: true, is_active: true, expires_at: null, created_at: daysAgo(15), updated_at: daysAgo(3) },
  { id: 'list-5', property_id: 'prop-4', unit_id: 'unit-10', listed_by: 'agent-2', title: 'Affordable 1BR in Kiambu', description: 'Ideal for young professionals, close to town', listing_type: 'rent', asking_price: 18000, negotiable: true, available_from: daysAgo(-1), highlights: null, virtual_tour_url: null, cover_image_url: null, gallery_urls: [], views_count: 23, is_featured: false, is_active: true, expires_at: null, created_at: daysAgo(2), updated_at: daysAgo(0) },
];

// ─── Notifications ─────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'notif-1', user_id: 'dev-user', type: 'rent_paid', title: 'Rent Payment Received', body: 'Mary Akinyi paid KES 35,000 for unit A-101 at Sunrise Apartments', is_read: false, action_url: null, created_at: daysAgo(0) },
  { id: 'notif-2', user_id: 'dev-user', type: 'maintenance_update', title: 'Maintenance – Emergency', body: 'Emergency request: Front door lock jammed at unit A-202, Sunrise Apartments', is_read: false, action_url: null, created_at: daysAgo(1) },
  { id: 'notif-3', user_id: 'dev-user', type: 'rent_overdue', title: 'Rent Overdue', body: 'Payment for unit K-A1 (Kiambu Gardens) is overdue by 5 days', is_read: false, action_url: null, created_at: daysAgo(2) },
  { id: 'notif-4', user_id: 'dev-user', type: 'new_listing', title: 'New Listing Published', body: 'Peter Ochieng listed "Cozy Studio in Kilimani" — 142 views so far', is_read: true, action_url: null, created_at: daysAgo(3) },
  { id: 'notif-5', user_id: 'dev-user', type: 'lease_expiring', title: 'Lease Expiring Soon', body: 'Lease for Wambui Njeri at Nyali Beach Villas expired 30 days ago and was not renewed', is_read: true, action_url: null, created_at: daysAgo(10) },
  { id: 'notif-6', user_id: 'dev-user', type: 'rent_paid', title: 'Rent Payment Received', body: 'Hassan Ali paid KES 120,000 via bank transfer for Westlands Business Hub W-01', is_read: true, action_url: null, created_at: daysAgo(1) },
  { id: 'notif-7', user_id: 'dev-user', type: 'system_alert', title: 'System Update', body: 'NyumbaIQ analytics engine upgraded — new AI insights available', is_read: true, action_url: null, created_at: daysAgo(5) },
];

// ─── AI Insights ───────────────────────────────────────────
export const aiInsights: AIInsight[] = [
  { id: 'insight-1', generated_for: 'dev-user', insight_type: 'vacancy', title: 'High Vacancy in Kilimani Portfolio', body: 'You have 2 vacant units at Sunrise Apartments (A-201 Studio, A-301 2BR). Current Kilimani market average vacancy is 8% — your portfolio is at 33%. Consider reducing asking rents by 10-15% or offering a 1-month free incentive to attract tenants faster.', severity: 'warning', data_snapshot: null, expires_at: null, created_at: daysAgo(1) },
  { id: 'insight-2', generated_for: 'dev-user', insight_type: 'revenue', title: 'Strong Revenue Collection This Month', body: 'KES 210,000 collected from 3 confirmed payments. One partial payment of KES 40,000/85,000 from unit A-202 needs follow-up. Overall collection rate: 72% — above the 65% Nairobi average for this point in the month.', severity: 'info', data_snapshot: null, expires_at: null, created_at: daysAgo(1) },
  { id: 'insight-3', generated_for: 'dev-user', insight_type: 'maintenance', title: 'Maintenance Backlog Growing', body: '3 open/in-progress maintenance requests, including 1 emergency (door lock jam at A-202). Average resolution time is 8 days — aim for under 5 days to maintain tenant satisfaction. The plumbing issue at A-101 has been open for 3 days with no assignment.', severity: 'critical', data_snapshot: null, expires_at: null, created_at: daysAgo(0) },
  { id: 'insight-4', generated_for: 'dev-user', insight_type: 'market', title: 'Kiambu Rental Market Heating Up', body: 'Kiambu rents for 1BR units have risen 12% in Q1 2026, driven by remote workers relocating from Nairobi CBD. Your Kiambu Gardens 1BR (K-A2) at KES 18,000 is below the new median of KES 20,000. Consider adjusting for the next listing cycle.', severity: 'opportunity', data_snapshot: null, expires_at: null, created_at: daysAgo(2) },
  { id: 'insight-5', generated_for: 'dev-user', insight_type: 'risk', title: 'Tenant Wambui Njeri – Inactive & Delinquent', body: 'Tenant has an expired lease at Nyali Beach Villas and an outstanding partial payment of KES 45,000 on unit A-202. Account is marked inactive. Recommend initiating a formal notice and deposit offset process.', severity: 'critical', data_snapshot: null, expires_at: null, created_at: daysAgo(3) },
];

// ─── Lookup helpers used by the mock query engine ──────────
export const mockTables: Record<string, unknown[]> = {
  profiles,
  properties,
  units,
  leases,
  rent_payments: rentPayments,
  maintenance_requests: maintenanceRequests,
  listings,
  notifications,
  ai_insights: aiInsights,
};
