// components/InsightBadge.jsx
import React from 'react';

const statusColors = {
    modern: 'bg-green-200 text-green-800',
    outdated: 'bg-yellow-200 text-yellow-800',
    deprecated: 'bg-red-200 text-red-800',
};

const InsightBadge = ({ label, status }) => (
    <div className={`rounded px-3 py-1 my-1 text-sm font-medium ${statusColors[status]}`}>
        {label}
    </div>
);

export default InsightBadge;
