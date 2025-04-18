import React, { useState } from 'react';
import { useStore } from './store/store'; // Zustand store

const Snapshots = () => {
    const { count, personRecord, setCount, setPersonRecord, addHistory, rollback, history } = useStore();
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);
            importSnapshots(selectedFile, setCount, setPersonRecord);
        }
    };

    const exportSnapshots = (history: Array<{ count: number; personRecord: { name: string, age: number } }>) => {
        const snapshots = JSON.stringify(history);
        const blob = new Blob([snapshots], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'snapshots.json';
        a.click();
    };

    const importSnapshots = (
        file: File,
        setCount: (newCount: number) => void,
        setPersonRecord: (newRecord: { name: string, age: number }) => void
    ) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSnapshots = JSON.parse(e.target?.result as string);
                if (importedSnapshots.length > 0) {
                    const lastSnapshot = importedSnapshots[importedSnapshots.length - 1];
                    setCount(lastSnapshot.count);
                    setPersonRecord(lastSnapshot.personRecord);
                }
            } catch (error) {
                console.error('Error importing snapshots:', error);
            }
        };
        reader.readAsText(file);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPersonRecord({ ...personRecord, name: event.target.value });
    };

    const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPersonRecord({ ...personRecord, age: parseInt(event.target.value, 10) });
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Snapshot Manager</h1>

            <div className="mb-6 space-y-2">
                <p className="text-lg">📊 <strong>Count:</strong> {count}</p>
                <p className="text-lg">👤 <strong>Name:</strong> {personRecord.name}</p>
                <p className="text-lg">🎂 <strong>Age:</strong> {personRecord.age}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <input
                    type="text"
                    value={personRecord.name}
                    onChange={handleNameChange}
                    placeholder="Enter name"
                    className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="number"
                    value={personRecord.age}
                    onChange={handleAgeChange}
                    placeholder="Enter age"
                    className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
                    onClick={() => setCount(count + 1)}
                >
                    ➕ Increment
                </button>
                <button
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition"
                    onClick={addHistory}
                >
                    💾 Save Snapshot
                </button>
                <button
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
                    onClick={rollback}
                >
                    ⏪ Rollback
                </button>
                <button
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition"
                    onClick={() => exportSnapshots(history)}
                >
                    📤 Export
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md p-3 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-md shadow-sm">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">🕓 Snapshot History</h2>
                {history.length === 0 ? (
                    <p className="text-gray-500">No snapshots available.</p>
                ) : (
                    <ul className="list-disc ml-5 space-y-2 text-gray-700">
                        {history.map((snap, index) => (
                            <li key={index}>
                                <strong>Snapshot {index + 1}</strong> — Count: {snap.count}, Name: {snap.personRecord.name}, Age: {snap.personRecord.age}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Snapshots;
