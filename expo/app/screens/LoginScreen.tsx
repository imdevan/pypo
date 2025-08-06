import { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { TextInput, TextStyle, ViewStyle } from "react-native"

import { Button } from "@/components/lib/Button"
import { PressableIcon } from "@/components/lib/Icon"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { TextField, type TextFieldAccessoryProps } from "@/components/lib/TextField"
import { useAuth } from "@/context/AuthContext"
import type { AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useLogin } from "@/services/api/hooks"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = () => {
  const authPasswordInput = useRef<TextInput>(null)

  const [authPassword, setAuthPassword] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const [serverError, setServerError] = useState("")
  const { authEmail, setAuthEmail, login, register, isLoading } = useAuth()
  const { error: loginError } = useLogin()
  console.log("🚀 ~ LoginScreen ~ loginError:", loginError)

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const emailValidationError = useMemo(() => {
    if (!authEmail || authEmail.length === 0) return "Email can't be blank"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "Email must be a valid email address"
    return ""
  }, [authEmail])

  const passwordValidationError = useMemo(() => {
    if (!authPassword || authPassword.length === 0) return "Password can't be blank"
    if (authPassword.length < 6) return "Password must be at least 6 characters"
    return ""
  }, [authPassword])

  const validationError = useMemo(() => {
    return emailValidationError || passwordValidationError
  }, [emailValidationError, passwordValidationError])

  useEffect(() => {
    // Pre-fill with demo credentials for testing
    setAuthEmail("admin@example.com")
    setAuthPassword("changethis")
  }, [setAuthEmail])

  async function handleLogin() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)
    setServerError("") // Clear previous errors

    if (validationError) return

    const result = await login(authEmail!, authPassword)
     console.log("🚀 ~ handleLogin ~ result:", result)
     
    if (!result.success) {
      setServerError(result.error || "An error occurred during login")
    }
    
    setIsSubmitted(false)
  }

  async function handleRegister() {
    setIsSubmitted(true)
    setServerError("") // Clear previous errors

    if (validationError) return

    const result = await register(authEmail!, authPassword)
    
    if (!result.success) {
      setServerError(result.error || "An error occurred during registration")
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
        onChangeText={(text) => {
          setAuthEmail(text)
          setServerError("") // Clear server error when user types
        }}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        labelTx="loginScreen:emailFieldLabel"
        placeholderTx="loginScreen:emailFieldPlaceholder"
        helper={isSubmitted ? emailValidationError : ""}
        status={isSubmitted && emailValidationError ? "error" : undefined}
        onSubmitEditing={() => authPasswordInput.current?.focus()}
        editable={!isLoading}
      />

      <TextField
        ref={authPasswordInput}
        value={authPassword}
        onChangeText={(text) => {
          setAuthPassword(text)
          setServerError("") // Clear server error when user types
        }}
        containerStyle={themed($textField)}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        labelTx="loginScreen:passwordFieldLabel"
        placeholderTx="loginScreen:passwordFieldPlaceholder"
        helper={isSubmitted ? passwordValidationError : ""}
        status={isSubmitted && passwordValidationError ? "error" : undefined}
        onSubmitEditing={handleLogin}
        RightAccessory={PasswordRightAccessory}
        editable={!isLoading}
      />

      {serverError && (
        <Text
          text={serverError}
          style={themed($serverError)}
          preset="formHelper"
          size="sm"
        />
      )}

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

const $serverError: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.sm,
  textAlign: "center",
})
