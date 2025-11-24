import { appValues } from '@con/app-values';
import { Routes } from '@con/routes';
import { useUser } from '@hks/useUser';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

import {
  ShButton,
  ShFormFieldChoice,
  ShFormFieldDate,
  ShFormFieldEmail,
  ShFormFieldName,
  ShFormFieldPassword,
  ShLogoAndTitle,
  ShScreenContainer,
  ShSpacer,
  ShText,
  ShTextWithLink,
} from '@top/components';

import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontWeights, ShTextVariant } from '@con/typography';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
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
    if (!validateForm()) return;

    try {
      // Format date as YYYY-MM-DD in local timezone to avoid shift
      const formattedDate = dateOfBirth
        ? `${dateOfBirth.getFullYear()}-${String(dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(dateOfBirth.getDate()).padStart(2, '0')}`
        : '';

      await userSignUp({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: formattedDate,
        team_sort: teamType === 'men' ? 'Men' : 'Women',
      });

      // Navigate to email verification screen with email parameter

      router.push({
        pathname: Routes.VerifyEmail,
        params: { email },
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An error occurred'
      );
    }
  };

  const teamTypeOptions = [
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
  ];

  const termsSegments = [
    { text: "By selecting Sign Up, I agree to SportHawk's" },
    {
      text: ' Terms of Service',
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
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bottomOffset={insets.bottom}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + spacing.xxl,
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
              // fontWeight: fontWeights.semiBold,
            }}
          >
            Sign Up
          </ShText>

          <ShSpacer size={spacing.lg}></ShSpacer>

          <ShText
            variant={ShTextVariant.Body}
            style={{
              fontSize: spacing.lg,
              fontWeight: fontWeights.regular,
            }}
          >
            Sign up now to discover and manage
          </ShText>
          <ShText
            variant={ShTextVariant.Body}
            style={{
              fontSize: spacing.lg,
              fontWeight: fontWeights.regular,
            }}
          >
            sports activities
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
          label="Last Name"
          placeholder="Enter your last name"
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
          label="Team Sort"
          options={teamTypeOptions}
          value={teamType}
          onChangeValue={setTeamType}
          required
          helperText="Required for club / team assignments"
          error={errors.teamType}
        />

        <ShSpacer size={spacing.xs} />

        <ShFormFieldEmail
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          required
          error={errors.email}
        />

        <ShSpacer size={spacing.xs} />

        <ShFormFieldPassword
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          required
          helperText="Must be at least 8 characters"
          error={errors.password}
        />

        <ShSpacer size={spacing.xs} />

        <ShFormFieldPassword
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          required
          error={errors.confirmPassword}
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

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: spacing.xxxl,
            marginBottom: spacing.xxxl,
          }}
        >
          <ShText
            variant={ShTextVariant.Body}
            style={{ color: colorPalette.stoneGrey }}
          >
            Already have an account?{' '}
          </ShText>
          <ShButton
            title="Sign In"
            onPress={() => router.push(Routes.SignIn)}
            variant={ShButtonVariant.Link}
            textStyle={{ color: colorPalette.primaryGold }}
          />
        </View>
      </KeyboardAwareScrollView>
    </ShScreenContainer>
  );
}
