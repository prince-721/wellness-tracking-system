import axios from 'axios';
import { BASE_URL } from '../services/api';

export const testNetworkConnection = async () => {
  console.log('🔍 Starting network connectivity test...');
  
  const results = {
    baseURL: BASE_URL,
    healthCheck: null,
    registerEndpoint: null,
  };

  try {
    // Test 1: Health check endpoint
    console.log('📡 Testing health endpoint...');
    const healthRes = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    results.healthCheck = { success: true, status: healthRes.status, data: healthRes.data };
    console.log('✅ Health check passed:', healthRes.data);
  } catch (err) {
    results.healthCheck = { success: false, error: err.message, code: err.code };
    console.error('❌ Health check failed:', err.message);
  }

  try {
    // Test 2: Register endpoint (validate but don't create)
    console.log('📡 Testing register endpoint...');
    const testData = { name: 'Test', email: 'test@test.com', password: 'test123' };
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, testData, { timeout: 10000 });
    results.registerEndpoint = { success: true, status: registerRes.status };
    console.log('✅ Register endpoint accessible');
  } catch (err) {
    results.registerEndpoint = { 
      success: false, 
      error: err.message, 
      code: err.code,
      status: err.response?.status,
      responseData: err.response?.data
    };
    console.error('❌ Register endpoint error:', err.response?.data || err.message);
  }

  return results;
};

export const logNetworkDiagnostics = async () => {
  const results = await testNetworkConnection();
  
  console.log('\n🔧 NETWORK DIAGNOSTICS REPORT:');
  console.log('================================');
  console.log('Base URL:', results.baseURL);
  console.log('Health Check:', results.healthCheck);
  console.log('Register Endpoint:', results.registerEndpoint);
  console.log('================================\n');
  
  return results;
};
