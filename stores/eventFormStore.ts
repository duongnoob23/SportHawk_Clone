import { DEFAULT_EVENT_TYPE } from '@con/eventTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LeaderData1, MemberData1 } from '@top/features/event/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Re-export for backward compatibility
export { DEFAULT_EVENT_TYPE };

interface EventFormData {
  // Event basic info
  eventType: string;
  homeTeamName: string;
  awayTeamName: string;
  eventTitle: string; // For "Other" event type
  description: string;
  kitColor: string;
  location: string;
  locationAddress: string;
  locationLatitude: number | null;
  locationLongitude: number | null;
  opponent: string;
  // Date/Time fields
  eventDate: string | null; // ISO string for persistence
  startTime: string | null; // ISO string for persistence
  meetTime: string | null; // ISO string for persistence
  endTime: string | null; // ISO string for persistence
  answerBy: string | null; // ISO string for persistence

  invitationMembers: MemberData1[];
  invitationLeaders: LeaderData1[];
  rawInvitationMembers: MemberData1[];
  rawInvitationLeaders: LeaderData1[];

  // Member and leader selection
  selectedMembers: string[];
  selectedLeaders: string[];
  preMatchMessage: string;

  // Team context
  teamId: string;
  teamName: string; // Store the actual team name
}

interface EventFormStore {
  // Form data
  formData: Partial<EventFormData>;
  snapshot: Partial<EventFormData> | null;

  // Actions
  updateField: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K]
  ) => void;
  updateMultipleFields: (fields: Partial<EventFormData>) => void;

  updateInvitationLeaders: (leaders: LeaderData1[] | undefined) => void;
  updateInvitationMembers: (members: MemberData1[] | undefined) => void;
  updateRawInvitationLeaders: (leaders: LeaderData1[] | undefined) => void;
  updateRawInvitationMembers: (members: MemberData1[] | undefined) => void;

  updateMemberSelection: (
    members: string[],
    leaders: string[],
    message: string
  ) => void;

  clearForm: () => void;
  clearFormEditEvent: () => void;
  clearFormEditSelectSquad: () => void;
  // Getters
  getFormData: () => Partial<EventFormData>;
  isFormDirty: () => boolean;

  saveSnapshot: () => void;
  restoreSnapshot: () => void;
}

const initialFormData: Partial<EventFormData> = {
  eventType: DEFAULT_EVENT_TYPE,
  homeTeamName: '',
  awayTeamName: '',
  eventTitle: '',
  description: '',
  kitColor: '',
  location: '',
  locationAddress: '',
  locationLatitude: null,
  locationLongitude: null,
  opponent: '',
  eventDate: null,
  startTime: null,
  meetTime: null,
  endTime: null,
  answerBy: null,
  invitationLeaders: [],
  invitationMembers: [],
  rawInvitationLeaders: [],
  rawInvitationMembers: [],

  selectedMembers: [],
  selectedLeaders: [],
  preMatchMessage: '',
  teamId: '',
  teamName: '',
};

const useEventFormStore = create<EventFormStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      snapshot: null,

      saveSnapshot: () => {
        const current = get().formData;
        set({ snapshot: { ...current } });
      },

      // ← THÊM: Khôi phục snapshot khi Cancel
      restoreSnapshot: () => {
        const snapshot = get().snapshot;
        if (snapshot) {
          set({ formData: snapshot, snapshot: null });
        }
      },

      updateField: (field, value) => {
        set(state => ({
          formData: {
            ...state.formData,
            [field]: value,
          },
        }));
      },

      updateMultipleFields: fields => {
        set(state => ({
          formData: {
            ...state.formData,
            ...fields,
          },
        }));
      },

      updateInvitationMembers: (members: MemberData1[] | undefined) => {
        set(state => ({
          formData: {
            ...state.formData,
            invitationMembers: members,
          },
        }));
      },
      updateRawInvitationMembers: (members: MemberData1[] | undefined) => {
        set(state => ({
          formData: {
            ...state.formData,
            rawInvitationMembers: members,
          },
        }));
      },
      updateInvitationLeaders: (leaders: LeaderData1[] | undefined) => {
        set(state => ({
          formData: {
            ...state.formData,
            invitationLeaders: leaders,
          },
        }));
      },
      updateRawInvitationLeaders: (leaders: LeaderData1[] | undefined) => {
        set(state => ({
          formData: {
            ...state.formData,
            rawInvitationLeaders: leaders,
          },
        }));
      },
      updateMemberSelection: (members, leaders, message) => {
        set(state => ({
          formData: {
            ...state.formData,
            selectedMembers: members,
            selectedLeaders: leaders,
            preMatchMessage: message,
          },
        }));
      },

      clearFormEditEvent: () => {
        set(state => ({
          formData: {
            ...state.formData,
            invitationMembers: [],
            invitationLeaders: [],
            rawInvitationMembers: [],
            rawInvitationLeaders: [],
          },
        }));
      },
      clearFormEditSelectSquad: () => {
        set(state => ({
          formData: {
            ...state.formData,
            selectedMembers: [],
            selectedLeaders: [],
          },
        }));
      },
      clearForm: () => {
        set({ formData: initialFormData });
        AsyncStorage.removeItem('event-form-storage');
      },

      getFormData: () => {
        return get().formData;
      },

      isFormDirty: () => {
        const current = get().formData;
        return JSON.stringify(current) !== JSON.stringify(initialFormData);
      },
    }),
    {
      name: 'event-form-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ formData: state.formData }), // Only persist formData
    }
  )
);

export default useEventFormStore;
export type { EventFormData, EventFormStore };
