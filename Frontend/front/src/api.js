import axios from 'axios';

// 1. Axios Instance with Timeout
const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  timeout: 10000, // 10 seconds
});

// 2. Circuit Breaker State
const circuitBreaker = {
  illegalActivity: {
    isOpen: false,
    lastFailure: 0,
    resetTimeout: 30000, // 30 seconds
  },
  domainOffering: {
    isOpen: false,
    lastFailure: 0,
    resetTimeout: 30000,
  },
};

// 3. Helper: Check Circuit Breaker Status
function checkCircuitBreaker(endpoint) {
  const now = Date.now();
  if (circuitBreaker[endpoint].isOpen) {
    if (now - circuitBreaker[endpoint].lastFailure > circuitBreaker[endpoint].resetTimeout) {
      circuitBreaker[endpoint].isOpen = false; // Reset after timeout
    } else {
      throw new Error(`Service temporarily unavailable for ${endpoint}. Try again later.`);
    }
  }
}

// 4. Helper: Retry with Exponential Backoff
async function withRetries(fn, args, maxRetries = 3) {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error;
      retries++;
      if (retries >= maxRetries) break;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries))); // Exponential backoff
    }
  }

  throw lastError; // Throw the last error after max retries
}

// 5. Helper: Validate Inputs
function validateDomainName(domainName) {
  if (!domainName || typeof domainName !== 'string' || !domainName.includes('.')) {
    throw new Error('Invalid domain name format');
  }
}

// --- API Functions ---

// A. Suggest Product Names (No retries needed)
export async function suggestProductNames(description) {
  if (!description?.trim()) throw new Error('Description cannot be empty');
  
  try {
    const response = await api.post('/product-names', { description });
    return response.data;
  } catch (error) {
    console.error('Product suggestion failed:', {
      error: error.message,
      request: { description },
      response: error.response?.data,
    });
    throw error;
  }
}

// B. Suggest Domain Names (No retries needed)
export async function suggestDomainNames(productName) {
  if (!productName?.trim()) throw new Error('Product name cannot be empty');
  
  try {
    const response = await api.post('/domain-names', { product_name: productName });
    return response.data;
  } catch (error) {
    console.error('Domain suggestion failed:', {
      error: error.message,
      request: { productName },
      response: error.response?.data,
    });
    throw error;
  }
}

// C. Check Illegal Activity (With Circuit Breaker + Retries)
export async function checkIllegalActivity(domainName) {
  validateDomainName(domainName);
  checkCircuitBreaker('illegalActivity');

  try {
    const response = await withRetries(
      api.post,
      ['/domain-research/illegal-activity', { 
        domain_name: domainName, 
        need_detailed_report: false 
      }]
    );
    return response.data;
  } catch (error) {
    console.error('Illegal activity check failed:', {
      error: error.message,
      domain: domainName,
    });
    circuitBreaker.illegalActivity.isOpen = true;
    circuitBreaker.illegalActivity.lastFailure = Date.now();
    throw new Error(`Cannot check illegal activity. ${error.message}`);
  }
}

// D. Check Domain Offerings (With Circuit Breaker + Retries)
export async function checkDomainOffering(domainName) {
  validateDomainName(domainName);
  checkCircuitBreaker('domainOffering');

  try {
    const response = await withRetries(
      api.post,
      ['/domain-research/offering', { domain_name: domainName }]
    );
    return response.data;
  } catch (error) {
    console.error('Domain offering check failed:', {
      error: error.message,
      domain: domainName,
    });
    circuitBreaker.domainOffering.isOpen = true;
    circuitBreaker.domainOffering.lastFailure = Date.now();
    throw new Error(`Cannot check domain history. ${error.message}`);
  }
}

// E. Check Domain Availability (Simple request)
export async function checkDomainAvailability(domainName) {
  validateDomainName(domainName);

  try {
    const response = await api.post('/domain-availability', { domain_name: domainName });
    return response.data;
  } catch (error) {
    console.error('Availability check failed:', {
      error: error.message,
      domain: domainName,
      response: error.response?.data,
    });
    throw new Error(`Cannot check availability. ${error.message}`);
  }
}
