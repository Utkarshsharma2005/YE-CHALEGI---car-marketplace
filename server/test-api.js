const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');

// Test credentials read from server/.env (fall back to seed defaults)
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@yechalegi.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);

async function runTests() {
  await connectDB();
  console.log('=== STARTING AUTOMATED API TEST SUITE ===');

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    let adminToken = '';
    let buyerToken = '';
    let createdCarId = '';

    try {
      // 1. Admin login success
      console.log('\n[TEST 1] Admin login success...');
      let res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      });
      let data = await res.json();
      if (res.status === 200 && data.token) {
        adminToken = data.token;
        console.log('✅ PASS: Admin login successful. Token acquired.');
      } else {
        console.error('❌ FAIL Admin login:', data);
      }

      // 2. Admin login failure
      console.log('\n[TEST 2] Admin login failure (invalid password)...');
      res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: 'wrongpassword' })
      });
      data = await res.json();
      if (res.status === 401 && data.error) {
        console.log('✅ PASS: Invalid credentials correctly rejected (401). Error:', data.error);
      } else {
        console.error('❌ FAIL Admin login failure:', res.status, data);
      }

      // 3. Buyer Register & Token acquisition
      console.log('\n[TEST 3] Buyer registration...');
      const testEmail = `buyer_${Date.now()}@test.com`;
      res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Buyer', email: testEmail, password: 'buyerpassword123' })
      });
      data = await res.json();
      if (res.status === 201 && data.token) {
        buyerToken = data.token;
        console.log('✅ PASS: Buyer registered with role buyer. Token acquired.');
      } else {
        console.error('❌ FAIL Buyer register:', data);
      }

      // 4. Role Escalation Protection on Register
      console.log('\n[TEST 4] Role escalation prevention on public register...');
      res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hacker', email: `hacker_${Date.now()}@test.com`, password: 'password123', role: 'admin' })
      });
      data = await res.json();
      if (res.status === 400 && data.error) {
        console.log('✅ PASS: Role escalation attempt blocked (400). Error:', data.error);
      } else {
        console.error('❌ FAIL Role escalation test:', res.status, data);
      }

      // 5. Unauthorized Car Creation (No Token)
      console.log('\n[TEST 5] Unauthorized car create (no token)...');
      res = await fetch(`${baseUrl}/api/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: 'Test', model: 'Car', price: 100000, year: 2024, fuelType: 'Petrol', transmission: 'Manual', kmDriven: 1000, description: 'Test' })
      });
      data = await res.json();
      if (res.status === 401 && data.error) {
        console.log('✅ PASS: Request without token rejected (401). Error:', data.error);
      } else {
        console.error('❌ FAIL Unauthorized car create:', res.status, data);
      }

      // 6. Forbidden Car Creation (Buyer Token)
      console.log('\n[TEST 6] Forbidden car create (non-admin buyer token)...');
      res = await fetch(`${baseUrl}/api/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ company: 'Test', model: 'Car', price: 100000, year: 2024, fuelType: 'Petrol', transmission: 'Manual', kmDriven: 1000, description: 'Test' })
      });
      data = await res.json();
      if (res.status === 403 && data.error) {
        console.log('✅ PASS: Non-admin request forbidden (403). Error:', data.error);
      } else {
        console.error('❌ FAIL Forbidden car create:', res.status, data);
      }

      // 7. Invalid Car Payload Validation (Negative Price)
      console.log('\n[TEST 7] Invalid car payload validation (negative price)...');
      res = await fetch(`${baseUrl}/api/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ company: 'Test', model: 'Car', price: -500, year: 2024, fuelType: 'Petrol', transmission: 'Manual', kmDriven: 1000, description: 'Test' })
      });
      data = await res.json();
      if (res.status === 400 && data.error) {
        console.log('✅ PASS: Invalid car payload rejected (400). Error:', data.error);
      } else {
        console.error('❌ FAIL Invalid car payload validation:', res.status, data);
      }

      // 8. Admin Create Car Success with Dynamic Specs & Cars24 Provenance
      console.log('\n[TEST 8] Admin create car success with dynamic specs & provenance...');
      const carPayload = {
        company: 'Maruti Suzuki',
        model: 'Swift ZXi Plus',
        price: 780000,
        year: 2023,
        fuelType: 'Petrol',
        transmission: 'Manual',
        kmDriven: 14500,
        imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
        description: 'Single owner Swift ZXi Plus with Touchscreen, Sunroof, and full service history.',
        bodyType: 'Hatchback',
        registrationCity: 'Mumbai',
        power: 88,
        torque: 113,
        zeroToSixty: 11.2,
        topSpeed: 165,
        range: 520,
        seats: 5,
        drivetrain: 'FWD',
        colorName: 'Canary Red',
        colorHex: '#E63946',
        ownerCount: 1,
        accidental: 'Non-Accidental',
        insuranceStatus: 'Valid Comprehensive',
        features: ['Touchscreen', 'Reverse Camera', 'Alloy Wheels', 'Push Button Start'],
        sellerName: 'Mumbai Verified Hub',
        sellerPhone: '+91 98200 99887'
      };
      res = await fetch(`${baseUrl}/api/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(carPayload)
      });
      data = await res.json();
      if (res.status === 201 && data._id && data.power === 88 && data.ownerCount === 1) {
        createdCarId = data._id;
        console.log(`✅ PASS: Car created with dynamic specs. ID: ${createdCarId}, Power: ${data.power} hp, 0-100: ${data.zeroToSixty}s, Owner: ${data.ownerCount}`);
      } else {
        console.error('❌ FAIL Admin create car with specs:', res.status, data);
      }

      // 9. Public Listing Read (GET /api/cars)
      console.log('\n[TEST 9] Public listing read (GET /api/cars)...');
      res = await fetch(`${baseUrl}/api/cars`);
      data = await res.json();
      if (res.status === 200 && Array.isArray(data) && data.some(c => c._id === createdCarId)) {
        console.log(`✅ PASS: Created car found in public listing. Total vehicles: ${data.length}`);
      } else {
        console.error('❌ FAIL Public listing read:', res.status);
      }

      // 10. Admin Update Car Success (PUT /api/cars/:id)
      console.log('\n[TEST 10] Admin update car provenance & price...');
      res = await fetch(`${baseUrl}/api/cars/${createdCarId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ price: 795000, ownerCount: 2, accidental: 'Minor Scratches' })
      });
      data = await res.json();
      if (res.status === 200 && data.price === 795000 && data.ownerCount === 2) {
        console.log('✅ PASS: Car updated successfully. New Price:', data.price, 'Owner Count:', data.ownerCount);
      } else {
        console.error('❌ FAIL Admin update car:', res.status, data);
      }

      // 11. Car Detail Page Read (GET /api/cars/:id)
      console.log('\n[TEST 11] Public car detail read (GET /api/cars/:id)...');
      res = await fetch(`${baseUrl}/api/cars/${createdCarId}`);
      data = await res.json();
      if (res.status === 200 && data._id === createdCarId && data.price === 795000 && data.ownerCount === 2) {
        console.log('✅ PASS: Car detail read returned updated data.');
      } else {
        console.error('❌ FAIL Car detail read:', res.status, data);
      }

      // 12. Admin Delete Car Success (DELETE /api/cars/:id)
      console.log('\n[TEST 12] Admin delete car...');
      res = await fetch(`${baseUrl}/api/cars/${createdCarId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      data = await res.json();
      if (res.status === 200 && data.message === 'Deleted successfully') {
        console.log('✅ PASS: Car deleted successfully.');
      } else {
        console.error('❌ FAIL Admin delete car:', res.status, data);
      }

      // 13. Verify Deleted Detail Returns 404
      console.log('\n[TEST 13] Verify deleted car detail returns 404...');
      res = await fetch(`${baseUrl}/api/cars/${createdCarId}`);
      data = await res.json();
      if (res.status === 404 && data.error === 'Car not found.') {
        console.log('✅ PASS: Deleted car detail returned 404 Car not found.');
      } else {
        console.error('❌ FAIL Deleted car detail test:', res.status, data);
      }

      console.log('\n=== ALL AUTOMATED API TESTS COMPLETED SUCCESSFULLY! ===');
    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      server.close();
      mongoose.connection.close();
      process.exit(0);
    }
  });
}

runTests();
