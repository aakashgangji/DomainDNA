import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Logo from './assets/Logo';
import SearchIcon from './assets/SearchIcon';
import ProductCard from './components/ProductCard';
import {
  suggestProductNames,
  suggestDomainNames,
  checkDomainOffering,
  checkIllegalActivity,
  checkDomainAvailability
} from './api';

const HauntedDomainChecker = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setError(null);
  };

  const getFallbackDomains = (productName) => {
    const cleanName = productName.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    return [
      { domain_name: `${cleanName}.com`, available: false },
      { domain_name: `get${cleanName}.com`, available: false },
      { domain_name: `${cleanName}app.com`, available: false }
    ];
  };

  const processSingleDomain = async (domain, isProductSearch = false) => {
    try {
      // For product searches, we only care about availability
      if (isProductSearch) {
        const availability = await checkDomainAvailability(domain);
        if (!availability.available) return null;
        
        return {
          name: domain,
          status: 'Available',
          haunted_illegal: 'No',
          offering: 'Clean domain',
          description: 'This domain is available and has no known issues',
          isFallback: false
        };
      }

      // For direct domain searches, get full details
      const [offering, illegalActivity, availability] = await Promise.all([
        checkDomainOffering(domain).catch(() => ({ use_case: [] })),
        checkIllegalActivity(domain).catch(() => ({
          illegal_activity: false,
          details: "Legal status could not be verified"
        })),
        checkDomainAvailability(domain)
      ]);

      return {
        name: domain,
        status: availability.available ? 'Available' : 'Unavailable',
        haunted_illegal: illegalActivity.illegal_activity ? 'Yes' : 'No',
        offering: offering.use_case.join(', ') || 'No history found',
        description: illegalActivity.details,
        isFallback: false
      };
    } catch (err) {
      console.error(`Error processing domain ${domain}:`, err);
      return isProductSearch ? null : {
        name: domain,
        status: 'Check failed',
        haunted_illegal: 'Unknown',
        offering: 'Data unavailable',
        description: 'Could not verify domain details',
        isFallback: true
      };
    }
  };

  const processProduct = async (product) => {
    try {
      let domainNames;
      try {
        domainNames = await suggestDomainNames(product.product_name);
      } catch (err) {
        console.warn('Using fallback domains for:', product.product_name);
        domainNames = getFallbackDomains(product.product_name);
      }

      // Process domains and filter out unavailable ones
      const domainsWithDetails = await Promise.all(
        domainNames.slice(0, 5).map(domain => 
          processSingleDomain(domain.domain_name, true)
      ));
      
      const availableDomains = domainsWithDetails.filter(Boolean);
      
      return {
        name: product.product_name,
        domains: availableDomains.length > 0 ? availableDomains : [{
          name: 'No available domains found',
          status: 'Unavailable',
          haunted_illegal: 'N/A',
          offering: 'Try different keywords',
          description: 'All suggested domains are taken',
          isFallback: true
        }]
      };
    } catch (err) {
      console.error(`Error processing product ${product.product_name}:`, err);
      return {
        name: product.product_name,
        domains: [{
          name: 'Domain check failed',
          status: 'Error',
          haunted_illegal: 'Unknown',
          offering: 'Try again later',
          description: 'Could not check domain availability',
          isFallback: true
        }]
      };
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a domain or product description');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const domainRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/;
      const isDomain = domainRegex.test(searchTerm);

      if (isDomain) {
        const extractedDomain = searchTerm.replace(domainRegex, '$3');
        const domainDetails = await processSingleDomain(extractedDomain);
        setSearchResult([{ 
          name: extractedDomain, 
          domains: [domainDetails] 
        }]);
      } else {
        const productNames = await suggestProductNames(searchTerm);
        const products = await Promise.all(
          productNames.slice(0, 3).map(processProduct)
        );
        setSearchResult(products);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.response?.data?.message || err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-t from-black to-black opacity-95">
      <div className="container pt-5 mx-auto max-w-6xl min-h-screen justify-items-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://static.vecteezy.com/system/resources/previews/049/513/630/non_2x/moody-dark-clouds-on-black-background-cut-out-transparent-png.png')] bg-repeat opacity-[0.49] filter blur-[20px] z-0 animate-[moveClouds_30s_linear_infinite]">
        </div>
        <div className="content max-w-3xl relative z-10">
          <div className="logo max-w-2xl">
            <Logo />
            <div className="mb-10 text-center text-xl text-white">
              <p className='drop-shadow'>Welcome to the Haunted Domain Checker!</p>
              <p>Is your domain cursed? Find out now!</p>
            </div>
          </div>
          
          <div className="searchWrapper max-w-3xl">
            <form onSubmit={handleSubmit} className={`searchContainer ${isFocused ? 'focused' : ''}`}>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Enter a domain or product to check..."
                className="input"
                onFocus={() => setIsFocused(true)}
                aria-label="Search"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="iconContainer" 
                aria-label="Check domain"
                disabled={loading}
              >
                <SearchIcon />
              </button>
            </form>
            {isFocused && <div className="glow" />}
          </div>

          {loading && (
            <div className="flex justify-center items-center h-24">
              <div className="w-16 h-16 border-8 border-dashed border-gray-200 rounded-full animate-spin border-t-primary"></div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 text-red-400 bg-red-900/20 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {searchResult && !loading && (
            <div className="mt-8 max-w-2xl min-w-full justify-items-center">
              <ProductCard key='product-card' productInfo={searchResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HauntedDomainChecker;
