import { create } from "zustand";

interface PayrollEntryState {
  skipPayrollEntries: string[];
  setSkipPayrollEntries: (skipPayrollEntries?: string[]) => void;
}

export const usePayrollEntriesStore = create<PayrollEntryState>()((set) => ({
  skipPayrollEntries: [],
  setSkipPayrollEntries: (skipPayrollEntries) => set({ skipPayrollEntries }),
}));
