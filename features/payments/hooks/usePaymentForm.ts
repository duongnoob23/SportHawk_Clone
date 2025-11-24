import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { DEFAULT_PAYMENT_TYPE } from '@top/features/payments/constants';
import usePaymentFormStore from '@top/stores/paymentFormStore';
import {
  useGetTeamStripeAccount,
  useGetTeam,
} from '@top/features/payments/hooks';

interface UsePaymentFormProps {
  teamId: string;
}

export const usePaymentForm = ({ teamId }: UsePaymentFormProps) => {
  const {
    formData,
    updateField,
    updateMultipleFields,
    clearForm,
    isFormValid,
    getValidationErrors,
  } = usePaymentFormStore();

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Track if we're navigating to member selection (don't clear form in this case)
  const isNavigatingToSelection = useRef(false);

  // Use the hooks to get team and stripe account data
  const { data: stripeData, isLoading: isLoadingStripe } =
    useGetTeamStripeAccount(teamId);
  const { data: teamData, isLoading: isLoadingTeam } = useGetTeam(teamId);

  // Default Due by date: 7 days in future at 10pm
  const getDueByDefault = useCallback(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    futureDate.setHours(22, 0, 0, 0); // 10pm
    return futureDate;
  }, []);

  const initializeForm = useCallback(() => {
    if (!teamId) {
      Alert.alert('Error', 'No team ID provided');
      router.back();
      return;
    }

    if (teamData) {
      updateMultipleFields({
        teamId: teamId,
        teamName: teamData.name || '',
        stripeAccountId: stripeData?.stripeAccountId || '',
        paymentType: DEFAULT_PAYMENT_TYPE,
      });

      if (!stripeData && !isLoadingStripe) {
        Alert.alert(
          'Stripe Account Required',
          'Your team needs to set up a Stripe account before creating payment requests.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }
  }, [
    teamId,
    teamData,
    stripeData,
    updateMultipleFields,
    formData.stripeAccountId,
  ]);

  const handleSelectMembers = () => {
    // Set flag to prevent form clearing when navigating to member selection
    isNavigatingToSelection.current = true;
    router.push({
      pathname: '/payments/edit-members',
      params: {
        teamId: teamId,
      },
    });
  };

  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  useEffect(() => {
    // Clear form on fresh entry
    clearForm();
    initializeForm();

    // Cleanup: clear form when navigating away (except to member selection)
    return () => {
      if (!isNavigatingToSelection.current) {
        clearForm();
      }
      // Reset flag for next time
      isNavigatingToSelection.current = false;
    };
  }, [teamId, clearForm, initializeForm]);

  // Initialize form when team data is available
  useEffect(() => {
    if (teamData) {
      initializeForm();
    }
  }, [teamData, initializeForm]);

  return {
    formData,
    updateField,
    clearForm,
    isFormValid,
    getValidationErrors,
    loading: isLoadingStripe || isLoadingTeam,
    stripeAccount: stripeData,
    touchedFields,
    getDueByDefault,
    handleSelectMembers,
    markFieldAsTouched,
  };
};
