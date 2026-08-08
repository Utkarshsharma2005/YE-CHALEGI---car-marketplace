/**
 * Comprehensive E2E API Test Suite — YE CHALEGI
 * Tests auth, rate limiting, CRUD, edge cases, security
 */
require('dotenv').config();

const BASE = process.env.API_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@yechalegi.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123';
const results = [];
let adminToken = '';
let buyerToken = '';
let buyerEmail = '';
let createdCarId = '';

const pass = (name, detail = '') => results.push({ status: 'PASS', name, detail });
const fail = (name, detail = '') => results.push({ status: 'FAIL', name, detail });
const warn = (name, detail = '') => results.push({ status: 'WARN', name, detail });

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { res, data };
}

async function run() {
  console.log('=== YE CHALEGI COMPREHENSIVE API TEST SUITE ===\n');
  console.log(`Target: ${BASE}\n`);

  // ── HEALTH ──
  {
    const { res, data } = await req('/');
    res.status === 200 && data?.status === 'online'
      ? pass('Health check', data.message)
      : fail('Health check', `status=${res.status}`);
  }

  // ── AUTH: Admin Login ──
  {
    const { res, data } = await req('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (res.status === 200 && data.token && data.user?.role === 'admin') {
      adminToken = data.token;
      pass('Admin login success', `role=${data.user.role}`);
    } else {
      fail('Admin login success', JSON.stringify(data));
    }
  }

  // ── AUTH: Wrong password ──
  {
    const { res, data } = await req('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrongpass' }),
    });
    res.status === 401 && data?.error
      ? pass('Admin login rejects wrong password', data.error)
      : fail('Admin login rejects wrong password', `status=${res.status}`);
  }

  // ── AUTH: Missing fields ──
  {
    const { res, data } = await req('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL }),
    });
    res.status === 400
      ? pass('Login rejects missing password', data?.error)
      : fail('Login rejects missing password', `status=${res.status}`);
  }

  // ── AUTH: Register buyer ──
  {
    buyerEmail = `e2e_buyer_${Date.now()}@test.com`;
    const { res, data } = await req('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test Buyer',
        email: buyerEmail,
        password: 'buyerpass123',
        phone: '+91 9876543210',
        city: 'Mumbai',
      }),
    });
    if (res.status === 201 && data.token && data.user?.role === 'buyer') {
      buyerToken = data.token;
      pass('Buyer registration', `email=${buyerEmail}, role=${data.user.role}`);
    } else {
      fail('Buyer registration', JSON.stringify(data));
    }
  }

  // ── AUTH: Duplicate email ──
  {
    const { res, data } = await req('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Dup', email: buyerEmail, password: 'pass1234' }),
    });
    res.status === 400 && data?.error?.includes('already')
      ? pass('Duplicate email rejected', data.error)
      : fail('Duplicate email rejected', `status=${res.status} ${JSON.stringify(data)}`);
  }

  // ── AUTH: Role escalation blocked ──
  {
    const { res, data } = await req('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker',
        email: `hacker_${Date.now()}@test.com`,
        password: 'pass1234',
        role: 'admin',
      }),
    });
    res.status === 400 && data?.error?.includes('disallowed')
      ? pass('Role escalation blocked on register', data.error)
      : fail('Role escalation blocked', `status=${res.status}`);
  }

  // ── AUTH: Short password ──
  {
    const { res, data } = await req('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Short', email: `short_${Date.now()}@test.com`, password: '123' }),
    });
    res.status === 400 && data?.error?.includes('6 characters')
      ? pass('Short password rejected', data.error)
      : fail('Short password rejected', `status=${res.status}`);
  }

  // ── AUTH: Google login (no verification!) ──
  {
    const { res, data } = await req('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `google_fake_${Date.now()}@gmail.com`,
        name: 'Fake Google User',
        picture: 'https://example.com/pic.jpg',
        provider: 'google',
      }),
    });
    if (res.status === 200 && data.token) {
      warn('Google auth accepts unverified email', 'No OAuth token verification — anyone can POST any email');
    } else {
      pass('Google auth blocked unverified', JSON.stringify(data));
    }
  }

  // ── AUTH: /me endpoint ──
  {
    const { res, data } = await req('/api/auth/me', {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    res.status === 200 && data.user?.email === buyerEmail
      ? pass('GET /api/auth/me returns buyer profile', data.user.name)
      : fail('GET /api/auth/me', `status=${res.status}`);
  }

  // ── AUTH: /me without token ──
  {
    const { res } = await req('/api/auth/me');
    res.status === 401
      ? pass('/api/auth/me rejects no token', '401')
      : fail('/api/auth/me no token', `status=${res.status}`);
  }

  // ── AUTH: Invalid token ──
  {
    const { res, data } = await req('/api/auth/me', {
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    res.status === 401
      ? pass('Invalid JWT rejected', data?.error)
      : fail('Invalid JWT rejected', `status=${res.status}`);
  }

  // ── AUTH: Profile update ──
  {
    const { res, data } = await req('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ name: 'Updated Buyer', city: 'Delhi' }),
    });
    res.status === 200 && data.user?.city === 'Delhi'
      ? pass('Profile update works', `city=${data.user.city}`)
      : fail('Profile update', JSON.stringify(data));
  }

  // ── CARS: Public listing ──
  {
    const { res, data } = await req('/api/cars');
    Array.isArray(data) && data.length > 0
      ? pass('GET /api/cars returns inventory', `${data.length} cars`)
      : fail('GET /api/cars', `status=${res.status}, count=${data?.length}`);
  }

  // ── CARS: Search filter ──
  {
    const { res, data } = await req('/api/cars?search=Maruti');
    Array.isArray(data) && data.some(c => c.company?.includes('Maruti'))
      ? pass('Search filter works', `found ${data.length} Maruti results`)
      : fail('Search filter', `count=${data?.length}`);
  }

  // ── CARS: Price filter ──
  {
    const { res, data } = await req('/api/cars?minPrice=100000&maxPrice=500000');
    const allInRange = Array.isArray(data) && data.every(c => c.price >= 100000 && c.price <= 500000);
    allInRange
      ? pass('Price range filter works', `${data.length} cars in range`)
      : fail('Price range filter', `count=${data?.length}`);
  }

  // ── CARS: Sort ──
  {
    const { res, data } = await req('/api/cars?sort=price_asc');
    const sorted = Array.isArray(data) && data.every((c, i) => i === 0 || data[i - 1].price <= c.price);
    sorted
      ? pass('Sort by price ascending', `first=${data[0]?.price}, last=${data[data.length - 1]?.price}`)
      : fail('Sort price_asc', 'not sorted');
  }

  // ── CARS: Get by lot number ──
  {
    const { res, data } = await req('/api/cars/1');
    res.status === 200 && data.lotNumber === 1
      ? pass('GET car by lot number', `Lot ${data.lotNumber}: ${data.company} ${data.model}`)
      : fail('GET car by lot number', `status=${res.status}`);
  }

  // ── CARS: Invalid ID ──
  {
    const { res, data } = await req('/api/cars/not-a-valid-id');
    res.status === 400
      ? pass('Invalid car ID rejected', data?.error)
      : fail('Invalid car ID', `status=${res.status}`);
  }

  // ── CARS: Not found ──
  {
    const { res, data } = await req('/api/cars/000000000000000000000000');
    res.status === 404
      ? pass('Non-existent car returns 404', data?.error)
      : fail('Non-existent car 404', `status=${res.status}`);
  }

  // ── CARS: Create without auth ──
  {
    const { res, data } = await req('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: 'Test', model: 'Car', price: 100000, year: 2024, fuelType: 'Petrol', transmission: 'Manual', kmDriven: 1000, description: 'Test', imageUrl: 'https://example.com/img.jpg' }),
    });
    res.status === 401
      ? pass('Create car without token rejected', data?.error)
      : fail('Create car without token', `status=${res.status}`);
  }

  // ── CARS: Create as buyer (forbidden) ──
  {
    const { res, data } = await req('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ company: 'Test', model: 'Car', price: 100000, year: 2024, fuelType: 'Petrol', transmission: 'Manual', kmDriven: 1000, description: 'Test', imageUrl: 'https://example.com/img.jpg' }),
    });
    res.status === 403
      ? pass('Create car as buyer forbidden', data?.error)
      : fail('Create car as buyer', `status=${res.status}`);
  }

  // ── CARS: Admin create with full details ──
  {
    const payload = {
      company: 'Tata Motors',
      model: 'Nexon EV Max E2E Test',
      price: 1450000,
      year: 2024,
      fuelType: 'Electric',
      transmission: 'Automatic',
      kmDriven: 8500,
      imageUrl: 'https://images.unsplash.com/photo-1619767886554-ef1d06d84959?auto=format&fit=crop&q=80&w=800',
      description: 'E2E test car — single owner Tata Nexon EV Max with full service history and verified inspection.',
      bodyType: 'SUV',
      registrationCity: 'Bangalore',
      power: 143,
      torque: 250,
      zeroToSixty: 9.0,
      topSpeed: 140,
      range: 437,
      seats: 5,
      drivetrain: 'FWD',
      colorName: 'Daytona Grey',
      colorHex: '#4A4A4A',
      ownerCount: 1,
      accidental: 'Non-Accidental',
      insuranceStatus: 'Valid Comprehensive',
      features: ['Touchscreen', 'Sunroof', 'ADAS', 'Fast Charging'],
      sellerName: 'YE CHALEGI Bangalore Hub',
      sellerPhone: '+91 99887 76655',
      sellerCity: 'Bangalore',
      sellerEmail: 'bangalore@yechalegi.com',
    };
    const { res, data } = await req('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(payload),
    });
    if (res.status === 201 && data._id) {
      createdCarId = data._id;
      pass('Admin creates car with full specs', `ID=${createdCarId}, ${data.company} ${data.model}, ₹${data.price}`);
    } else {
      fail('Admin create car', JSON.stringify(data));
    }
  }

  // ── CARS: Validation — negative price ──
  {
    const { res, data } = await req('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ company: 'Bad', model: 'Car', price: -100, year: 2024, fuelType: 'Petrol', transmission: 'Manual', kmDriven: 1000, description: 'Test', imageUrl: 'https://example.com/img.jpg' }),
    });
    res.status === 400
      ? pass('Negative price rejected', data?.error)
      : fail('Negative price validation', `status=${res.status}`);
  }

  // ── CARS: Validation — invalid year ──
  {
    const { res, data } = await req('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ company: 'Bad', model: 'Car', price: 100000, year: 1800, fuelType: 'Petrol', transmission: 'Manual', kmDriven: 1000, description: 'Test', imageUrl: 'https://example.com/img.jpg' }),
    });
    res.status === 400
      ? pass('Invalid year rejected', data?.error)
      : fail('Invalid year validation', `status=${res.status}`);
  }

  // ── CARS: Validation — invalid fuel type ──
  {
    const { res, data } = await req('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ company: 'Bad', model: 'Car', price: 100000, year: 2024, fuelType: 'Nuclear', transmission: 'Manual', kmDriven: 1000, description: 'Test', imageUrl: 'https://example.com/img.jpg' }),
    });
    res.status === 400
      ? pass('Invalid fuel type rejected', data?.error)
      : fail('Invalid fuel type', `status=${res.status}`);
  }

  // ── CARS: Admin update car ──
  {
    const { res, data } = await req(`/api/cars/${createdCarId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ price: 1390000, offerTag: 'Festive Offer', offerDiscount: '₹60,000 off' }),
    });
    res.status === 200 && data.price === 1390000
      ? pass('Admin update car price & offer', `new price=₹${data.price}, tag=${data.offerTag}`)
      : fail('Admin update car', JSON.stringify(data));
  }

  // ── CARS: Status patch ──
  {
    const { res, data } = await req(`/api/cars/${createdCarId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'pending' }),
    });
    res.status === 200 && data.status === 'pending'
      ? pass('Status patch to pending', data.status)
      : fail('Status patch', JSON.stringify(data));
  }

  // ── CARS: Customer inquiry/booking ──
  {
    const { res, data } = await req(`/api/cars/${createdCarId}/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test Buyer',
        phone: '+91 9876543210',
        message: 'Interested in booking this Nexon EV. Please call tomorrow morning.',
      }),
    });
    res.status === 201
      ? pass('Customer inquiry/booking submitted', data?.message)
      : fail('Customer inquiry', `status=${res.status} ${JSON.stringify(data)}`);
  }

  // ── CARS: Inquiry missing fields ──
  {
    const { res, data } = await req(`/api/cars/${createdCarId}/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'No Phone' }),
    });
    res.status === 400
      ? pass('Inquiry missing phone rejected', data?.error)
      : fail('Inquiry validation', `status=${res.status}`);
  }

  // ── CARS: Add review (no auth required!) ──
  {
    const { res, data } = await req(`/api/cars/${createdCarId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Anonymous', rating: 5, comment: 'Great car!' }),
    });
    if (res.status === 201) {
      warn('Reviews accept unauthenticated POST', 'Anyone can spam reviews without login');
    } else {
      pass('Review requires auth', `status=${res.status}`);
    }
  }

  // ── CARS: Verify inquiry saved on car ──
  {
    const { res, data } = await req(`/api/cars/${createdCarId}`);
    const hasInquiry = data?.inquiries?.some(i => i.name === 'E2E Test Buyer');
    hasInquiry
      ? pass('Inquiry persisted on car document', `${data.inquiries.length} inquiries`)
      : fail('Inquiry persistence', 'inquiry not found on car');
  }

  // ── SECURITY: JWT in response doesn't leak password ──
  {
    const { data } = await req('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const respStr = JSON.stringify(data);
    !respStr.includes(ADMIN_PASSWORD) && !respStr.includes('password')
      ? pass('Login response does not leak password')
      : fail('Password leak in login response', 'password visible in response');
  }

  // ── SECURITY: NoSQL injection attempt ──
  {
    const { res, data } = await req('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: { $gt: '' }, password: { $gt: '' } }),
    });
    res.status === 400 || res.status === 401
      ? pass('NoSQL injection attempt blocked', `status=${res.status}`)
      : fail('NoSQL injection', `status=${res.status} — may have succeeded!`);
  }

  // ── 404 handler ──
  {
    const { res, data } = await req('/api/nonexistent');
    res.status === 404
      ? pass('Unknown endpoint returns 404', data?.error)
      : fail('404 handler', `status=${res.status}`);
  }

  // ── RATE LIMITING (light test — 5 rapid auth attempts should not block) ──
  {
    let blocked = false;
    for (let i = 0; i < 5; i++) {
      const { res } = await req('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@test.com', password: 'wrong' }),
      });
      if (res.status === 429) blocked = true;
    }
    !blocked
      ? pass('Rate limiter allows 5 rapid attempts (limit is 30/15min)')
      : warn('Rate limiter triggered after 5 attempts', 'May be too aggressive for dev');
  }

  // ── CLEANUP: Delete test car ──
  {
    const { res, data } = await req(`/api/cars/${createdCarId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    res.status === 200
      ? pass('Admin delete test car (cleanup)', data?.message)
      : fail('Admin delete test car', `status=${res.status}`);
  }

  // ── PRINT RESULTS ──
  console.log('\n=== TEST RESULTS ===\n');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} [${r.status}] ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
  }

  console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed, ${warnings} warnings ===`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
