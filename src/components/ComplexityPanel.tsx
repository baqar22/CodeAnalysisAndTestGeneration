import React from 'react';

const ComplexityPanel = ({ score }: { score: number }) => {
    const getColor = (score: number) => {
        if (score <= 3) return 'text-green-600';
        if (score <= 7) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white border rounded p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">🧠Complexity Score</h3>
            <p className={`text-lg font-bold ${getColor(score)}`}>
                {score && `${score} / 10`}
            </p>
            <p className="text-sm mt-1 text-gray-500">
                Based on nesting and number of functions
            </p>
        </div>
    );
};

export default ComplexityPanel;
