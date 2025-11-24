import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PAYMENT_TYPE } from '@top/features/payments';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
interface PaymentFormData {
  title: string;
  description: string;
  amountPence: number;
  dueDate: string | null;
  paymentType: PaymentType;

  selectedMembers: string[];

  teamId: string;
  teamName: string;
  stripeAccountId: string | null;
}

interface PaymentFormStore {
  formData: Partial<PaymentFormData>;

  updateField: <K extends keyof PaymentFormData>(
    field: K,
    value: PaymentFormData[K]
  ) => void;
  updateMultipleFields: (fields: Partial<PaymentFormData>) => void;
  clearForm: () => void;

  isFormValid: () => boolean;
  getValidationErrors: () => Record<string, string>;
  getFormData: () => Partial<PaymentFormData>;
}

const initialFormData: Partial<PaymentFormData> = {
  title: '',
  description: '',
  amountPence: 0,
  dueDate: null,
  paymentType: DEFAULT_PAYMENT_TYPE,
  selectedMembers: [],
  teamId: '',
  teamName: '',
  stripeAccountId: null,
};

const usePaymentFormStore = create<PaymentFormStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,

      updateField: (field, value) =>
        set(state => ({
          formData: { ...state.formData, [field]: value },
        })),

      updateMultipleFields: fields =>
        set(state => ({
          formData: { ...state.formData, ...fields },
        })),

      clearForm: () => set({ formData: initialFormData }),

      isFormValid: () => {
        const { formData } = get();
        return !!(
          formData.title &&
          formData.title.length >= 3 &&
          formData.amountPence &&
          formData.amountPence >= 100 &&
          formData.dueDate &&
          formData.selectedMembers &&
          formData.selectedMembers.length > 0 &&
          formData.teamId
        );
      },

      getValidationErrors: () => {
        const { formData } = get();
        const errors: Record<string, string> = {};

        if (!formData.title) {
          errors.title = 'Title is required';
        } else if (formData.title.length < 3) {
          errors.title = 'Title must be at least 3 characters';
        } else if (formData.title.length > 100) {
          errors.title = 'Title must be less than 100 characters';
        }

        if (formData.description && formData.description.length > 500) {
          errors.description = 'Description must be less than 500 characters';
        }

        if (!formData.amountPence) {
          errors.amount = 'Amount is required';
        } else if (formData.amountPence < 100) {
          errors.amount = 'Minimum amount is £1.00';
        } else if (formData.amountPence > 100000000) {
          errors.amount = 'Maximum amount is £1,000,000';
        }

        if (!formData.dueDate) {
          errors.dueDate = 'Due date is required';
        } else if (new Date(formData.dueDate) < new Date()) {
          errors.dueDate = 'Due date must be in the future';
        }

        if (
          !formData.selectedMembers ||
          formData.selectedMembers.length === 0
        ) {
          errors.selectedMembers = 'At least one member must be selected';
        }

        return errors;
      },

      getFormData: () => get().formData,
    }),
    {
      name: 'payment-form-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ formData: state.formData }),
    }
  )
);

export default usePaymentFormStore;
