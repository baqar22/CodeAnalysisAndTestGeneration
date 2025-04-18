import React from 'react';

const getBadgeColor = (type) => {
    switch (type) {
        case 'deprecated':
            return 'bg-red-500 text-white';
        case 'warning':
            return 'bg-yellow-400 text-black';
        case 'modern':
            return 'bg-green-500 text-white';
        default:
            return 'bg-gray-300 text-black';
    }
};

const ASTInsightPanel = ({ insights }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">🧩 AST Insights</h3>
            <ul className="space-y-2">
                {insights.map((insight, index) => (
                    <li
                        key={index}
                        className={`text-sm p-2 rounded shadow ${getBadgeColor(insight.type)}`}
                    >
                        <span className="font-mono">{insight.label}</span> — {insight.type}
                        <div className="font-mono">{`Line Number: ${insight.line}`} — {`Status: ${insight.status}`} </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ASTInsightPanel;
