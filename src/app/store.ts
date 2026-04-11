import { create } from "zustand";

interface AppState {
  researcherId: number | null;
  methodId: number | null;
  sessionName: string;
  selectedApeIds: number[];
  selectMethod: (methodId: number) => void;
  selectResearcher: (researcherId: number) => void;
  setSessionName: (name: string) => void;
  selectApe: (apeId: number) => void;
  clearSelectedApes: () => void;
}
export const useAppStore = create<AppState>((set) => ({
  researcherId: null,
  methodId: 1 /* Default to first method for simplicity */,
  sessionName: "",
  selectedApeIds: [],
  selectMethod: (methodId: number) => set({ methodId }),
  selectResearcher: (researcherId: number) => set({ researcherId }),
  setSessionName: (name: string) => set({ sessionName: name }),
  selectApe: (apeId: number) =>
    set((state) => ({
      selectedApeIds: state.selectedApeIds.includes(apeId)
        ? state.selectedApeIds.filter((id) => id !== apeId)
        : [...state.selectedApeIds, apeId],
    })),
  clearSelectedApes: () => set({ selectedApeIds: [], researcherId: null }),
}));
