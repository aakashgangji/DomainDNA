import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const ProductCard = ({ productInfo }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);

  return (
    <div className="flex flex-row space-x-4 bg-base-100/50 rounded-lg max-w-6xl shadow-md min-w-max text-white">
      <div className="basis-2/6 p-6">
        <h2 className="text-2xl font-bold mb-4 text-primary min-h-12">Products</h2>
        <ul>
          {productInfo.map((product, index) => (
            <div key={index} className='btn btn-outline w-full text-wrap btn-primary mt-5' onClick={() => setSelectedProduct(product)}>{product.name}</div>
          ))}
        </ul>
      </div>

      {selectedProduct && (
        <div className="basis-4/6 p-6">
          <h2 className="text-2xl font-bold mb-4 text-wrap min-h-12">{selectedProduct.name} Domains</h2>
          <ul>
            {selectedProduct.domains.map((domain, index) => (
              <li key={index}>
                <div className="collapse collapse-arrow bg-base-100/75 mt-5">
                    <input type="checkbox" name="my-accordion-2" defaultChecked />
                    <div className="collapse-title text-xl font-medium">{domain.name}</div>
                    <div className="collapse-content">
                        <div className="mt-2 ml-4">
                          <div className="p-4">
                            <p className="font-bold mb-2">Status: <span className="text-primary">{domain.status}</span></p>
                            <p className="font-bold mb-2">Haunted/Illegal: <span className="text-error">{domain.haunted_illegal}</span></p>

                            <div className="mb-2 max-w-3xl">
                              <p className="font-bold">Offering:</p>
                              <div className="flex flex-wrap gap-2">
                                {domain.offering.split(',').map((offering: string, index: number) => (
                                  <span key={index} className="badge badge-outline badge-primary">{offering.trim()}</span>
                                ))}
                              </div>
                            </div>



                            <div>
                              <p className="font-bold mb-2">Description:</p>
                              <div className="prose max-w-md">
                                <ReactMarkdown>{domain.description}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
