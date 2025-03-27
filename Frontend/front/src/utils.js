
export const validate_domain_or_product = (searchTerm) => {
    // Simple domain validation regex
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    const isDomain = domainRegex.test(searchTerm);
    
    // Assume it's a product if it's not a domain and has at least 3 characters
    const isProduct = !isDomain && searchTerm.length >= 3;
  
    return [isDomain, isProduct];
  };
  
  export const getDomainDetails = (domain) => {
    // This is a mock function. In a real application, you would fetch this data from an API or database.
    return {
      domain: domain,
      status: 'Active',
      haunted_illegal: 'Not haunted',
      offering: 'Previously used for e-commerce',
      description: 'This domain has a clean history and is ready for use.'
    };
  };
  
  export const getProductDetails = (product) => {
    // This is a mock function. In a real application, you would fetch this data from an API or database.
    return [
      {
        name: product,
        domains: [
          {
            name: `${product.toLowerCase()}.com`,
            status: 'Available',
            haunted_illegal: 'Not haunted',
            offering: 'Never used before',
            description: 'Prime domain name for this product.'
          },
          {
            name: `buy${product.toLowerCase()}.com`,
            status: 'Taken',
            haunted_illegal: 'Potentially haunted',
            offering: 'Previously used for a failed startup',
            description: 'This domain has a troubled history.'
          }
        ]
      }
    ];
  };