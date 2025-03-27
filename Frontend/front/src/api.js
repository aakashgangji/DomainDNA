import axios from 'axios';

// Create an instance of axios with a base URL
const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',  
});

// Function to suggest product names based on product description
export async function suggestProductNames(description) {
  try {
    const response = await api.post('/product-names', {
      description: description
    });
    console.log('Suggested Product Names:', response.data);
    return response.data;  // Array of objects with product_name property
  } catch (error) {
    console.error('Error suggesting product names:', error.response?.data || error.message);
    throw error;  // Re-throw the error to handle it in the calling function
  }
}

// Function to suggest domain names based on product name
export async function suggestDomainNames(productName) {
  try {
    const response = await api.post('/domain-names', {
      product_name: productName
    });
    console.log('Suggested Domain Names:', response.data);
    return response.data;  // Array of objects with domain_name and available properties
  } catch (error) {
    console.error('Error suggesting domain names:', error.response?.data || error.message);
    throw error;  // Re-throw the error to handle it in the calling function
  }
}

// Function to check illegal activity for a domain name
export async function checkIllegalActivity(domainName) {
  try {
    const response = await api.post('/domain-research/illegal-activity', {
      domain_name: domainName, need_detailed_report: false
    });
    console.log('Illegal Activity Check:', response.data);
    return response.data;  // Object with illegal_activity boolean and optional details string
  } catch (error) {
    console.error('Error checking illegal activity:', error.response?.data || error.message);
    throw error;  // Re-throw the error to handle it in the calling function
  }
}

// Function to check past offerings of a domain name
export async function checkDomainOffering(domainName) {
  try {
    const response = await api.post('/domain-research/offering', {
      domain_name: domainName
    });
    console.log('Domain Offerings:', response.data);
    return response.data;  // Object with domain_name and use_case properties
  } catch (error) {
    console.error('Error checking domain offerings:', error.response?.data || error.message);
    throw error;  // Re-throw the error to handle it in the calling function
  }
}

// Function to check domain name availability
export async function checkDomainAvailability(domainName) {
  try {
    const response = await api.post('/domain-availability', {
      domain_name: domainName
    });
    console.log('Domain Availability:', response.data);
    return response.data;  // Object with available boolean
  } catch (error) {
    console.error('Error checking domain availability:', error.response?.data || error.message);
    throw error;  // Re-throw the error to handle it in the calling function
  }
}