import React, { useState } from 'react';
import { useStore } from './store/store';  // Zustand store

const Page2 = () => {
    const { personRecord, setPersonRecord, addHistory, rollback, history } = useStore();
    const [name, setName] = useState(personRecord.name);
    const [age, setAge] = useState(personRecord.age);

    const handleSave = () => {
        setPersonRecord({ name, age });
        addHistory(); // Save to history when the record is saved
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            importSnapshots(file);
        }
    };

    const exportSnapshots = (history: any[]) => {
        const snapshots = JSON.stringify(history);
        const blob = new Blob([snapshots], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'person-records.json';
        a.click();
    };

    const importSnapshots = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSnapshots = JSON.parse(e.target?.result as string);
                if (importedSnapshots.length > 0) {
                    const lastSnapshot = importedSnapshots[importedSnapshots.length - 1];
                    setPersonRecord(lastSnapshot);
                }
            } catch (error) {
                console.error('Error importing snapshots:', error);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Page 2 – Person Record</h1>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                />
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    onClick={handleSave}
                >
                    Save Person Record
                </button>
                <button
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    onClick={rollback}
                >
                    Rollback
                </button>
                <button
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    onClick={() => exportSnapshots(history)}
                >
                    Export Snapshots
                </button>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Import Snapshots</label>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="border border-gray-300 p-2 rounded-lg"
                />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Snapshot History</h2>
                <ul className="list-disc ml-6 text-gray-700 space-y-1">
                    {history.map((snap, index) => (
                        <li key={index}>
                            Snapshot {index + 1}: <strong>{snap.name}</strong> ({snap.age} years old)
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Page2;
