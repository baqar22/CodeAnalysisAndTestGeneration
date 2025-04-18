import { useDebugStore } from './store/debugStore';

export default function SnapshotViewer() {
    const logs = useDebugStore((state) => state.logs);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Debug Snapshots</h2>
            <div className="max-h-80 overflow-y-auto space-y-2">
                {logs.map((log, idx) => (
                    <div key={idx} className="bg-gray-100 p-2 rounded shadow text-sm">
                        <p className="text-xs text-gray-500">{log.timestamp}</p>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.state, null, 2)}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
}
