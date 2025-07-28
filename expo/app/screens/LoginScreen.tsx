import { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { TextInput, TextStyle, ViewStyle, Alert } from "react-native"

import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField, type TextFieldAccessoryProps } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = () => {
  const authPasswordInput = useRef<TextInput>(null)

  const [authPassword, setAuthPassword] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const { authEmail, setAuthEmail, login, register, isLoading } = useAuth()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const validationError = useMemo(() => {
    if (!authEmail || authEmail.length === 0) return "Email can't be blank"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "Email must be a valid email address"
    if (!authPassword || authPassword.length === 0) return "Password can't be blank"
    if (authPassword.length < 6) return "Password must be at least 6 characters"
    return ""
  }, [authEmail, authPassword])

  useEffect(() => {
    // Pre-fill with demo credentials for testing
    setAuthEmail("admin@example.com")
    setAuthPassword("changethis")
  }, [setAuthEmail])

  const error = isSubmitted ? validationError : ""

  async function handleLogin() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (validationError) return

    const result = await login(authEmail!, authPassword)
    
    if (!result.success) {
      Alert.alert("Login Failed", result.error || "An error occurred during login")
    }
    
    setIsSubmitted(false)
  }

  async function handleRegister() {
    setIsSubmitted(true)

    if (validationError) return

    const result = await register(authEmail!, authPassword)
    
    if (!result.success) {
      Alert.alert("Registration Failed", result.error || "An error occurred during registration")
    }
    
    setIsSubmitted(false)
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <PressableIcon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden, colors.palette.neutral800],
  )

  return (
    <Screen
      preset="auto"
      contentContainerStyle={themed($screenContentContainer)}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text testID="login-heading" tx="loginScreen:logIn" preset="heading" style={themed($logIn)} />
      <Text tx="loginScreen:enterDetails" preset="subheading" style={themed($enterDetails)} />
      {attemptsCount > 2 && (
        <Text tx="loginScreen:hint" size="sm" weight="light" style={themed($hint)} />
      )}

      <TextField
        value={authEmail}
        onChangeText={setAuthEmail}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        labelTx="loginScreen:emailFieldLabel"
        placeholderTx="loginScreen:emailFieldPlaceholder"
        helper={error}
        status={error ? "error" : undefined}
        onSubmitEditing={() => authPasswordInput.current?.focus()}
        editable={!isLoading}
      />

      <TextField
        ref={authPasswordInput}
        value={authPassword}
        onChangeText={setAuthPassword}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        labelTx="loginScreen:passwordFieldLabel"
        placeholderTx="loginScreen:passwordFieldPlaceholder"
        onSubmitEditing={handleLogin}
        RightAccessory={PasswordRightAccessory}
        editable={!isLoading}
      />

      <Button
        testID="login-button"
        tx="loginScreen:tapToLogIn"
        style={themed($tapButton)}
        preset="reversed"
        onPress={handleLogin}
        disabled={isLoading}
      />

      <Button
        testID="register-button"
        text="Register"
        style={themed($registerButton)}
        preset="default"
        onPress={handleRegister}
        disabled={isLoading}
      />
    </Screen>
  )
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})

const $logIn: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $enterDetails: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $registerButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})
