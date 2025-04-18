// src/components/CollapsiblePanel.jsx
import React, { useState } from 'react';

const CollapsiblePanel = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-t flex justify-between items-center"
            >
                <span>{title}</span>
                <span>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && <div className="p-4 bg-white dark:bg-gray-900">{children}</div>}
        </div>
    );
};

export default CollapsiblePanel;
