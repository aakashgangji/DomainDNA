import React from 'react';
import { Card, Badge } from 'react-daisyui';

const DomainCard = ({ domainInfo }) => {
  return (
    <Card className="bg-base-100 shadow-xl max-w-md mx-auto">
      <Card.Body>
        <Card.Title tag="h2" className="text-2xl font-bold">
          {domainInfo.domain}
        </Card.Title>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Status:</span>{' '}
            <Badge color="primary">{domainInfo.status}</Badge>
          </p>
          <p>
            <span className="font-semibold">Haunted/Illegal:</span>{' '}
            <Badge color={domainInfo.haunted_illegal === 'Yes' ? 'error' : 'success'}>
              {domainInfo.haunted_illegal}
            </Badge>
          </p>
          <p>
            <span className="font-semibold">Offering:</span>{' '}
            <Badge color="secondary">{domainInfo.offering}</Badge>
          </p>
          <p>
            <span className="font-semibold">Description:</span>{' '}
            {domainInfo.description}
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DomainCard;