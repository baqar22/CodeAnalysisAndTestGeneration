import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import generateSummary from './azureOpenAI';

const TestStubPanel = ({ refactoredCode }) => {
    const [testStub, setTestStub] = useState('');
    const [filename, setFilename] = useState('');
    const [enhancing, setEnhancing] = useState(false);
    const [testOutput, setTestOutput] = useState('');
    const [loadingTests, setLoadingTests] = useState(false);
    const testRootRef = useRef(null);

    const handleGenerateStub = () => {
        const match =
            refactoredCode.match(/export\s+default\s+function\s+(\w+)/) ||
            refactoredCode.match(/const\s+(\w+)\s*=\s*\(?.*?\)?\s*=>/) ||
            refactoredCode.match(/function\s+(\w+)\s*\(/) ||
            refactoredCode.match(/class\s+(\w+)\s+extends\s+React\.Component/);

        const componentName = match?.[1] || 'MyComponent';

        const initialStub = `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

describe('${componentName} component', () => {
  test('renders without crashing', () => {
    render(<${componentName} />);
    // Add assertions here
    // Example: expect(screen.getByText(/some text/i)).toBeInTheDocument();
  });
});
`;

        setFilename(`${componentName}.test.jsx`);
        setTestStub(initialStub);
        setTestOutput('');
    };

    const handleEnhanceWithAI = async () => {
        setEnhancing(true);
        try {
            const prompt = `
                You're a professional React testing engineer. Use the following component and its initial test to generate more comprehensive tests.
                
                ### Component Code:
                \`\`\`jsx
                ${refactoredCode}
                \`\`\`
                
                ### Original Test Code:
                \`\`\`jsx
                ${testStub}
                \`\`\`
                
                Respond with the improved test code only.
                `;
            const result = await generateSummary(refactoredCode, prompt, 'AI Enhanced Test Stub');
            const cleanedContent = result.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
            setTestStub(cleanedContent);
        } catch (err) {
            console.error('AI enhancement failed:', err);
        } finally {
            setEnhancing(false);
        }
    };


    const handleGenerateTestsUsingLLAMA = async () => {
        try {
            setLoadingTests(true);

            const response = await fetch('http://localhost:5001/api/generate-tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: refactoredCode }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate tests');
            }

            const data = await response.json();
            setTestStub(data.tests || '// No test generated');
        } catch (err) {
            console.error(err);
            alert('Error generating tests using LLAMA.');
        } finally {
            setLoadingTests(false);
        }
    };

    const runInlineTests = () => {
        let output = '';
        let passed = 0; // Counter for passed tests
        let failed = 0; // Counter for failed tests

        // Fake implementations of render and screen for Jest compatibility
        const fakeRender = (Component) => {
            const container = document.createElement('div');
            container.innerHTML = `<pre>[Rendered ${Component?.name || 'Component'}]</pre>`;
            testRootRef.current.innerHTML = '';
            testRootRef.current.appendChild(container);
            return { container };
        };

        const fakeScreen = {
            getByText: (text) => {
                if (testRootRef.current.innerHTML.includes(text)) {
                    return true;
                } else {
                    throw new Error(`Text "${text}" not found in DOM`);
                }
            }
        };

        const fakeExpect = (val) => ({
            toBeInTheDocument: () => {
                if (!val) throw new Error(`Expected element to be in the document, but it was not found`);
            },
            toBe: (expected) => {
                if (val !== expected) throw new Error(`Expected ${val} to be ${expected}`);
            }
        });

        try {
            // Babel transpiling JSX to JS
            const transpiledCode = Babel.transform(testStub, {
                presets: ['react', 'env'], // Add presets to handle React JSX and ES features
            }).code;

            console.log('Test Stub:', testStub); // Log to ensure valid test code
            console.log('Transpiled Code:', transpiledCode); // Log the transpiled code

            // Jest-like test environment (React is already loaded from CDN)
            const testEnv = {
                React: window.React, // Use React from global window
                ReactDOM: window.ReactDOM, // Use ReactDOM from global window
                render: fakeRender,
                screen: fakeScreen,
                expect: fakeExpect,
                describe: (desc, fn) => fn(),
                test: (desc, fn) => {
                    try {
                        fn();
                        passed++; // Increment the passed test counter
                        output += `✅ ${desc}\n`;
                    } catch (err) {
                        failed++; // Increment the failed test counter
                        output += `❌ ${desc} → ${err.message}\n`;
                    }
                }
            };

            // Wrapping the test code to simulate Jest execution, now transpiled
            const wrapped = `(function(testEnv){ 
            const { React, ReactDOM, render, screen, expect, describe, test } = testEnv; 
            ${transpiledCode} 
        })`;

            console.log('Wrapped Code:', wrapped); // Log the final wrapped code

            // Execute the test environment
            eval(wrapped);

            // Display the final result count
            output += `\n\nTest Summary:\n`;
            output += `Total Tests: ${passed + failed}\n`;
            output += `Passed: ${passed}\n`;
            output += `Failed: ${failed}\n`;

        } catch (e) {
            output = `❌ Test Runner Error: ${e.message}`;
        }

        setTestOutput(output);
    };



    const handleDownload = () => {
        const blob = new Blob([testStub], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    };

    return (
        <div className="mt-4">
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={handleGenerateStub}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    Generate Test Stub
                </button>

                <button
                    onClick={handleEnhanceWithAI}
                    disabled={!testStub || enhancing}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    {enhancing ? 'Enhancing...' : 'Enhance via AI'}
                </button>
                <button
                    onClick={handleDownload}
                    disabled={!testStub}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                    Download Test File
                </button>
                <button
                    onClick={handleGenerateTestsUsingLLAMA}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                >
                    {loadingTests ? 'Generating Tests...' : '🧪 Generate Tests using LLAMA'}
                </button>
                <button
                    onClick={runInlineTests}
                    disabled={!testStub}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                    Run Inline Test
                </button>
            </div>

            {testStub && (
                <>
                    <div className="mt-4">
                        <h2 className="text-xl font-semibold mb-2">Generated Test Stub: {filename}</h2>
                        <Editor
                            height="30vh"
                            defaultLanguage="javascript"
                            value={testStub}
                            options={{ readOnly: false }}
                            theme="vs-dark"
                            onChange={(val) => setTestStub(val)}
                        />
                    </div>

                    <div className="mt-4 text-sm bg-gray-900 text-green-300 p-4 rounded whitespace-pre-wrap">
                        <strong>Test Output:</strong>
                        <div>{testOutput || 'No test run yet.'}</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TestStubPanel;
