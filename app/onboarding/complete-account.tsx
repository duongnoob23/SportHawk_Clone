import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { appValues } from '@con/app-values';
import { Routes } from '@con/routes';
import { useUser } from '@hks/useUser';
import { router } from 'expo-router';

import {
  ShButton,
  ShFormFieldChoice,
  ShFormFieldDate,
  ShFormFieldName,
  ShLogoAndTitle,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShText,
  ShTextWithLink,
} from '@top/components';

import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';
import { IconName } from '@top/constants/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CompleteAccount() {
  const { userSignUp, loading } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [teamType, setTeamType] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const insets = useSafeAreaInsets();
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'LastName is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        'Password must include uppercase, lowercase, number, and special character';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must include lowercase';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must include number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = 'Password must include special character';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - dateOfBirth.getFullYear();
      if (age < appValues.minimumSignUpAge) {
        newErrors.dateOfBirth = `You must be ${appValues.minimumSignUpAge} or above to sign up`;
      }
    }
    if (!teamType) {
      newErrors.teamType = 'Please select your team sort';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {

  };

  const teamTypeOptions = [
    { label: 'Male', value: 'men' },
    { label: 'Female', value: 'women' },
  ];

  const termsSegments = [
    { text: "By selecting Sign Up, I agree to SportHawk's" },
    {
      text: ' Payments Terms of Service',
      url: 'https://sporthawkapp.com/terms-conditions',
    },
    {
      text: ',',
    },
    {
      text: ' Terms of Service',
      url: 'https://sporthawkapp.com/terms-conditions',
    },
    {
      text: ',',
    },
    {
      text: ' Non-discrimination Policy',
      url: 'https://sporthawkapp.com/terms-conditions',
    },
    { text: ' and' },
    { text: ' Privacy Policy', url: 'https://sporthawkapp.com/privacy-policy' },
    { text: '.' },
  ];

  const minimumDate = new Date();
  minimumDate.setFullYear(
    minimumDate.getFullYear() - appValues.maximumAgeLimit
  );
  const maximumDate = new Date();
  maximumDate.setFullYear(
    maximumDate.getFullYear() - appValues.minimumSignUpAge
  );

  // Default date: January 1st, 20 years ago
  const defaultDate = new Date();
  defaultDate.setFullYear(
    defaultDate.getFullYear() - appValues.defaultAgeForDatePicker
  );
  defaultDate.setMonth(0); // January (0-indexed)
  defaultDate.setDate(1);

  return (
    <ShScreenContainer>
      <ShScreenHeader
        title="Complete Account"
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: () => router.back(),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ marginBottom: insets.bottom, flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: spacing.screenPadding,
              paddingTop: spacing.xxl,
              backgroundColor: colorPalette.baseDark,
              paddingHorizontal: spacing.xxl,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                alignItems: 'center',
                paddingTop: spacing.lg,
                marginBottom: spacing.xxxl,
              }}
            >
              <View
                style={{
                  width: spacing.authLogoSize,
                  height: spacing.authLogoSize,
                  backgroundColor: colorPalette.baseDark,
                  borderRadius: spacing.borderRadiusXl,
                  borderWidth: spacing.listSeparator,
                  borderColor: colorPalette.borderSubtle,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: spacing.md,
                }}
              >
                <ShLogoAndTitle variant="xs" showTitle={false} />
              </View>
              <ShSpacer size={spacing.lg}></ShSpacer>
              <ShText
                variant={ShTextVariant.Heading}
                style={{
                  fontSize: spacing.xxl,
                }}
              >
                Complete Sign Up
              </ShText>

              <ShSpacer size={spacing.lg}></ShSpacer>

              <ShText
                variant={ShTextVariant.Body}
                style={{
                  fontSize: spacing.lg,
                  fontWeight: fontWeights.regular,
                }}
              >
                Just a few more details to get you started
              </ShText>
            </View>

            <ShSpacer size={spacing.xxl} />

            <ShFormFieldName
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              required
              error={errors.firstName}
            />

            <ShSpacer size={spacing.xs} />

            <ShFormFieldName
              label="Surname"
              placeholder="Enter your LastName"
              value={lastName}
              onChangeText={setLastName}
              required
              error={errors.LastName}
            />

            <ShSpacer size={spacing.xs} />

            <ShFormFieldDate
              label="Date of Birth"
              placeholder="Enter your date of birth"
              value={dateOfBirth}
              onChangeDate={setDateOfBirth}
              required
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              defaultDate={defaultDate}
              helperText={`You need to be ${appValues.minimumSignUpAge} or above to sign up`}
              error={errors.dateOfBirth}
            />

            <ShSpacer size={spacing.xs} />

            <ShFormFieldChoice
              label="Sex"
              options={teamTypeOptions}
              value={teamType}
              onChangeValue={setTeamType}
              required
              helperText="Required for club / team assignments"
              error={errors.teamType}
            />

            <ShSpacer size={spacing.xs} />

            <ShTextWithLink
              segments={termsSegments}
              style={{
                textAlign: 'left',
                marginTop: spacing.xxl,
                marginBottom: spacing.xxxl,
                fontSize: spacing.mdx,
              }}
            />

            <ShButton
              title="Sign Up"
              onPress={handleSignUp}
              variant={ShButtonVariant.Primary}
              loading={loading}
              disabled={loading}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ShScreenContainer>
  );
}
