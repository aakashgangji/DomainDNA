import React from 'react';

const ResultCard = ({ title, data }) => {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] border-2 border-[#4a4a4a] rounded-lg p-4 mb-4 text-white relative z-10">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {title === "Domain Status" ? (
        <p className={`text-lg ${data === 'Available' ? 'text-green-500' : 'text-red-500'}`}>
          {data}
        </p>
      ) : Array.isArray(data) ? (
        <ul className="list-disc list-inside">
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{data}</p>
      )}
    </div>
  );
};

export default ResultCard;