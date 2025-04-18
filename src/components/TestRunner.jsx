import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Editor from '@monaco-editor/react';

const TestRunner = ({ testCode, componentCode }) => {
    const [output, setOutput] = useState('');

    const handleRun = () => {
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));

        try {
            // Inject component code into the scope
            const scope = `
        ${componentCode}
        ${testCode}
      `;
            eval(scope);
            logs.push('✅ Tests executed successfully.');
        } catch (err) {
            logs.push(`❌ Error: ${err.message}`);
        }

        console.log = originalLog;
        setOutput(logs.join('\n'));
    };

    return (
        <div className="mt-4">
            <button
                onClick={handleRun}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
                Run Test Stub
            </button>
            <div className="mt-2 bg-black text-green-400 font-mono p-3 rounded whitespace-pre-wrap h-48 overflow-y-auto">
                {output}
            </div>
        </div>
    );
};

export default TestRunner;
