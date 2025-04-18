import { create } from 'zustand';

interface PersonRecord {
    name: string;
    age: number;
}

interface State {
    count: number;
    personRecord: PersonRecord;
    history: Array<{ count: number; personRecord: PersonRecord }>;
    setCount: (newCount: number) => void;
    setPersonRecord: (newRecord: PersonRecord) => void;
    addHistory: () => void;
    rollback: () => void;
}

export const useStore = create<State>((set) => ({
    count: 0,
    personRecord: { name: '', age: 0 },
    history: [],
    setCount: (newCount: number) => set({ count: newCount }),
    setPersonRecord: (newRecord: PersonRecord) => set({ personRecord: newRecord }),
    addHistory: () => set((state) => {
        const newHistoryItem = {
            count: state.count,
            personRecord: state.personRecord
        };
        return { history: [...state.history, newHistoryItem] };
    }),
    rollback: () => set((state) => {
        const previousState = state.history[state.history.length - 1] || { count: 0, personRecord: { name: '', age: 0 } };
        return { count: previousState.count, personRecord: previousState.personRecord, history: state.history.slice(0, -1) };
    }),
}));
