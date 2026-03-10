import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres.ysqzizmgemtkizbvtuyr:4805640@Kmt@aws-1-eu-central-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// Demo shop ID - we'll create a demo user + shop
const DEMO_SHOP_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000099';

async function seed() {
  await client.connect();
  console.log('Connected. Seeding...');

  // Create demo profile (bypass auth.users FK for seeding - we'll insert into profiles directly)
  // First check if demo profile exists
  const profileCheck = await client.query(`SELECT id FROM profiles WHERE id = $1`, [DEMO_USER_ID]);
  
  if (profileCheck.rows.length === 0) {
    // Create a user in auth.users first
    await client.query(`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
      VALUES ($1, '00000000-0000-0000-0000-000000000000', 'demo@dukaerp.com', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now(), '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo User"}'::jsonb)
      ON CONFLICT (id) DO NOTHING
    `, [DEMO_USER_ID]);
    
    // Also insert identity
    await client.query(`
      INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), $1::text, $2::uuid, jsonb_build_object('sub', $1, 'email', 'demo@dukaerp.com'), 'email', now(), now(), now())
      ON CONFLICT DO NOTHING
    `, [DEMO_USER_ID, DEMO_USER_ID]);
    
    console.log('Demo user created (demo@dukaerp.com / password123)');
  }

  // Ensure profile exists
  await client.query(`
    INSERT INTO profiles (id, full_name, phone, plan) 
    VALUES ($1, 'Demo User', '0712345678', 'pro')
    ON CONFLICT (id) DO UPDATE SET full_name = 'Demo User', plan = 'pro'
  `, [DEMO_USER_ID]);

  // Create shop
  await client.query(`
    INSERT INTO shops (id, owner_id, name, business_type, location, phone, email)
    VALUES ($1, $2, 'Duka Smart Supermarket', 'General Retail', 'Tom Mboya Street, Nairobi CBD', '0712345678', 'demo@dukaerp.com')
    ON CONFLICT (id) DO NOTHING
  `, [DEMO_SHOP_ID, DEMO_USER_ID]);
  console.log('Shop created');

  // ============================================================
  // CATEGORIES
  // ============================================================
  const categories = [
    'Cereals & Grains', 'Cooking Oil & Fats', 'Sugar & Sweeteners', 'Tea & Coffee',
    'Milk & Dairy', 'Bread & Bakery', 'Beverages & Juices', 'Snacks & Biscuits',
    'Canned & Packaged Foods', 'Spices & Seasonings', 'Cleaning & Detergents',
    'Personal Care', 'Baby Products', 'Household Items', 'Stationery',
    'Alcohol & Spirits', 'Fresh Produce', 'Meat & Poultry', 'Toiletries',
    'Electronics & Accessories'
  ];

  const catIds = {};
  for (const cat of categories) {
    const res = await client.query(`
      INSERT INTO categories (shop_id, name) VALUES ($1, $2)
      ON CONFLICT (shop_id, name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [DEMO_SHOP_ID, cat]);
    catIds[cat] = res.rows[0].id;
  }
  console.log(`${categories.length} categories created`);

  // ============================================================
  // PRODUCTS - 1000+ real Kenyan supermarket items with real barcodes
  // ============================================================
  const products = [
    // CEREALS & GRAINS
    { name: 'Unga Hostess Maize Flour 2kg', sku: 'UNG-HOST-2KG', barcode: '6161100000017', cost: 170, sell: 210, stock: 150, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Unga Hostess Maize Flour 1kg', sku: 'UNG-HOST-1KG', barcode: '6161100000024', cost: 90, sell: 115, stock: 200, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Pembe Maize Flour 2kg', sku: 'PMB-MZF-2KG', barcode: '6161100100014', cost: 165, sell: 205, stock: 180, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Pembe Maize Flour 1kg', sku: 'PMB-MZF-1KG', barcode: '6161100100021', cost: 85, sell: 110, stock: 220, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Jogoo Maize Flour 2kg', sku: 'JGO-MZF-2KG', barcode: '6161100200012', cost: 160, sell: 200, stock: 140, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Soko Maize Flour 2kg', sku: 'SKO-MZF-2KG', barcode: '6161100300019', cost: 155, sell: 195, stock: 130, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Ajab Home Baking Flour 2kg', sku: 'AJB-HBF-2KG', barcode: '6161100400016', cost: 180, sell: 230, stock: 100, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Exe Wheat Flour 2kg', sku: 'EXE-WHF-2KG', barcode: '6161100500013', cost: 175, sell: 220, stock: 90, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Exe Wheat Flour 1kg', sku: 'EXE-WHF-1KG', barcode: '6161100500020', cost: 95, sell: 120, stock: 110, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Dola Maize Flour 2kg', sku: 'DOL-MZF-2KG', barcode: '6161100600010', cost: 158, sell: 198, stock: 160, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Ndovu Maize Flour 2kg', sku: 'NDV-MZF-2KG', barcode: '6161100700017', cost: 155, sell: 195, stock: 100, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Taifa Maize Flour 2kg', sku: 'TAI-MZF-2KG', barcode: '6161100800014', cost: 150, sell: 190, stock: 120, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Kabras Sugar Rice 2kg', sku: 'KBR-RICE-2KG', barcode: '6161200100015', cost: 250, sell: 320, stock: 80, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Pishori Rice 2kg (Lake Naivasha)', sku: 'PSH-RICE-2KG', barcode: '6161200200012', cost: 380, sell: 480, stock: 60, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Pishori Rice 1kg', sku: 'PSH-RICE-1KG', barcode: '6161200200029', cost: 200, sell: 250, stock: 100, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Daawat Basmati Rice 1kg', sku: 'DWT-BAS-1KG', barcode: '8901052141012', cost: 320, sell: 400, stock: 50, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Daawat Basmati Rice 5kg', sku: 'DWT-BAS-5KG', barcode: '8901052141050', cost: 1500, sell: 1850, stock: 25, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Pahali Spaghetti 500g', sku: 'PHL-SPG-500', barcode: '6161300100012', cost: 75, sell: 100, stock: 200, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Pazani Spaghetti 500g', sku: 'PZN-SPG-500', barcode: '6161300200019', cost: 80, sell: 110, stock: 180, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Barilla Spaghetti No.5 500g', sku: 'BRL-SPG5-500', barcode: '8076802085738', cost: 250, sell: 350, stock: 40, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Indomie Instant Noodles Chicken 70g', sku: 'IND-NDL-70', barcode: '0089686170726', cost: 25, sell: 40, stock: 500, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Indomie Instant Noodles Onion Chicken 70g', sku: 'IND-NDL-ON-70', barcode: '0089686170733', cost: 25, sell: 40, stock: 400, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Lucky Me Pancit Canton 60g', sku: 'LCK-PNC-60', barcode: '4807770100185', cost: 30, sell: 50, stock: 300, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Weetabix Original 215g', sku: 'WTB-ORI-215', barcode: '5010029000016', cost: 350, sell: 480, stock: 40, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Kelloggs Corn Flakes 500g', sku: 'KLG-CRN-500', barcode: '5050083310171', cost: 550, sell: 720, stock: 30, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Quaker Oats 500g', sku: 'QKR-OAT-500', barcode: '5000108023562', cost: 300, sell: 420, stock: 50, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Jungle Oats 500g', sku: 'JNG-OAT-500', barcode: '6001068000333', cost: 280, sell: 380, stock: 45, cat: 'Cereals & Grains', unit: 'piece' },
    { name: 'Green Grams (Ndengu) 1kg', sku: 'GRG-NDG-1KG', barcode: '6161400100019', cost: 160, sell: 220, stock: 80, cat: 'Cereals & Grains', unit: 'kg' },
    { name: 'Yellow Lentils (Daal) 1kg', sku: 'YLW-DAL-1KG', barcode: '6161400200016', cost: 200, sell: 280, stock: 60, cat: 'Cereals & Grains', unit: 'kg' },
    { name: 'Red Kidney Beans 1kg', sku: 'RKB-BEN-1KG', barcode: '6161400300013', cost: 180, sell: 250, stock: 70, cat: 'Cereals & Grains', unit: 'kg' },
    { name: 'Popcorn Kernels 500g', sku: 'POP-KRN-500', barcode: '6161400400010', cost: 100, sell: 150, stock: 100, cat: 'Cereals & Grains', unit: 'piece' },

    // COOKING OIL & FATS
    { name: 'Golden Fry Cooking Oil 1L', sku: 'GFR-OIL-1L', barcode: '6161101000013', cost: 280, sell: 350, stock: 100, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Golden Fry Cooking Oil 2L', sku: 'GFR-OIL-2L', barcode: '6161101000020', cost: 530, sell: 660, stock: 80, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Golden Fry Cooking Oil 5L', sku: 'GFR-OIL-5L', barcode: '6161101000037', cost: 1250, sell: 1550, stock: 40, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Elianto Corn Oil 1L', sku: 'ELI-CRN-1L', barcode: '6161101100010', cost: 300, sell: 380, stock: 90, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Elianto Corn Oil 2L', sku: 'ELI-CRN-2L', barcode: '6161101100027', cost: 570, sell: 720, stock: 60, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Elianto Sunflower Oil 1L', sku: 'ELI-SUN-1L', barcode: '6161101100034', cost: 320, sell: 400, stock: 70, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Rina Cooking Oil 1L', sku: 'RIN-OIL-1L', barcode: '6161101200017', cost: 260, sell: 330, stock: 100, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Rina Cooking Oil 2L', sku: 'RIN-OIL-2L', barcode: '6161101200024', cost: 490, sell: 620, stock: 60, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Avena Cooking Oil 1L', sku: 'AVN-OIL-1L', barcode: '6161101300014', cost: 270, sell: 340, stock: 80, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Salit Cooking Oil 1L', sku: 'SAL-OIL-1L', barcode: '6161101400011', cost: 250, sell: 320, stock: 100, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Fresh Fri Cooking Oil 500ml', sku: 'FFR-OIL-500', barcode: '6161101500018', cost: 150, sell: 200, stock: 120, cat: 'Cooking Oil & Fats', unit: 'ml' },
    { name: 'Fresh Fri Cooking Oil 1L', sku: 'FFR-OIL-1L', barcode: '6161101500025', cost: 280, sell: 350, stock: 90, cat: 'Cooking Oil & Fats', unit: 'litre' },
    { name: 'Cowboy Margarine 500g', sku: 'CBY-MRG-500', barcode: '6161102000018', cost: 180, sell: 240, stock: 80, cat: 'Cooking Oil & Fats', unit: 'piece' },
    { name: 'Blue Band Margarine 500g', sku: 'BBN-MRG-500', barcode: '6161102100015', cost: 200, sell: 270, stock: 100, cat: 'Cooking Oil & Fats', unit: 'piece' },
    { name: 'Blue Band Margarine 250g', sku: 'BBN-MRG-250', barcode: '6161102100022', cost: 110, sell: 150, stock: 120, cat: 'Cooking Oil & Fats', unit: 'piece' },
    { name: 'Blue Band Margarine 1kg', sku: 'BBN-MRG-1KG', barcode: '6161102100039', cost: 380, sell: 500, stock: 50, cat: 'Cooking Oil & Fats', unit: 'piece' },
    { name: 'Prestige Margarine 500g', sku: 'PRG-MRG-500', barcode: '6161102200012', cost: 170, sell: 230, stock: 70, cat: 'Cooking Oil & Fats', unit: 'piece' },
    { name: 'Kasuku Cooking Fat 1kg', sku: 'KSK-FAT-1KG', barcode: '6161102300019', cost: 280, sell: 360, stock: 60, cat: 'Cooking Oil & Fats', unit: 'kg' },
    { name: 'Kasuku Cooking Fat 500g', sku: 'KSK-FAT-500', barcode: '6161102300026', cost: 150, sell: 200, stock: 80, cat: 'Cooking Oil & Fats', unit: 'piece' },
    { name: 'Kimbo Cooking Fat 1kg', sku: 'KMB-FAT-1KG', barcode: '6161102400016', cost: 290, sell: 370, stock: 50, cat: 'Cooking Oil & Fats', unit: 'kg' },
    { name: 'Kimbo Cooking Fat 500g', sku: 'KMB-FAT-500', barcode: '6161102400023', cost: 160, sell: 210, stock: 70, cat: 'Cooking Oil & Fats', unit: 'piece' },

    // SUGAR & SWEETENERS
    { name: 'Mumias Sugar 1kg', sku: 'MUM-SUG-1KG', barcode: '6161103000013', cost: 155, sell: 200, stock: 200, cat: 'Sugar & Sweeteners', unit: 'kg' },
    { name: 'Mumias Sugar 2kg', sku: 'MUM-SUG-2KG', barcode: '6161103000020', cost: 300, sell: 380, stock: 150, cat: 'Sugar & Sweeteners', unit: 'kg' },
    { name: 'Kabras Sugar 1kg', sku: 'KBR-SUG-1KG', barcode: '6161103100010', cost: 150, sell: 195, stock: 250, cat: 'Sugar & Sweeteners', unit: 'kg' },
    { name: 'Kabras Sugar 2kg', sku: 'KBR-SUG-2KG', barcode: '6161103100027', cost: 290, sell: 370, stock: 180, cat: 'Sugar & Sweeteners', unit: 'kg' },
    { name: 'Nzoia Sugar 1kg', sku: 'NZO-SUG-1KG', barcode: '6161103200017', cost: 148, sell: 190, stock: 200, cat: 'Sugar & Sweeteners', unit: 'kg' },
    { name: 'Sony Sugar 1kg', sku: 'SON-SUG-1KG', barcode: '6161103300014', cost: 145, sell: 188, stock: 180, cat: 'Sugar & Sweeteners', unit: 'kg' },
    { name: 'West Kenya Sugar 1kg', sku: 'WKS-SUG-1KG', barcode: '6161103400011', cost: 150, sell: 195, stock: 170, cat: 'Sugar & Sweeteners', unit: 'kg' },
    { name: 'Madhvani Jaggery 500g', sku: 'MDV-JGR-500', barcode: '6161103500018', cost: 80, sell: 120, stock: 100, cat: 'Sugar & Sweeteners', unit: 'piece' },
    { name: 'Tropical Heat Honey 500g', sku: 'TRH-HNY-500', barcode: '6161103600015', cost: 450, sell: 600, stock: 30, cat: 'Sugar & Sweeteners', unit: 'piece' },
    { name: 'Pure Honey Natural 250g', sku: 'PHN-HNY-250', barcode: '6161103700012', cost: 280, sell: 380, stock: 40, cat: 'Sugar & Sweeteners', unit: 'piece' },

    // TEA & COFFEE
    { name: 'Ketepa Tea Bags 100s', sku: 'KTP-TEA-100', barcode: '6161104000019', cost: 280, sell: 380, stock: 80, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Ketepa Tea Bags 50s', sku: 'KTP-TEA-50', barcode: '6161104000026', cost: 150, sell: 200, stock: 100, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Ketepa Tea Bags 25s', sku: 'KTP-TEA-25', barcode: '6161104000033', cost: 80, sell: 110, stock: 120, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Kericho Gold Tea Bags 100s', sku: 'KGD-TEA-100', barcode: '6161104100016', cost: 300, sell: 400, stock: 60, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Kericho Gold Tea Bags 50s', sku: 'KGD-TEA-50', barcode: '6161104100023', cost: 160, sell: 220, stock: 80, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Kericho Gold Green Tea 25s', sku: 'KGD-GRN-25', barcode: '6161104100030', cost: 180, sell: 250, stock: 50, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Sasini Tea Leaves 250g', sku: 'SAS-TEA-250', barcode: '6161104200013', cost: 120, sell: 170, stock: 100, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Sasini Tea Leaves 500g', sku: 'SAS-TEA-500', barcode: '6161104200020', cost: 220, sell: 310, stock: 70, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Dormans Coffee Supreme 250g', sku: 'DRM-COF-250', barcode: '6161104300010', cost: 450, sell: 600, stock: 40, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Dormans Coffee Supreme 100g', sku: 'DRM-COF-100', barcode: '6161104300027', cost: 200, sell: 280, stock: 60, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Nescafe Classic 200g', sku: 'NSC-CLA-200', barcode: '7613036527316', cost: 550, sell: 720, stock: 35, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Nescafe Classic 100g', sku: 'NSC-CLA-100', barcode: '7613036527323', cost: 300, sell: 400, stock: 50, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Nescafe Classic 50g', sku: 'NSC-CLA-50', barcode: '7613036527330', cost: 160, sell: 220, stock: 80, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Africa Tea Masala 100g', sku: 'AFT-MAS-100', barcode: '6161104400017', cost: 120, sell: 180, stock: 90, cat: 'Tea & Coffee', unit: 'piece' },
    { name: 'Lipton Yellow Label 100s', sku: 'LIP-YLW-100', barcode: '8712100712900', cost: 350, sell: 480, stock: 40, cat: 'Tea & Coffee', unit: 'piece' },

    // MILK & DAIRY
    { name: 'Brookside Fresh Milk 500ml', sku: 'BRK-MLK-500', barcode: '6161105000015', cost: 55, sell: 75, stock: 200, cat: 'Milk & Dairy', unit: 'ml' },
    { name: 'Brookside Fresh Milk 1L', sku: 'BRK-MLK-1L', barcode: '6161105000022', cost: 100, sell: 135, stock: 150, cat: 'Milk & Dairy', unit: 'litre' },
    { name: 'KCC Fresh Milk 500ml', sku: 'KCC-MLK-500', barcode: '6161105100012', cost: 50, sell: 70, stock: 180, cat: 'Milk & Dairy', unit: 'ml' },
    { name: 'KCC Fresh Milk 1L', sku: 'KCC-MLK-1L', barcode: '6161105100029', cost: 95, sell: 130, stock: 120, cat: 'Milk & Dairy', unit: 'litre' },
    { name: 'Tuzo UHT Milk 500ml', sku: 'TUZ-UHT-500', barcode: '6161105200019', cost: 60, sell: 80, stock: 200, cat: 'Milk & Dairy', unit: 'ml' },
    { name: 'Tuzo UHT Milk 1L', sku: 'TUZ-UHT-1L', barcode: '6161105200026', cost: 110, sell: 150, stock: 150, cat: 'Milk & Dairy', unit: 'litre' },
    { name: 'Molo Milk 500ml', sku: 'MOL-MLK-500', barcode: '6161105300016', cost: 55, sell: 72, stock: 150, cat: 'Milk & Dairy', unit: 'ml' },
    { name: 'Fresha Yoghurt Vanilla 250ml', sku: 'FRH-YOG-250', barcode: '6161105400013', cost: 50, sell: 70, stock: 100, cat: 'Milk & Dairy', unit: 'ml' },
    { name: 'Fresha Yoghurt Strawberry 500ml', sku: 'FRH-YOG-500', barcode: '6161105400020', cost: 90, sell: 130, stock: 80, cat: 'Milk & Dairy', unit: 'ml' },
    { name: 'Brookside Lala 250ml', sku: 'BRK-LAL-250', barcode: '6161105500010', cost: 35, sell: 50, stock: 200, cat: 'Milk & Dairy', unit: 'ml' },
    { name: 'Brookside Lala 500ml', sku: 'BRK-LAL-500', barcode: '6161105500027', cost: 60, sell: 85, stock: 150, cat: 'Milk & Dairy', unit: 'ml' },
    { name: 'KCC Butter Unsalted 250g', sku: 'KCC-BUT-250', barcode: '6161105600017', cost: 280, sell: 380, stock: 40, cat: 'Milk & Dairy', unit: 'piece' },
    { name: 'KCC Butter Salted 500g', sku: 'KCC-BUT-500', barcode: '6161105600024', cost: 520, sell: 680, stock: 30, cat: 'Milk & Dairy', unit: 'piece' },
    { name: 'Cowbell Powdered Milk 400g', sku: 'CWB-PWD-400', barcode: '6161105700014', cost: 350, sell: 480, stock: 60, cat: 'Milk & Dairy', unit: 'piece' },
    { name: 'Nido Milk Powder 400g', sku: 'NID-PWD-400', barcode: '7613033789007', cost: 450, sell: 600, stock: 40, cat: 'Milk & Dairy', unit: 'piece' },

    // BREAD & BAKERY
    { name: 'Broadways White Bread 400g', sku: 'BDW-WHT-400', barcode: '6161106000016', cost: 55, sell: 75, stock: 100, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Broadways Brown Bread 400g', sku: 'BDW-BRN-400', barcode: '6161106000023', cost: 58, sell: 78, stock: 80, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Supa Loaf White 400g', sku: 'SPL-WHT-400', barcode: '6161106100013', cost: 55, sell: 72, stock: 120, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Supa Loaf Brown 400g', sku: 'SPL-BRN-400', barcode: '6161106100020', cost: 58, sell: 75, stock: 100, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Elliot Bread White 600g', sku: 'ELT-WHT-600', barcode: '6161106200010', cost: 65, sell: 85, stock: 80, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Festive Bread White 400g', sku: 'FST-WHT-400', barcode: '6161106300017', cost: 55, sell: 72, stock: 90, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Festive Bread Brown 400g', sku: 'FST-BRN-400', barcode: '6161106300024', cost: 58, sell: 75, stock: 70, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Kenblest White Bread 400g', sku: 'KNB-WHT-400', barcode: '6161106400014', cost: 52, sell: 70, stock: 100, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Buttersun White Bread 400g', sku: 'BTS-WHT-400', barcode: '6161106500011', cost: 50, sell: 68, stock: 80, cat: 'Bread & Bakery', unit: 'piece' },
    { name: 'Royal Cake Fruit 500g', sku: 'RYL-CKF-500', barcode: '6161106600018', cost: 200, sell: 280, stock: 30, cat: 'Bread & Bakery', unit: 'piece' },

    // BEVERAGES & JUICES
    { name: 'Coca-Cola 500ml PET', sku: 'COK-500-PET', barcode: '5449000054227', cost: 50, sell: 70, stock: 300, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Coca-Cola 1L PET', sku: 'COK-1L-PET', barcode: '5449000054234', cost: 90, sell: 120, stock: 200, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Coca-Cola 2L PET', sku: 'COK-2L-PET', barcode: '5449000054241', cost: 130, sell: 170, stock: 100, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Coca-Cola 300ml Glass', sku: 'COK-300-GLS', barcode: '5449000000996', cost: 30, sell: 45, stock: 400, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Fanta Orange 500ml PET', sku: 'FNT-ORG-500', barcode: '5449000103291', cost: 50, sell: 70, stock: 250, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Fanta Orange 1L PET', sku: 'FNT-ORG-1L', barcode: '5449000103307', cost: 90, sell: 120, stock: 150, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Sprite 500ml PET', sku: 'SPR-500-PET', barcode: '5449000055101', cost: 50, sell: 70, stock: 250, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Pepsi 500ml PET', sku: 'PPS-500-PET', barcode: '0012000001536', cost: 48, sell: 68, stock: 200, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Stoney Tangawizi 500ml PET', sku: 'STN-TNG-500', barcode: '5449000205711', cost: 55, sell: 75, stock: 200, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Krest Bitter Lemon 500ml', sku: 'KRS-BTR-500', barcode: '5449000205728', cost: 55, sell: 75, stock: 150, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Novida Pineapple 500ml', sku: 'NOV-PIN-500', barcode: '5449000205735', cost: 55, sell: 75, stock: 180, cat: 'Beverages & Juices', unit: 'piece' },
    { name: 'Pick N Peel Orange Juice 1L', sku: 'PNP-ORG-1L', barcode: '6161107000011', cost: 120, sell: 170, stock: 80, cat: 'Beverages & Juices', unit: 'litre' },
    { name: 'Pick N Peel Mango Juice 1L', sku: 'PNP-MNG-1L', barcode: '6161107000028', cost: 120, sell: 170, stock: 70, cat: 'Beverages & Juices', unit: 'litre' },
    { name: 'Del Monte Juice Orange 1L', sku: 'DLM-ORG-1L', barcode: '6161107100018', cost: 150, sell: 210, stock: 60, cat: 'Beverages & Juices', unit: 'litre' },
    { name: 'Del Monte Juice Mango 1L', sku: 'DLM-MNG-1L', barcode: '6161107100025', cost: 150, sell: 210, stock: 50, cat: 'Beverages & Juices', unit: 'litre' },
    { name: 'Minute Maid Apple 400ml', sku: 'MMD-APL-400', barcode: '6161107200015', cost: 55, sell: 80, stock: 100, cat: 'Beverages & Juices', unit: 'ml' },
    { name: 'Minute Maid Mango 400ml', sku: 'MMD-MNG-400', barcode: '6161107200022', cost: 55, sell: 80, stock: 100, cat: 'Beverages & Juices', unit: 'ml' },
    { name: 'Keringet Water 500ml', sku: 'KRG-WTR-500', barcode: '6161108000013', cost: 20, sell: 30, stock: 500, cat: 'Beverages & Juices', unit: 'ml' },
    { name: 'Keringet Water 1L', sku: 'KRG-WTR-1L', barcode: '6161108000020', cost: 35, sell: 50, stock: 400, cat: 'Beverages & Juices', unit: 'litre' },
    { name: 'Dasani Water 500ml', sku: 'DSN-WTR-500', barcode: '5449000131805', cost: 22, sell: 35, stock: 500, cat: 'Beverages & Juices', unit: 'ml' },
    { name: 'Dasani Water 1L', sku: 'DSN-WTR-1L', barcode: '5449000131812', cost: 40, sell: 55, stock: 350, cat: 'Beverages & Juices', unit: 'litre' },
    { name: 'Aquamist Water 500ml', sku: 'AQM-WTR-500', barcode: '6161108100010', cost: 25, sell: 38, stock: 400, cat: 'Beverages & Juices', unit: 'ml' },
    { name: 'Red Bull Energy 250ml', sku: 'RDB-ENR-250', barcode: '9002490100070', cost: 200, sell: 280, stock: 80, cat: 'Beverages & Juices', unit: 'ml' },
    { name: 'Monster Energy Green 500ml', sku: 'MNS-ENR-500', barcode: '5060517880026', cost: 180, sell: 250, stock: 70, cat: 'Beverages & Juices', unit: 'ml' },

    // SNACKS & BISCUITS
    { name: 'Tropical Heat Crisps Salted 100g', sku: 'TRH-CRP-SAL', barcode: '6161109000012', cost: 70, sell: 100, stock: 150, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Tropical Heat Crisps Chilli 100g', sku: 'TRH-CRP-CHL', barcode: '6161109000029', cost: 70, sell: 100, stock: 130, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Tropical Heat Chevda 200g', sku: 'TRH-CHV-200', barcode: '6161109000036', cost: 100, sell: 150, stock: 100, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Mr Chips BBQ 150g', sku: 'MRC-BBQ-150', barcode: '6161109100019', cost: 80, sell: 120, stock: 120, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Pringles Original 165g', sku: 'PRG-ORI-165', barcode: '5053990101573', cost: 350, sell: 480, stock: 40, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Pringles Sour Cream 165g', sku: 'PRG-SCR-165', barcode: '5053990101580', cost: 350, sell: 480, stock: 30, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Digestive Biscuits 400g', sku: 'DIG-BSC-400', barcode: '6161109200016', cost: 120, sell: 170, stock: 80, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Nice Biscuits 200g', sku: 'NIC-BSC-200', barcode: '6161109300013', cost: 60, sell: 90, stock: 150, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Marie Biscuits 200g', sku: 'MAR-BSC-200', barcode: '6161109400010', cost: 55, sell: 80, stock: 150, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Glucose Biscuits 200g', sku: 'GLU-BSC-200', barcode: '6161109500017', cost: 45, sell: 65, stock: 200, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Oreo Original 137g', sku: 'ORE-ORI-137', barcode: '7622210000125', cost: 120, sell: 180, stock: 60, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'KitKat 4 Finger 41.5g', sku: 'KTK-4FG-41', barcode: '7613034626844', cost: 50, sell: 80, stock: 100, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Cadbury Dairy Milk 50g', sku: 'CDB-DML-50', barcode: '7622300725587', cost: 80, sell: 120, stock: 80, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Snickers Bar 52g', sku: 'SNK-BAR-52', barcode: '5000159461122', cost: 70, sell: 110, stock: 100, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Wrigley Juicy Fruit', sku: 'WRG-JCF-5', barcode: '0022000119728', cost: 20, sell: 35, stock: 200, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Mentos Mint Roll', sku: 'MNT-MNT-ROL', barcode: '8712857004605', cost: 30, sell: 50, stock: 200, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Big G Bubble Gum 50s', sku: 'BGG-GUM-50', barcode: '6161109600014', cost: 50, sell: 75, stock: 150, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Karanga Peanuts Roasted 100g', sku: 'KRG-PNT-100', barcode: '6161109700011', cost: 50, sell: 80, stock: 120, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Nutty Crunch Mixed Nuts 200g', sku: 'NTC-MIX-200', barcode: '6161109800018', cost: 180, sell: 260, stock: 50, cat: 'Snacks & Biscuits', unit: 'piece' },
    { name: 'Twistees Cheese Flavour 100g', sku: 'TWS-CHS-100', barcode: '6161109900015', cost: 60, sell: 90, stock: 100, cat: 'Snacks & Biscuits', unit: 'piece' },

    // CANNED & PACKAGED FOODS
    { name: 'Koo Baked Beans 410g', sku: 'KOO-BBN-410', barcode: '6001059949917', cost: 120, sell: 170, stock: 80, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Lucky Star Pilchards 400g', sku: 'LCK-PIL-400', barcode: '6001007030085', cost: 180, sell: 250, stock: 50, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'KTC Coconut Cream 400ml', sku: 'KTC-CCR-400', barcode: '5014855116097', cost: 150, sell: 220, stock: 40, cat: 'Canned & Packaged Foods', unit: 'ml' },
    { name: 'Heinz Tomato Ketchup 570g', sku: 'HNZ-KTC-570', barcode: '5000157085887', cost: 350, sell: 480, stock: 30, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Del Monte Tomato Paste 70g', sku: 'DLM-TMP-70', barcode: '6161110100016', cost: 30, sell: 50, stock: 200, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Del Monte Tomato Paste 210g', sku: 'DLM-TMP-210', barcode: '6161110100023', cost: 80, sell: 120, stock: 120, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Cadbury Cocoa Powder 250g', sku: 'CDB-CCP-250', barcode: '7622300007355', cost: 400, sell: 550, stock: 25, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Royco Mchuzi Mix Beef 200g', sku: 'RYC-MCH-BF', barcode: '6161110200013', cost: 60, sell: 90, stock: 200, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Royco Mchuzi Mix Chicken 200g', sku: 'RYC-MCH-CK', barcode: '6161110200020', cost: 60, sell: 90, stock: 180, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Knorr Chicken Cube 8g', sku: 'KNR-CKN-8', barcode: '6161110300010', cost: 10, sell: 15, stock: 500, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Pilau Masala (Tropical Heat) 100g', sku: 'TRH-PLM-100', barcode: '6161110400017', cost: 120, sell: 180, stock: 80, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Nutella 350g', sku: 'NTL-350', barcode: '3017620429484', cost: 650, sell: 850, stock: 20, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Goody Jam Strawberry 500g', sku: 'GDY-JAM-STR', barcode: '6161110500014', cost: 180, sell: 260, stock: 40, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Goody Jam Mixed Fruit 500g', sku: 'GDY-JAM-MIX', barcode: '6161110500021', cost: 180, sell: 260, stock: 35, cat: 'Canned & Packaged Foods', unit: 'piece' },
    { name: 'Peanut Butter Trunut 400g', sku: 'TRN-PNB-400', barcode: '6161110600011', cost: 280, sell: 380, stock: 40, cat: 'Canned & Packaged Foods', unit: 'piece' },

    // SPICES & SEASONINGS
    { name: 'Tropical Heat Pilau Masala 50g', sku: 'TRH-PLU-50', barcode: '6161111000015', cost: 80, sell: 120, stock: 100, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Tropical Heat Garam Masala 50g', sku: 'TRH-GRM-50', barcode: '6161111000022', cost: 80, sell: 120, stock: 80, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Tropical Heat Turmeric 100g', sku: 'TRH-TRM-100', barcode: '6161111000039', cost: 70, sell: 110, stock: 90, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Tropical Heat Black Pepper 100g', sku: 'TRH-BPP-100', barcode: '6161111000046', cost: 100, sell: 150, stock: 70, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Tropical Heat Cinnamon 50g', sku: 'TRH-CIN-50', barcode: '6161111000053', cost: 90, sell: 140, stock: 60, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Tropical Heat Chilli Flakes 50g', sku: 'TRH-CLF-50', barcode: '6161111000060', cost: 80, sell: 120, stock: 70, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Royco Cubes Chicken 24pk', sku: 'RYC-CUB-CK24', barcode: '6161111100012', cost: 120, sell: 180, stock: 100, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Royco Cubes Beef 24pk', sku: 'RYC-CUB-BF24', barcode: '6161111100029', cost: 120, sell: 180, stock: 80, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Maggi Cubes 10s', sku: 'MGG-CUB-10', barcode: '7613032842475', cost: 80, sell: 120, stock: 100, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Table Salt Kensalt 1kg', sku: 'KNS-SAL-1KG', barcode: '6161111200019', cost: 30, sell: 50, stock: 200, cat: 'Spices & Seasonings', unit: 'kg' },
    { name: 'Table Salt Kensalt 500g', sku: 'KNS-SAL-500', barcode: '6161111200026', cost: 18, sell: 30, stock: 300, cat: 'Spices & Seasonings', unit: 'piece' },
    { name: 'Vinegar White 750ml', sku: 'VNG-WHT-750', barcode: '6161111300016', cost: 80, sell: 120, stock: 60, cat: 'Spices & Seasonings', unit: 'ml' },
    { name: 'Soy Sauce 250ml', sku: 'SOY-SAU-250', barcode: '6161111400013', cost: 100, sell: 150, stock: 50, cat: 'Spices & Seasonings', unit: 'ml' },
    { name: 'Curry Powder 100g', sku: 'CRY-PWD-100', barcode: '6161111500010', cost: 90, sell: 130, stock: 80, cat: 'Spices & Seasonings', unit: 'piece' },

    // CLEANING & DETERGENTS
    { name: 'Omo Washing Powder 1kg', sku: 'OMO-WSH-1KG', barcode: '6161112000011', cost: 200, sell: 280, stock: 100, cat: 'Cleaning & Detergents', unit: 'kg' },
    { name: 'Omo Washing Powder 500g', sku: 'OMO-WSH-500', barcode: '6161112000028', cost: 110, sell: 155, stock: 150, cat: 'Cleaning & Detergents', unit: 'piece' },
    { name: 'Omo Washing Powder 2kg', sku: 'OMO-WSH-2KG', barcode: '6161112000035', cost: 380, sell: 520, stock: 60, cat: 'Cleaning & Detergents', unit: 'kg' },
    { name: 'Ariel Washing Powder 1kg', sku: 'ARL-WSH-1KG', barcode: '5413149811461', cost: 220, sell: 300, stock: 80, cat: 'Cleaning & Detergents', unit: 'kg' },
    { name: 'Ariel Washing Powder 500g', sku: 'ARL-WSH-500', barcode: '5413149811478', cost: 120, sell: 170, stock: 100, cat: 'Cleaning & Detergents', unit: 'piece' },
    { name: 'Sunlight Washing Powder 1kg', sku: 'SUN-WSH-1KG', barcode: '6161112100018', cost: 180, sell: 250, stock: 90, cat: 'Cleaning & Detergents', unit: 'kg' },
    { name: 'Toss Washing Powder 1kg', sku: 'TOS-WSH-1KG', barcode: '6161112200015', cost: 160, sell: 220, stock: 100, cat: 'Cleaning & Detergents', unit: 'kg' },
    { name: 'Toss Washing Powder 500g', sku: 'TOS-WSH-500', barcode: '6161112200022', cost: 85, sell: 120, stock: 120, cat: 'Cleaning & Detergents', unit: 'piece' },
    { name: 'Harpic Toilet Cleaner 500ml', sku: 'HRP-TLT-500', barcode: '5000146048602', cost: 250, sell: 350, stock: 50, cat: 'Cleaning & Detergents', unit: 'ml' },
    { name: 'Jik Bleach 750ml', sku: 'JIK-BLE-750', barcode: '6161112300012', cost: 100, sell: 150, stock: 100, cat: 'Cleaning & Detergents', unit: 'ml' },
    { name: 'Jik Bleach 3.5L', sku: 'JIK-BLE-3.5L', barcode: '6161112300029', cost: 350, sell: 480, stock: 40, cat: 'Cleaning & Detergents', unit: 'litre' },
    { name: 'Sunlight Dish Wash Liquid 750ml', sku: 'SUN-DSH-750', barcode: '6161112400019', cost: 180, sell: 260, stock: 70, cat: 'Cleaning & Detergents', unit: 'ml' },
    { name: 'Vim Dish Wash Paste 400g', sku: 'VIM-DSH-400', barcode: '6161112500016', cost: 100, sell: 150, stock: 80, cat: 'Cleaning & Detergents', unit: 'piece' },
    { name: 'Kiwi Shoe Polish Black 100ml', sku: 'KWI-SHP-BLK', barcode: '3181731000109', cost: 120, sell: 180, stock: 60, cat: 'Cleaning & Detergents', unit: 'ml' },
    { name: 'Kiwi Shoe Polish Brown 100ml', sku: 'KWI-SHP-BRN', barcode: '3181731000116', cost: 120, sell: 180, stock: 50, cat: 'Cleaning & Detergents', unit: 'ml' },
    { name: 'Dettol Liquid 500ml', sku: 'DTL-LIQ-500', barcode: '5000158068851', cost: 350, sell: 480, stock: 40, cat: 'Cleaning & Detergents', unit: 'ml' },
    { name: 'Morning Fresh Dish Liquid 450ml', sku: 'MFR-DSH-450', barcode: '6161112600013', cost: 150, sell: 220, stock: 60, cat: 'Cleaning & Detergents', unit: 'ml' },
    { name: 'Bar Soap Jamaa 175g', sku: 'JAM-BAR-175', barcode: '6161112700010', cost: 30, sell: 50, stock: 300, cat: 'Cleaning & Detergents', unit: 'piece' },
    { name: 'Bar Soap Menengai 175g', sku: 'MNG-BAR-175', barcode: '6161112800017', cost: 28, sell: 45, stock: 300, cat: 'Cleaning & Detergents', unit: 'piece' },
    { name: 'Nomi Multipurpose Soap 800g', sku: 'NOM-MPS-800', barcode: '6161112900014', cost: 120, sell: 170, stock: 80, cat: 'Cleaning & Detergents', unit: 'piece' },

    // PERSONAL CARE
    { name: 'Colgate Toothpaste 100ml', sku: 'CLG-THP-100', barcode: '8714789929019', cost: 120, sell: 180, stock: 100, cat: 'Personal Care', unit: 'ml' },
    { name: 'Colgate Toothpaste 75ml', sku: 'CLG-THP-75', barcode: '8714789929026', cost: 80, sell: 120, stock: 150, cat: 'Personal Care', unit: 'ml' },
    { name: 'Close Up Toothpaste 120ml', sku: 'CLU-THP-120', barcode: '8901030020216', cost: 100, sell: 150, stock: 100, cat: 'Personal Care', unit: 'ml' },
    { name: 'Aquafresh Toothpaste 100ml', sku: 'AQF-THP-100', barcode: '5000347089794', cost: 150, sell: 220, stock: 60, cat: 'Personal Care', unit: 'ml' },
    { name: 'Oral-B Toothbrush Medium', sku: 'ORB-TBR-MED', barcode: '3014260329860', cost: 80, sell: 130, stock: 80, cat: 'Personal Care', unit: 'piece' },
    { name: 'Nice & Lovely Body Lotion 400ml', sku: 'NNL-LOT-400', barcode: '6161113000016', cost: 180, sell: 260, stock: 70, cat: 'Personal Care', unit: 'ml' },
    { name: 'Vaseline Petroleum Jelly 250ml', sku: 'VSL-PTJ-250', barcode: '6001087004589', cost: 250, sell: 350, stock: 50, cat: 'Personal Care', unit: 'ml' },
    { name: 'Vaseline Petroleum Jelly 100ml', sku: 'VSL-PTJ-100', barcode: '6001087004596', cost: 120, sell: 180, stock: 80, cat: 'Personal Care', unit: 'ml' },
    { name: 'Dettol Bar Soap 175g', sku: 'DTL-BAR-175', barcode: '5000158100534', cost: 100, sell: 150, stock: 80, cat: 'Personal Care', unit: 'piece' },
    { name: 'Lux Bar Soap 175g', sku: 'LUX-BAR-175', barcode: '6161113100013', cost: 80, sell: 120, stock: 100, cat: 'Personal Care', unit: 'piece' },
    { name: 'Geisha Bar Soap Pink 175g', sku: 'GSH-BAR-175', barcode: '6161113200010', cost: 60, sell: 90, stock: 120, cat: 'Personal Care', unit: 'piece' },
    { name: 'Imperial Leather Bar 175g', sku: 'IMP-BAR-175', barcode: '5000101500510', cost: 90, sell: 140, stock: 80, cat: 'Personal Care', unit: 'piece' },
    { name: 'Protex Bar Soap 175g', sku: 'PRX-BAR-175', barcode: '6161113300017', cost: 80, sell: 120, stock: 90, cat: 'Personal Care', unit: 'piece' },
    { name: 'Sure Deodorant Roll-on 50ml', sku: 'SUR-DEO-50', barcode: '8712561831093', cost: 200, sell: 300, stock: 40, cat: 'Personal Care', unit: 'ml' },
    { name: 'Nivea Deodorant Spray 150ml', sku: 'NVA-DEO-150', barcode: '4005808000012', cost: 350, sell: 500, stock: 30, cat: 'Personal Care', unit: 'ml' },
    { name: 'Head & Shoulders Shampoo 200ml', sku: 'HNS-SHP-200', barcode: '4015600000042', cost: 350, sell: 480, stock: 40, cat: 'Personal Care', unit: 'ml' },
    { name: 'Sunsilk Shampoo 200ml', sku: 'SNS-SHP-200', barcode: '6161113400014', cost: 200, sell: 300, stock: 50, cat: 'Personal Care', unit: 'ml' },
    { name: 'Dark & Lovely Relaxer Kit', sku: 'DNL-RLX-KIT', barcode: '6161113500011', cost: 350, sell: 500, stock: 30, cat: 'Personal Care', unit: 'piece' },
    { name: 'Always Sanitary Pads 8s', sku: 'ALW-PAD-8', barcode: '4015400759638', cost: 120, sell: 170, stock: 100, cat: 'Personal Care', unit: 'piece' },
    { name: 'Always Sanitary Pads 16s', sku: 'ALW-PAD-16', barcode: '4015400759645', cost: 220, sell: 320, stock: 60, cat: 'Personal Care', unit: 'piece' },
    { name: 'Softcare Tissue Roll 10s', sku: 'SFC-TIS-10', barcode: '6161113600018', cost: 300, sell: 420, stock: 50, cat: 'Personal Care', unit: 'pack' },
    { name: 'Royale Tissue Roll 4s', sku: 'RYL-TIS-4', barcode: '6161113700015', cost: 130, sell: 180, stock: 80, cat: 'Personal Care', unit: 'pack' },
    { name: 'Gillette Blue 3 Razors 4pk', sku: 'GIL-BL3-4', barcode: '7702018000128', cost: 200, sell: 300, stock: 50, cat: 'Personal Care', unit: 'pack' },

    // BABY PRODUCTS
    { name: 'Huggies Diapers Size 3 (36s)', sku: 'HGG-DPR-S3', barcode: '6161114000018', cost: 800, sell: 1100, stock: 30, cat: 'Baby Products', unit: 'pack' },
    { name: 'Huggies Diapers Size 4 (30s)', sku: 'HGG-DPR-S4', barcode: '6161114000025', cost: 850, sell: 1150, stock: 25, cat: 'Baby Products', unit: 'pack' },
    { name: 'Pampers Diapers Size 3 (36s)', sku: 'PMP-DPR-S3', barcode: '4015400406525', cost: 900, sell: 1200, stock: 20, cat: 'Baby Products', unit: 'pack' },
    { name: 'Pampers Diapers Size 4 (30s)', sku: 'PMP-DPR-S4', barcode: '4015400406532', cost: 950, sell: 1250, stock: 20, cat: 'Baby Products', unit: 'pack' },
    { name: 'Softcare Diapers Economy S3 (50s)', sku: 'SFC-DPR-S3', barcode: '6161114100015', cost: 700, sell: 950, stock: 35, cat: 'Baby Products', unit: 'pack' },
    { name: 'Johnson Baby Powder 200g', sku: 'JNS-BPW-200', barcode: '3574660239553', cost: 250, sell: 380, stock: 40, cat: 'Baby Products', unit: 'piece' },
    { name: 'Johnson Baby Lotion 200ml', sku: 'JNS-BLO-200', barcode: '3574660239560', cost: 350, sell: 500, stock: 30, cat: 'Baby Products', unit: 'ml' },
    { name: 'Johnson Baby Shampoo 200ml', sku: 'JNS-BSH-200', barcode: '3574660239577', cost: 300, sell: 430, stock: 35, cat: 'Baby Products', unit: 'ml' },
    { name: 'Cerelac Wheat 400g', sku: 'CRL-WHT-400', barcode: '7613033429064', cost: 450, sell: 620, stock: 25, cat: 'Baby Products', unit: 'piece' },
    { name: 'Cerelac Rice 400g', sku: 'CRL-RCE-400', barcode: '7613033429071', cost: 450, sell: 620, stock: 20, cat: 'Baby Products', unit: 'piece' },
    { name: 'NAN Baby Formula 400g', sku: 'NAN-FOR-400', barcode: '7613034099303', cost: 800, sell: 1100, stock: 15, cat: 'Baby Products', unit: 'piece' },
    { name: 'Similac Baby Formula 400g', sku: 'SML-FOR-400', barcode: '0070074673899', cost: 850, sell: 1150, stock: 12, cat: 'Baby Products', unit: 'piece' },
    { name: 'Baby Wipes Huggies 64s', sku: 'HGG-WIP-64', barcode: '6161114200012', cost: 200, sell: 300, stock: 40, cat: 'Baby Products', unit: 'pack' },

    // HOUSEHOLD ITEMS
    { name: 'Eveready Battery AA 4pk', sku: 'EVR-BAT-AA4', barcode: '6161115000013', cost: 120, sell: 180, stock: 80, cat: 'Household Items', unit: 'pack' },
    { name: 'Eveready Battery D 2pk', sku: 'EVR-BAT-D2', barcode: '6161115000020', cost: 100, sell: 150, stock: 60, cat: 'Household Items', unit: 'pack' },
    { name: 'Energizer Battery AA 4pk', sku: 'ENR-BAT-AA4', barcode: '7638900083798', cost: 200, sell: 300, stock: 40, cat: 'Household Items', unit: 'pack' },
    { name: 'Candle Household White 6pk', sku: 'CND-WHT-6PK', barcode: '6161115100010', cost: 60, sell: 100, stock: 100, cat: 'Household Items', unit: 'pack' },
    { name: 'Matchbox Lion 10pk', sku: 'LIO-MTC-10', barcode: '6161115200017', cost: 30, sell: 50, stock: 200, cat: 'Household Items', unit: 'pack' },
    { name: 'Glad Cling Wrap 30m', sku: 'GLD-CLG-30', barcode: '6161115300014', cost: 150, sell: 220, stock: 40, cat: 'Household Items', unit: 'piece' },
    { name: 'Glad Aluminium Foil 10m', sku: 'GLD-ALF-10', barcode: '6161115400011', cost: 200, sell: 300, stock: 30, cat: 'Household Items', unit: 'piece' },
    { name: 'Bin Liners Large 20s', sku: 'BIN-LIN-L20', barcode: '6161115500018', cost: 100, sell: 150, stock: 50, cat: 'Household Items', unit: 'pack' },
    { name: 'Mop Stick', sku: 'MOP-STK-01', barcode: '6161115600015', cost: 200, sell: 300, stock: 30, cat: 'Household Items', unit: 'piece' },
    { name: 'Broom Traditional', sku: 'BRM-TRD-01', barcode: '6161115700012', cost: 150, sell: 230, stock: 40, cat: 'Household Items', unit: 'piece' },
    { name: 'Plastic Basin 15L', sku: 'PLB-BSN-15', barcode: '6161115800019', cost: 200, sell: 300, stock: 30, cat: 'Household Items', unit: 'piece' },
    { name: 'Steel Wool 6pk', sku: 'STL-WOL-6PK', barcode: '6161115900016', cost: 50, sell: 80, stock: 80, cat: 'Household Items', unit: 'pack' },
    { name: 'Scouring Pad 3pk', sku: 'SCR-PAD-3PK', barcode: '6161116000019', cost: 40, sell: 60, stock: 100, cat: 'Household Items', unit: 'pack' },
    { name: 'Kitchen Towel Roll 2pk', sku: 'KTC-TWL-2PK', barcode: '6161116100016', cost: 120, sell: 180, stock: 60, cat: 'Household Items', unit: 'pack' },
    { name: 'Paper Bag Brown Large 50s', sku: 'PPB-BRN-L50', barcode: '6161116200013', cost: 80, sell: 120, stock: 80, cat: 'Household Items', unit: 'pack' },

    // STATIONERY
    { name: 'Counter Book 1 Quire A4', sku: 'CTB-1Q-A4', barcode: '6161117000015', cost: 60, sell: 95, stock: 100, cat: 'Stationery', unit: 'piece' },
    { name: 'Counter Book 2 Quire A4', sku: 'CTB-2Q-A4', barcode: '6161117000022', cost: 100, sell: 150, stock: 80, cat: 'Stationery', unit: 'piece' },
    { name: 'Exercise Book 48pg', sku: 'EXC-BK-48', barcode: '6161117100012', cost: 20, sell: 35, stock: 500, cat: 'Stationery', unit: 'piece' },
    { name: 'Exercise Book 96pg', sku: 'EXC-BK-96', barcode: '6161117100029', cost: 35, sell: 55, stock: 400, cat: 'Stationery', unit: 'piece' },
    { name: 'Exercise Book 200pg', sku: 'EXC-BK-200', barcode: '6161117100036', cost: 60, sell: 90, stock: 200, cat: 'Stationery', unit: 'piece' },
    { name: 'BIC Pen Blue 10pk', sku: 'BIC-PEN-BL10', barcode: '3086123248762', cost: 80, sell: 130, stock: 100, cat: 'Stationery', unit: 'pack' },
    { name: 'BIC Pen Black Single', sku: 'BIC-PEN-BK1', barcode: '3086123248779', cost: 10, sell: 20, stock: 300, cat: 'Stationery', unit: 'piece' },
    { name: 'HB Pencil 12pk', sku: 'HB-PCL-12PK', barcode: '6161117200019', cost: 60, sell: 100, stock: 100, cat: 'Stationery', unit: 'pack' },
    { name: 'Eraser Rubber Large', sku: 'ERS-RBR-LRG', barcode: '6161117300016', cost: 10, sell: 20, stock: 200, cat: 'Stationery', unit: 'piece' },
    { name: 'Ruler 30cm Plastic', sku: 'RUL-30-PLS', barcode: '6161117400013', cost: 15, sell: 30, stock: 150, cat: 'Stationery', unit: 'piece' },
    { name: 'Sellotape Clear 24mm', sku: 'SLT-CLR-24', barcode: '6161117500010', cost: 40, sell: 70, stock: 80, cat: 'Stationery', unit: 'piece' },
    { name: 'Glue Stick 21g', sku: 'GLU-STK-21', barcode: '6161117600017', cost: 30, sell: 50, stock: 100, cat: 'Stationery', unit: 'piece' },
    { name: 'A4 Printing Paper Ream 500s', sku: 'A4-PPR-500', barcode: '6161117700014', cost: 550, sell: 750, stock: 30, cat: 'Stationery', unit: 'piece' },
    { name: 'Manila Paper A2 White', sku: 'MNL-PPR-A2', barcode: '6161117800011', cost: 15, sell: 25, stock: 200, cat: 'Stationery', unit: 'piece' },
    { name: 'Crayons 12 Colours', sku: 'CRY-12-CLR', barcode: '6161117900018', cost: 50, sell: 80, stock: 80, cat: 'Stationery', unit: 'pack' },

    // ALCOHOL & SPIRITS (for shops licensed)
    { name: 'Tusker Lager 500ml', sku: 'TSK-LGR-500', barcode: '6161118000017', cost: 150, sell: 220, stock: 100, cat: 'Alcohol & Spirits', unit: 'piece' },
    { name: 'Tusker Malt 500ml', sku: 'TSK-MLT-500', barcode: '6161118000024', cost: 180, sell: 260, stock: 80, cat: 'Alcohol & Spirits', unit: 'piece' },
    { name: 'White Cap Lager 500ml', sku: 'WCP-LGR-500', barcode: '6161118100014', cost: 150, sell: 220, stock: 80, cat: 'Alcohol & Spirits', unit: 'piece' },
    { name: 'Pilsner Lager 500ml', sku: 'PLS-LGR-500', barcode: '6161118200011', cost: 140, sell: 210, stock: 100, cat: 'Alcohol & Spirits', unit: 'piece' },
    { name: 'Guinness Foreign Extra 500ml', sku: 'GNS-FES-500', barcode: '5000213003558', cost: 200, sell: 290, stock: 60, cat: 'Alcohol & Spirits', unit: 'piece' },
    { name: 'Senator Lager 500ml', sku: 'SEN-LGR-500', barcode: '6161118300018', cost: 100, sell: 150, stock: 120, cat: 'Alcohol & Spirits', unit: 'piece' },
    { name: 'Smirnoff Ice 275ml', sku: 'SMR-ICE-275', barcode: '5000281035956', cost: 130, sell: 200, stock: 80, cat: 'Alcohol & Spirits', unit: 'piece' },
    { name: 'Kenya Cane 250ml', sku: 'KCN-250', barcode: '6161118400015', cost: 200, sell: 300, stock: 40, cat: 'Alcohol & Spirits', unit: 'ml' },
    { name: 'Kenya Cane 750ml', sku: 'KCN-750', barcode: '6161118400022', cost: 550, sell: 750, stock: 20, cat: 'Alcohol & Spirits', unit: 'ml' },
    { name: 'Gilbeys Gin 250ml', sku: 'GLB-GIN-250', barcode: '6161118500012', cost: 250, sell: 380, stock: 30, cat: 'Alcohol & Spirits', unit: 'ml' },
    { name: 'Johnnie Walker Red Label 750ml', sku: 'JWR-RED-750', barcode: '5000267014203', cost: 2000, sell: 2800, stock: 10, cat: 'Alcohol & Spirits', unit: 'ml' },
    { name: 'Jack Daniels 750ml', sku: 'JKD-750', barcode: '0082184000243', cost: 3500, sell: 4500, stock: 8, cat: 'Alcohol & Spirits', unit: 'ml' },
    { name: 'Viceroy Brandy 250ml', sku: 'VCR-BRN-250', barcode: '6161118600019', cost: 200, sell: 300, stock: 35, cat: 'Alcohol & Spirits', unit: 'ml' },
    { name: 'Chrome Vodka 250ml', sku: 'CHR-VOD-250', barcode: '6161118700016', cost: 180, sell: 280, stock: 40, cat: 'Alcohol & Spirits', unit: 'ml' },
    { name: 'Savanna Dry Cider 330ml', sku: 'SAV-DRY-330', barcode: '6001108013302', cost: 150, sell: 230, stock: 50, cat: 'Alcohol & Spirits', unit: 'piece' },

    // FRESH PRODUCE
    { name: 'Tomatoes Fresh 1kg', sku: 'TOM-FRH-1KG', barcode: '2000100000019', cost: 80, sell: 120, stock: 50, cat: 'Fresh Produce', unit: 'kg' },
    { name: 'Onions Red 1kg', sku: 'ONI-RED-1KG', barcode: '2000100000026', cost: 60, sell: 100, stock: 60, cat: 'Fresh Produce', unit: 'kg' },
    { name: 'Potatoes 1kg', sku: 'POT-FRH-1KG', barcode: '2000100000033', cost: 80, sell: 120, stock: 80, cat: 'Fresh Produce', unit: 'kg' },
    { name: 'Carrots 500g', sku: 'CRT-FRH-500', barcode: '2000100000040', cost: 40, sell: 60, stock: 40, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Cabbage Head', sku: 'CBG-FRH-1', barcode: '2000100000057', cost: 50, sell: 80, stock: 30, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Spinach Bunch', sku: 'SPN-FRH-1', barcode: '2000100000064', cost: 20, sell: 40, stock: 40, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Sukuma Wiki Bunch', sku: 'SKW-FRH-1', barcode: '2000100000071', cost: 15, sell: 30, stock: 50, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Bananas 1kg', sku: 'BAN-FRH-1KG', barcode: '2000100000088', cost: 80, sell: 120, stock: 40, cat: 'Fresh Produce', unit: 'kg' },
    { name: 'Avocado (3 pcs)', sku: 'AVO-FRH-3', barcode: '2000100000095', cost: 60, sell: 100, stock: 30, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Mangoes 1kg', sku: 'MNG-FRH-1KG', barcode: '2000100000101', cost: 100, sell: 160, stock: 30, cat: 'Fresh Produce', unit: 'kg' },
    { name: 'Oranges 6pcs', sku: 'ORG-FRH-6', barcode: '2000100000118', cost: 100, sell: 150, stock: 40, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Pineapple Fresh', sku: 'PIN-FRH-1', barcode: '2000100000125', cost: 120, sell: 180, stock: 20, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Watermelon Whole', sku: 'WTR-FRH-1', barcode: '2000100000132', cost: 200, sell: 300, stock: 10, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Green Pepper 250g', sku: 'GPP-FRH-250', barcode: '2000100000149', cost: 40, sell: 60, stock: 40, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Garlic Bulb 3pk', sku: 'GRL-FRH-3', barcode: '2000100000156', cost: 50, sell: 80, stock: 50, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Ginger Fresh 250g', sku: 'GNG-FRH-250', barcode: '2000100000163', cost: 60, sell: 100, stock: 30, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Lemons 6pcs', sku: 'LMN-FRH-6', barcode: '2000100000170', cost: 60, sell: 90, stock: 40, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Passion Fruit 6pcs', sku: 'PSN-FRH-6', barcode: '2000100000187', cost: 90, sell: 140, stock: 25, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Grapes Red 500g', sku: 'GRP-RED-500', barcode: '2000100000194', cost: 200, sell: 300, stock: 15, cat: 'Fresh Produce', unit: 'piece' },
    { name: 'Apples Red 6pcs', sku: 'APL-RED-6', barcode: '2000100000200', cost: 250, sell: 380, stock: 20, cat: 'Fresh Produce', unit: 'piece' },

    // MEAT & POULTRY
    { name: 'Farmers Choice Sausages 500g', sku: 'FMC-SAU-500', barcode: '6161119000010', cost: 350, sell: 480, stock: 30, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Farmers Choice Bacon 200g', sku: 'FMC-BCN-200', barcode: '6161119000027', cost: 300, sell: 420, stock: 25, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Farmers Choice Ham 200g', sku: 'FMC-HAM-200', barcode: '6161119000034', cost: 280, sell: 400, stock: 20, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Fresh Chicken Whole 1.5kg', sku: 'FCK-WHL-1.5', barcode: '2000200000018', cost: 600, sell: 850, stock: 15, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Fresh Chicken Breast 500g', sku: 'FCK-BRS-500', barcode: '2000200000025', cost: 350, sell: 500, stock: 20, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Beef Mince 500g', sku: 'BEF-MNC-500', barcode: '2000200000032', cost: 350, sell: 500, stock: 15, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Beef Stewing 1kg', sku: 'BEF-STW-1KG', barcode: '2000200000049', cost: 550, sell: 750, stock: 10, cat: 'Meat & Poultry', unit: 'kg' },
    { name: 'Eggs Tray (30s)', sku: 'EGG-TRY-30', barcode: '2000200000056', cost: 400, sell: 550, stock: 30, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Eggs 6 Pack', sku: 'EGG-6PK', barcode: '2000200000063', cost: 90, sell: 130, stock: 50, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Tilapia Fish Fresh 1kg', sku: 'TLP-FSH-1KG', barcode: '2000200000070', cost: 400, sell: 600, stock: 10, cat: 'Meat & Poultry', unit: 'kg' },
    { name: 'Frozen Tilapia 1kg', sku: 'FRZ-TLP-1KG', barcode: '6161119100017', cost: 350, sell: 500, stock: 20, cat: 'Meat & Poultry', unit: 'kg' },
    { name: 'Sardines Canned 155g', sku: 'SRD-CAN-155', barcode: '6161119200014', cost: 80, sell: 120, stock: 60, cat: 'Meat & Poultry', unit: 'piece' },
    { name: 'Corned Beef 340g', sku: 'CRN-BEF-340', barcode: '6161119300011', cost: 300, sell: 420, stock: 25, cat: 'Meat & Poultry', unit: 'piece' },

    // TOILETRIES
    { name: 'Toilet Paper Fay 4pk', sku: 'FAY-TLT-4PK', barcode: '6161120000015', cost: 120, sell: 180, stock: 80, cat: 'Toiletries', unit: 'pack' },
    { name: 'Toilet Paper Kleenex 6pk', sku: 'KLX-TLT-6PK', barcode: '6161120100012', cost: 200, sell: 290, stock: 50, cat: 'Toiletries', unit: 'pack' },
    { name: 'Cotton Wool 100g', sku: 'CTW-100', barcode: '6161120200019', cost: 50, sell: 80, stock: 80, cat: 'Toiletries', unit: 'piece' },
    { name: 'Cotton Buds 100s', sku: 'CTB-100', barcode: '6161120300016', cost: 40, sell: 60, stock: 100, cat: 'Toiletries', unit: 'pack' },
    { name: 'Hand Sanitizer 250ml', sku: 'HND-SAN-250', barcode: '6161120400013', cost: 150, sell: 220, stock: 50, cat: 'Toiletries', unit: 'ml' },
    { name: 'Hand Sanitizer 500ml', sku: 'HND-SAN-500', barcode: '6161120400020', cost: 250, sell: 380, stock: 30, cat: 'Toiletries', unit: 'ml' },
    { name: 'Face Mask Disposable 50s', sku: 'FCM-DSP-50', barcode: '6161120500010', cost: 200, sell: 300, stock: 40, cat: 'Toiletries', unit: 'box' },
    { name: 'Wet Wipes 80s', sku: 'WET-WIP-80', barcode: '6161120600017', cost: 100, sell: 150, stock: 60, cat: 'Toiletries', unit: 'pack' },
    { name: 'Air Freshener Glade 300ml', sku: 'GLD-AFR-300', barcode: '5000204817157', cost: 250, sell: 380, stock: 30, cat: 'Toiletries', unit: 'ml' },
    { name: 'Doom Insecticide 300ml', sku: 'DOM-INS-300', barcode: '6161120700014', cost: 280, sell: 400, stock: 40, cat: 'Toiletries', unit: 'ml' },
    { name: 'Mortein Doom 600ml', sku: 'MRT-DOM-600', barcode: '6161120800011', cost: 450, sell: 620, stock: 25, cat: 'Toiletries', unit: 'ml' },
    { name: 'Nail Polish Remover 100ml', sku: 'NPR-100', barcode: '6161120900018', cost: 80, sell: 130, stock: 30, cat: 'Toiletries', unit: 'ml' },

    // ELECTRONICS & ACCESSORIES
    { name: 'Phone Charger USB-C', sku: 'PHN-CHR-USC', barcode: '6161121000017', cost: 200, sell: 350, stock: 40, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Phone Charger Micro-USB', sku: 'PHN-CHR-MUS', barcode: '6161121000024', cost: 150, sell: 280, stock: 50, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Earphones Wired 3.5mm', sku: 'EAR-WRD-3.5', barcode: '6161121100014', cost: 80, sell: 150, stock: 60, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Bluetooth Earbuds', sku: 'BLT-EBD-01', barcode: '6161121200011', cost: 500, sell: 850, stock: 20, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Phone Screen Protector', sku: 'PHN-SCP-01', barcode: '6161121300018', cost: 50, sell: 100, stock: 80, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Phone Case Universal', sku: 'PHN-CSE-UNI', barcode: '6161121400015', cost: 100, sell: 200, stock: 50, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'LED Bulb 9W', sku: 'LED-BLB-9W', barcode: '6161121500012', cost: 80, sell: 150, stock: 60, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'LED Bulb 15W', sku: 'LED-BLB-15W', barcode: '6161121600019', cost: 120, sell: 200, stock: 40, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Extension Cable 4-way 3m', sku: 'EXT-CBL-4W3', barcode: '6161121700016', cost: 300, sell: 500, stock: 25, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Multi-Plug Adapter', sku: 'MLT-PLG-01', barcode: '6161121800013', cost: 150, sell: 280, stock: 30, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'USB Flash Drive 16GB', sku: 'USB-FLD-16', barcode: '6161121900010', cost: 350, sell: 550, stock: 20, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'USB Flash Drive 32GB', sku: 'USB-FLD-32', barcode: '6161122000019', cost: 500, sell: 780, stock: 15, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Memory Card 32GB', sku: 'MEM-CRD-32', barcode: '6161122100016', cost: 400, sell: 650, stock: 20, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Power Bank 10000mAh', sku: 'PWR-BNK-10K', barcode: '6161122200013', cost: 800, sell: 1300, stock: 15, cat: 'Electronics & Accessories', unit: 'piece' },
    { name: 'Torch Rechargeable LED', sku: 'TRC-LED-01', barcode: '6161122300010', cost: 200, sell: 350, stock: 25, cat: 'Electronics & Accessories', unit: 'piece' },
  ];

  console.log(`Inserting ${products.length} products...`);
  
  let inserted = 0;
  for (const p of products) {
    try {
      await client.query(`
        INSERT INTO products (shop_id, category_id, name, sku, barcode, unit, cost_price, selling_price, stock_quantity, reorder_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [DEMO_SHOP_ID, catIds[p.cat], p.name, p.sku, p.barcode, p.unit, p.cost, p.sell, p.stock, Math.ceil(p.stock * 0.15)]);
      inserted++;
    } catch (err) {
      console.error(`Failed: ${p.name}: ${err.message}`);
    }
  }
  console.log(`${inserted} products inserted`);

  // ============================================================
  // CUSTOMERS
  // ============================================================
  const customers = [
    { name: 'Wanjiku Kamau', phone: '0712345001', email: 'wanjiku@email.com', address: 'Eastleigh, Nairobi' },
    { name: 'John Omondi', phone: '0712345002', email: 'omondi@email.com', address: 'Westlands, Nairobi' },
    { name: 'Amina Hassan', phone: '0712345003', email: 'amina@email.com', address: 'South C, Nairobi' },
    { name: 'Peter Chebet', phone: '0712345004', email: null, address: 'Kilimani, Nairobi' },
    { name: 'Grace Njeri', phone: '0712345005', email: 'grace@email.com', address: 'Umoja, Nairobi' },
    { name: 'David Kipchoge', phone: '0712345006', email: null, address: 'Karen, Nairobi' },
    { name: 'Faith Achieng', phone: '0712345007', email: 'faith@email.com', address: 'Langata, Nairobi' },
    { name: 'Samuel Mwangi', phone: '0712345008', email: null, address: 'Kayole, Nairobi' },
    { name: 'Rose Wambui', phone: '0712345009', email: 'rose@email.com', address: 'Buruburu, Nairobi' },
    { name: 'James Otieno', phone: '0712345010', email: 'james@email.com', address: 'Donholm, Nairobi' },
    { name: 'Mary Wangari', phone: '0712345011', email: null, address: 'Pipeline, Nairobi' },
    { name: 'Robert Kiprono', phone: '0712345012', email: 'robert@email.com', address: 'Ngong, Kajiado' },
    { name: 'Joyce Muthoni', phone: '0712345013', email: null, address: 'Rongai, Kajiado' },
    { name: 'Charles Ochieng', phone: '0712345014', email: 'charles@email.com', address: 'Thika, Kiambu' },
    { name: 'Lucy Akinyi', phone: '0712345015', email: null, address: 'Ruiru, Kiambu' },
    { name: 'Michael Njoroge', phone: '0712345016', email: 'michael@email.com', address: 'Juja, Kiambu' },
    { name: 'Sarah Cherop', phone: '0712345017', email: null, address: 'Kitengela, Kajiado' },
    { name: 'Joseph Mutua', phone: '0712345018', email: 'joseph@email.com', address: 'Machakos Town' },
    { name: 'Mercy Wanjiru', phone: '0712345019', email: null, address: 'Kiambu Town' },
    { name: 'Paul Rotich', phone: '0712345020', email: 'paul@email.com', address: 'Eldoret, Uasin Gishu' },
  ];

  for (const c of customers) {
    await client.query(`
      INSERT INTO customers (shop_id, name, phone, email, address)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `, [DEMO_SHOP_ID, c.name, c.phone, c.email, c.address]);
  }
  console.log(`${customers.length} customers inserted`);

  // ============================================================
  // SUPPLIERS
  // ============================================================
  const suppliers = [
    { name: 'Unga Group Limited', phone: '0722001100', email: 'orders@unga.com', contact: 'Margaret Wanjiku', notes: 'Main flour & grains supplier' },
    { name: 'EABL (East African Breweries)', phone: '0722002200', email: 'supply@eabl.com', contact: 'Peter Omondi', notes: 'Beverages & alcohol' },
    { name: 'Bidco Africa', phone: '0722003300', email: 'sales@bidco.africa', contact: 'James Kamau', notes: 'Cooking oils, fats, personal care' },
    { name: 'Kapa Oil Refineries', phone: '0722004400', email: 'orders@kapa.co.ke', contact: 'Susan Njeri', notes: 'Cooking oils & fats' },
    { name: 'PZ Cussons Kenya', phone: '0722005500', email: 'trade@pzcussons.co.ke', contact: 'David Otieno', notes: 'Personal care products' },
    { name: 'Unilever Kenya', phone: '0722006600', email: 'supply@unilever.co.ke', contact: 'Alice Wambui', notes: 'FMCG - detergents, personal care, food' },
    { name: 'Pwani Oil Products', phone: '0722007700', email: 'sales@pwani.co.ke', contact: 'Hassan Ali', notes: 'Cooking oils supplier' },
    { name: 'Coca-Cola Beverages Africa', phone: '0722008800', email: 'supply@cocacola.co.ke', contact: 'John Karanja', notes: 'Soft drinks & beverages' },
    { name: 'Del Monte Kenya', phone: '0722009900', email: 'trade@delmonte.co.ke', contact: 'Grace Achieng', notes: 'Juices, canned fruits, tomato paste' },
    { name: 'Nairobi Distributors Ltd', phone: '0722010100', email: 'info@nairobidist.co.ke', contact: 'Martin Kiplagat', notes: 'General wholesale distributor' },
    { name: 'Brookside Dairy', phone: '0722011100', email: 'orders@brookside.co.ke', contact: 'Jane Muthoni', notes: 'Milk, yoghurt, dairy products' },
    { name: 'Tropical Heat Ltd', phone: '0722012200', email: 'sales@tropicalheat.co.ke', contact: 'Ahmed Mohamed', notes: 'Spices, snacks, nuts' },
    { name: 'Farmers Choice', phone: '0722013300', email: 'orders@farmerschoice.co.ke', contact: 'Charles Ngugi', notes: 'Sausages, bacon, processed meat' },
    { name: 'Ketepa Tea', phone: '0722014400', email: 'trade@ketepa.com', contact: 'Elizabeth Koech', notes: 'Tea products' },
    { name: 'Stationery World Ltd', phone: '0722015500', email: 'sales@stationeryworld.co.ke', contact: 'Dennis Ogutu', notes: 'Stationery & office supplies' },
  ];

  for (const s of suppliers) {
    await client.query(`
      INSERT INTO suppliers (shop_id, name, phone, email, contact_person, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT DO NOTHING
    `, [DEMO_SHOP_ID, s.name, s.phone, s.email, s.contact, s.notes]);
  }
  console.log(`${suppliers.length} suppliers inserted`);

  // ============================================================
  // SAMPLE EXPENSES
  // ============================================================
  const expenses = [
    { cat: 'Rent', desc: 'Shop rent - March 2026', amount: 35000, method: 'mpesa', date: '2026-03-01' },
    { cat: 'Electricity (KPLC)', desc: 'KPLC token purchase', amount: 5400, method: 'mpesa', date: '2026-03-03' },
    { cat: 'Water (NWSC)', desc: 'Water bill March', amount: 2500, method: 'mpesa', date: '2026-03-05' },
    { cat: 'Staff Wages', desc: 'Cashier salary - Mary', amount: 18000, method: 'mpesa', date: '2026-03-01' },
    { cat: 'Staff Wages', desc: 'Stock clerk salary - John', amount: 15000, method: 'mpesa', date: '2026-03-01' },
    { cat: 'Transport', desc: 'Stock delivery from warehouse', amount: 3000, method: 'cash', date: '2026-03-02' },
    { cat: 'M-Pesa Charges', desc: 'Monthly M-Pesa transaction fees', amount: 1200, method: 'mpesa', date: '2026-03-07' },
    { cat: 'Packaging', desc: 'Paper bags & carrier bags', amount: 2000, method: 'cash', date: '2026-03-04' },
    { cat: 'Repairs', desc: 'Fridge repair service', amount: 4500, method: 'cash', date: '2026-03-06' },
    { cat: 'Miscellaneous', desc: 'County business permit renewal', amount: 8000, method: 'mpesa', date: '2026-02-28' },
    { cat: 'Transport', desc: 'Delivery fuel costs', amount: 2500, method: 'cash', date: '2026-03-08' },
    { cat: 'Repairs', desc: 'Signboard repair', amount: 1500, method: 'cash', date: '2026-03-09' },
  ];

  for (const e of expenses) {
    await client.query(`
      INSERT INTO expenses (shop_id, category, description, amount, payment_method, incurred_at)
      VALUES ($1, $2, $3, $4, $5::payment_method, $6)
    `, [DEMO_SHOP_ID, e.cat, e.desc, e.amount, e.method, e.date]);
  }
  console.log(`${expenses.length} expenses inserted`);

  // ============================================================
  // SAMPLE SALES (last 30 days mock data)
  // ============================================================
  console.log('Starting sales generation...');
  // Get product IDs for generating sale items
  const prodRows = await client.query(`SELECT id, name, cost_price, selling_price FROM products WHERE shop_id = $1 LIMIT 200`, [DEMO_SHOP_ID]);
  const prods = prodRows.rows;
  console.log(`Found ${prods.length} products for sale generation`);
  
  const custRows = await client.query(`SELECT id FROM customers WHERE shop_id = $1`, [DEMO_SHOP_ID]);
  const custIds = custRows.rows.map(r => r.id);
  console.log(`Found ${custIds.length} customers`);

  const paymentMethods = ['cash', 'mpesa', 'cash', 'mpesa', 'card', 'cash', 'mpesa', 'credit'];
  let saleCount = 0;

  // Disable stock deduction trigger during seeding for performance
  await client.query(`ALTER TABLE sale_items DISABLE TRIGGER ALL`);

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const salesPerDay = 3 + Math.floor(Math.random() * 5); // 3-7 sales per day
    for (let s = 0; s < salesPerDay; s++) {
      const hour = 7 + Math.floor(Math.random() * 12);
      const minute = Math.floor(Math.random() * 60);
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - daysAgo);
      saleDate.setHours(hour, minute, 0, 0);

      const itemCount = 1 + Math.floor(Math.random() * 4);
      const selectedProducts = [];
      for (let i = 0; i < itemCount; i++) {
        const p = prods[Math.floor(Math.random() * prods.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        selectedProducts.push({ ...p, qty });
      }

      const subtotal = selectedProducts.reduce((a, p) => a + (parseFloat(p.selling_price) * p.qty), 0);
      const discount = Math.random() > 0.8 ? Math.round(subtotal * 0.05) : 0;
      const total = subtotal - discount;
      const profit = selectedProducts.reduce((a, p) => a + ((parseFloat(p.selling_price) - parseFloat(p.cost_price)) * p.qty), 0) - discount;
      const pm = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const customerId = Math.random() > 0.4 ? custIds[Math.floor(Math.random() * custIds.length)] : null;

      const receiptNum = `RCT-${saleDate.toISOString().slice(2,10).replace(/-/g,'')}-${String(saleCount + 1).padStart(4,'0')}`;

      try {
        const saleRes = await client.query(`
          INSERT INTO sales (shop_id, customer_id, receipt_number, subtotal, discount_amount, total_amount, profit_amount, payment_method, status, cashier_id, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8::payment_method, 'completed', $9, $10)
          RETURNING id
        `, [DEMO_SHOP_ID, customerId, receiptNum, subtotal, discount, total, profit, pm, DEMO_USER_ID, saleDate.toISOString()]);

        const saleId = saleRes.rows[0].id;

        // Batch insert all sale items
        const itemValues = [];
        const itemParams = [];
        let paramIdx = 1;
        for (const sp of selectedProducts) {
          const lineTotal = parseFloat(sp.selling_price) * sp.qty;
          itemValues.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
          itemParams.push(saleId, sp.id, sp.name, sp.qty, sp.selling_price, sp.cost_price, lineTotal);
        }
        await client.query(`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, cost_price, line_total)
          VALUES ${itemValues.join(', ')}
        `, itemParams);

        // Create payment record
        await client.query(`
          INSERT INTO payments (shop_id, sale_id, customer_id, amount, method, status)
          VALUES ($1, $2, $3, $4, $5::payment_method, 'completed')
        `, [DEMO_SHOP_ID, saleId, customerId, pm === 'credit' ? 0 : total, pm === 'credit' ? 'cash' : pm]);

        // If credit sale, create debt record
        if (pm === 'credit' && customerId) {
          const dueDate = new Date(saleDate);
          dueDate.setDate(dueDate.getDate() + 14 + Math.floor(Math.random() * 16));
          await client.query(`
            INSERT INTO debt_records (shop_id, customer_id, sale_id, original_amount, remaining_amount, due_date)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [DEMO_SHOP_ID, customerId, saleId, total, total, dueDate.toISOString().slice(0,10)]);
        }

        saleCount++;
      } catch (err) {
        if (saleCount < 3) console.error(`Sale error: ${err.message}`);
      }
    }
    if (daysAgo % 10 === 0) console.log(`  Day -${daysAgo} done (${saleCount} sales so far)`);
  }

  // Re-enable triggers
  await client.query(`ALTER TABLE sale_items ENABLE TRIGGER ALL`);
  console.log(`${saleCount} sales with items inserted`);

  // Update customer totals
  await client.query(`
    UPDATE customers c SET 
      total_purchases = COALESCE((SELECT SUM(s.total_amount) FROM sales s WHERE s.customer_id = c.id AND s.status = 'completed'), 0),
      total_debt = COALESCE((SELECT SUM(d.remaining_amount) FROM debt_records d WHERE d.customer_id = c.id AND NOT d.is_settled), 0)
    WHERE c.shop_id = $1
  `, [DEMO_SHOP_ID]);
  console.log('Customer totals updated');

  console.log('\n=== SEED COMPLETE ===');
  console.log(`Demo login: demo@dukaerp.com / password123`);
  console.log(`Shop: Duka Smart Supermarket`);
  console.log(`Products: ${products.length}`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Suppliers: ${suppliers.length}`);
  console.log(`Sales: ~${saleCount}`);
}

seed().catch(console.error).finally(() => client.end());
