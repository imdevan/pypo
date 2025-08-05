import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useEffect } from "react"
import { useMMKVString } from "react-native-mmkv"
import { useLogin, useRegister, useTestToken } from "@/services/api/hooks"
import { extractErrorMessage } from "@/services/api/errorHandling"

export type AuthContextType = {
  isAuthenticated: boolean
  authToken?: string
  authEmail?: string
  setAuthToken: (token?: string) => void
  setAuthEmail: (email: string) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  validationError: string
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {}

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({ children }) => {
  const [authToken, setAuthToken] = useMMKVString("AuthProvider.authToken")
  const [authEmail, setAuthEmail] = useMMKVString("AuthProvider.authEmail")
  const [isLoading, setIsLoading] = useMMKVString("AuthProvider.isLoading")

  // Use TanStack Query hooks
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const testTokenQuery = useTestToken(authToken)

  // Test token validity on app startup if token exists
  useEffect(() => {
    if (authToken && testTokenQuery.isError) {
      console.log("Token is invalid, clearing it")
      setAuthToken(undefined)
      setAuthEmail("")
    }
  }, [authToken, testTokenQuery.isError, setAuthToken, setAuthEmail])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading("true")
      console.log("Attempting login for:", email)
      
      const result = await loginMutation.mutateAsync({
        body: {
          grant_type: "password",
          username: email,
          password: password,
        },
      })
      
      console.log("Login successful, setting token")
      setAuthToken(result.access_token)
      setAuthEmail(email)
      return { success: true }
    } catch (error) {
      console.log("Login error:", error)
      return { 
        success: false, 
        error: extractErrorMessage(error)
      }
    } finally {
      setIsLoading("false")
    }
  }, [loginMutation, setAuthToken, setAuthEmail, setIsLoading])

  const register = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading("true")
      console.log("Attempting registration for:", email)
      
      await registerMutation.mutateAsync({
        body: {
          email: email,
          password: password,
          full_name: email.split('@')[0], // Use email prefix as full name
        },
      })
      
      console.log("Registration successful, attempting login")
      // After successful registration, automatically log in
      return await login(email, password)
    } catch (error) {
      console.log("Registration error:", error)
      return { 
        success: false, 
        error: extractErrorMessage(error)
      }
    } finally {
      setIsLoading("false")
    }
  }, [login, registerMutation, setIsLoading])

  const logout = useCallback(() => {
    console.log("Logging out")
    setAuthToken(undefined)
    setAuthEmail("")
  }, [setAuthEmail, setAuthToken])

  const validationError = useMemo(() => {
    if (!authEmail || authEmail.length === 0) return "can't be blank"
    if (authEmail.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "must be a valid email address"
    return ""
  }, [authEmail])

  const value = {
    isAuthenticated: !!authToken,
    authToken,
    authEmail,
    setAuthToken,
    setAuthEmail,
    login,
    register,
    logout,
    validationError,
    isLoading: isLoading === "true",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
