import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import generateSummary from './azureOpenAI';
import { analyzeAST } from '../utils/analyzeAST';
import { calculateComplexity } from '../utils/complexityAnalyzer';
import ASTInsightPanel from './AstInsightsPanel.jsx';
import ComplexityPanel from './ComplexityPanel.js';
import TestStubPanel from './TestStubPanel.jsx';
import { formatCode } from '../utils/formatCode';
import CollapsiblePanel from './CollapsiblePanel.jsx';
import { DiffEditor } from '@monaco-editor/react';

const RefactorHelper = () => {
    const [code, setCode] = useState('');
    const [formattedCode, setFormattedCode] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [astInsights, setAstInsights] = useState([]);
    const [highlightLines, setHighlightLines] = useState([]);
    const [complexityScore, setComplexityScore] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [pat, setPat] = useState('');
    const [telemetryInsight, setTelemetryInsight] = useState('');

    const [viewMode, setViewMode] = useState('standard');
    const [viewModeG, setViewModeG] = useState('standard');

    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    // Store the original code for revert
    const [originalCode, setOriginalCode] = useState('');

    // Telemetry Insight Tracking: Track deprecated lifecycle methods
    const trackTelemetry = (inputCode) => {
        const deprecatedPatterns = [
            'componentWillMount',
            'componentWillReceiveProps',
            'componentWillUpdate'
        ];

        const matches = deprecatedPatterns.filter(pattern => inputCode.includes(pattern));
        const matchPercentage = (matches.length / deprecatedPatterns.length) * 100;

        if (matches.length > 0) {
            setTelemetryInsight(`⚠️ ${matchPercentage}% of scanned files use deprecated lifecycle methods.`);
        } else {
            setTelemetryInsight("✔️ No deprecated lifecycle methods found.");
        }
    };

    const handleGenerate = async () => {
        try {
            const inputCode = formattedCode || code;

            // Track telemetry insights
            trackTelemetry(inputCode);

            const astInfo = analyzeAST(inputCode);
            setAstInsights(astInfo.messages || []);
            setHighlightLines(astInfo.highlightLines || []);

            const summary = await generateSummary(
                inputCode,
                'Refactor this component using React 19 best practices.',
                'AI Refactor Assistant'
            );
            setSuggestion(summary);

            const score = calculateComplexity(inputCode);
            setComplexityScore(score);
        } catch (error) {
            console.error('Error generating refactor suggestion:', error);
        }
    };

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    const handleCodeCleanup = () => {
        setOriginalCode(code); // Save the original code
        const formatted = formatCode(code);
        setFormattedCode(formatted);
        setCode(formatted);
    };

    const handleRevertCleanup = () => {
        if (originalCode) {
            setCode(originalCode);
            setFormattedCode('');
            setHighlightLines([]);
        }
    };

    const handleGithubImport = async () => {
        try {
            const match = githubUrl.match(
                /github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/
            );
            if (!match) {
                alert('Invalid GitHub URL format.');
                return;
            }

            const [, owner, repo, branch, path] = match;
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

            const res = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_GITHUB_PAT}`,
                    Accept: 'application/vnd.github.v3.raw',
                },
            });

            if (!res.ok) {
                throw new Error(`GitHub API error: ${res.status}`);
            }

            const fileContent = await res.text();
            setCode(fileContent);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch GitHub file.');
        }
    };

    useEffect(() => {
        if (!editorRef.current || !monacoRef.current) return;

        const editor = editorRef.current;
        const monaco = monacoRef.current;

        const decorations = highlightLines.map((line) => ({
            range: new monaco.Range(line, 1, line, 1),
            options: {
                isWholeLine: true,
                className: 'highlight-line',
                marginClassName: 'highlight-line-margin',
            },
        }));

        editor.deltaDecorations([], decorations);
    }, [highlightLines]);

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
                <div className="border-2 border-dashed border-gray-400 p-4 mb-4 text-center">
                    Drag and drop your legacy component file here
                </div>

                <div className="mb-4 space-y-2">
                    <input
                        type="text"
                        placeholder="Paste GitHub file URL"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                    <button
                        onClick={handleGithubImport}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                    >
                        📂 Import From GitHub
                    </button>
                </div>

                {/* View Toggle Buttons */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setViewMode('standard')}
                        className={`${
                            viewMode === 'standard' ? 'bg-blue-600' : 'bg-gray-600'
                        } hover:bg-blue-700 text-white px-4 py-2 rounded`}
                    >
                        Standard View
                    </button>
                    <button
                        onClick={() => setViewMode('diff')}
                        className={`${
                            viewMode === 'diff' ? 'bg-blue-600' : 'bg-gray-600'
                        } hover:bg-blue-700 text-white px-4 py-2 rounded`}
                    >
                        Diff View
                    </button>
                    <button
                        onClick={() => setViewMode('split')}
                        className={`${
                            viewMode === 'split' ? 'bg-blue-600' : 'bg-gray-600'
                        } hover:bg-blue-700 text-white px-4 py-2 rounded`}
                    >
                        Split View
                    </button>
                </div>

                {/* Render Editors Based on View Mode */}
                {viewMode === 'standard' && (
                    <Editor
                        height="40vh"
                        defaultLanguage="javascript"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={handleEditorMount}
                        theme="vs-dark"
                    />
                )}

                {viewMode === 'diff' && (
                    <DiffEditor
                        height="40vh"
                        original={originalCode}
                        modified={formattedCode || code}
                        language="javascript"
                        theme="vs-dark"
                    />
                )}

                {viewMode === 'split' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold text-center">Original Code</h4>
                            <Editor
                                height="40vh"
                                defaultLanguage="javascript"
                                value={originalCode}
                                options={{ readOnly: true }}
                                theme="vs-dark"
                            />
                        </div>
                        <div>
                            <h4 className="font-bold text-center">Refactored Code</h4>
                            <Editor
                                height="40vh"
                                defaultLanguage="javascript"
                                value={formattedCode || code}
                                options={{ readOnly: true }}
                                theme="vs-dark"
                            />
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleCodeCleanup}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        Clean Up Code
                    </button>

                    <button
                        onClick={handleRevertCleanup}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                        Revert Cleanup
                    </button>

                    <button
                        onClick={handleGenerate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Generate Refactor Suggestion
                    </button>
                    <select
                        value={viewModeG}
                        onChange={(e) => setViewModeG(e.target.value)}
                        className="ml-auto border px-3 py-2 rounded"
                    >
                        <option value="editor">Standard View</option>
                        <option value="diff">Diff View</option>
                        <option value="split">Split View</option>
                    </select>
                </div>

                {suggestion && (
                    <>
                        <CollapsiblePanel title="Refactored Code Suggestion" defaultOpen={true}>
                            {viewModeG === 'editor' && (
                                <Editor
                                    height="40vh"
                                    defaultLanguage="javascript"
                                    value={suggestion}
                                    options={{ readOnly: true }}
                                    theme="vs-dark"
                                />
                            )}

                            {viewModeG === 'diff' && (
                                <DiffEditor
                                    height="40vh"
                                    language="javascript"
                                    original={code}
                                    modified={suggestion}
                                    theme="vs-dark"
                                />
                            )}

                            {viewModeG === 'split' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Editor
                                        height="40vh"
                                        defaultLanguage="javascript"
                                        value={code}
                                        options={{ readOnly: true }}
                                        theme="vs-dark"
                                    />
                                    <Editor
                                        height="40vh"
                                        defaultLanguage="javascript"
                                        value={suggestion}
                                        options={{ readOnly: true }}
                                        theme="vs-dark"
                                    />
                                </div>
                            )}
                        </CollapsiblePanel>
                    </>
                )}
                <CollapsiblePanel title="Generated Test Stub" defaultOpen={true}>
                    <TestStubPanel refactoredCode={code} />
                </CollapsiblePanel>
            </div>

            <div className="md:col-span-1 bg-gray-100 dark:bg-gray-800 rounded p-4">
                <CollapsiblePanel title="AST Insights" defaultOpen={true}>
                    <ASTInsightPanel insights={astInsights} />
                </CollapsiblePanel>

                <CollapsiblePanel title="Complexity Score" defaultOpen={true}>
                    {complexityScore && <ComplexityPanel score={complexityScore} />}
                </CollapsiblePanel>

                {/* Telemetry Insight Panel */}
                <CollapsiblePanel title="Telemetry Insight" defaultOpen={true}>
                    <div className="text-sm text-gray-500">{telemetryInsight}</div>
                </CollapsiblePanel>
            </div>
        </div>
    );
};

export default RefactorHelper;
