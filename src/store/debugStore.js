import { create } from 'zustand';

export const useDebugStore = create((set) => ({
    user: { name: 'Alice', loggedIn: true },
    counter: 0,
    logs: [],
    increment: () =>
        set((state) => {
            const newCounter = state.counter + 1;
            const log = {
                timestamp: new Date().toISOString(),
                state: { ...state, counter: newCounter },
            };
            return {
                counter: newCounter,
                logs: [...state.logs, log],
            };
        }),
}));
