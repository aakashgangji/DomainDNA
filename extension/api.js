import axios from 'axios';

// Create an instance of axios with a base URL
const api = axios.create({
  baseURL: 'http://localhost:8081/',  // Replace this with the actual base URL of your API
  timeout: 5000,  // Optional: Set a timeout of 5 seconds for requests
});

// Function to suggest product names based on product description
/**
 * Suggests product names based on a given product description.
 * 
 * @param {string} description - The product description.
 * @returns {Promise<Array<{ product_name: string }>>} - List of suggested product names.
 */
export async function suggestProductNames(description) {
  try {
    const response = await api.post('/product-names', {
      description: description
    });
    console.log('Suggested Product Names:', response.data);
    return response.data;  // Array of objects with product_name property
  } catch (error) {
    console.error('Error suggesting product names:', error.response?.data || error.message);
  }
}

// Function to suggest domain names based on product name
/**
 * Suggests domain names based on a given product name.
 * 
 * @param {string} productName - The product name.
 * @returns {Promise<Array<{ domain_name: string, available: boolean }>>} - List of suggested domain names and availability.
 */
export async function suggestDomainNames(productName) {
  try {
    const response = await api.post('/domain-names', {
      product_name: productName
    });
    console.log('Suggested Domain Names:', response.data);
    return response.data;  // Array of objects with domain_name and available properties
  } catch (error) {
    console.error('Error suggesting domain names:', error.response?.data || error.message);
  }
}

// Function to check illegal activity for a domain name
/**
 * Checks if any illegal activities are associated with the domain name.
 * 
 * @param {string} domainName - The domain name to check.
 * @returns {Promise<{ illegal_activity: boolean, details?: string }>} - Result of the illegal activity check with optional details.
 */
export async function checkIllegalActivity(domainName) {
  try {
    const response = await api.post('/domain-research/illegal-activity', {
      domain_name: domainName
    });
    console.log('Illegal Activity Check:', response.data);
    return response.data;  // Object with illegal_activity boolean and optional details string
  } catch (error) {
    console.error('Error checking illegal activity:', error.response?.data || error.message);
  }
}

// Function to check past offerings of a domain name
/**
 * Retrieves past offerings or use cases associated with a domain name.
 * 
 * @param {string} domainName - The domain name to check.
 * @returns {Promise<{ domain_name: string, use_case: Array<string> }>} - Object with domain name and list of previous use cases or offerings.
 */
export async function checkDomainOffering(domainName) {
  try {
    const response = await api.post('/domain-research/offering', {
      domain_name: domainName
    });
    console.log('Domain Offerings:', response.data);
    return response.data;  // Array of objects with domain_name and use_case properties
  } catch (error) {
    console.error('Error checking domain offerings:', error.response?.data || error.message);
  }
}

// Function to check domain name availability
/**
 * Checks if the domain name is available for purchase.
 * 
 * @param {string} domainName - The domain name to check.
 * @returns {Promise<{ available: boolean }>} - Availability status of the domain.
 */
export async function checkDomainAvailability(domainName) {
  try {
    const response = await api.post('/domain-availability', {
      domain_name: domainName
    });
    console.log('Domain Availability:', response.data);
    return response.data;  // Object with available boolean
  } catch (error) {
    console.error('Error checking domain availability:', error.response?.data || error.message);
  }
}