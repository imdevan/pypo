import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo, useEffect } from "react"
import { useMMKVString } from "react-native-mmkv"
import { api } from "@/services/api"

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

  // Set auth token in API service when it changes
  useEffect(() => {
    if (authToken) {
      console.log("Setting auth token in API service:", authToken.substring(0, 20) + "...")
      api.setAuthToken(authToken)
    } else {
      console.log("Clearing auth token from API service")
      api.clearAuthToken()
    }
  }, [authToken])

  // Test token validity on app startup if token exists
  useEffect(() => {
    if (authToken) {
      console.log("Testing token validity on startup...")
      api.testToken().then(result => {
        if (result.kind !== "ok") {
          console.log("Token is invalid, clearing it")
          setAuthToken(undefined)
          setAuthEmail("")
        } else {
          console.log("Token is valid, user:", result.data.email)
        }
      }).catch(error => {
        console.log("Error testing token:", error)
        setAuthToken(undefined)
        setAuthEmail("")
      })
    }
  }, [authToken, setAuthToken, setAuthEmail])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading("true")
      console.log("Attempting login for:", email)
      const result = await api.login(email, password)
      
      if (result.kind === "ok") {
        console.log("Login successful, setting token")
        setAuthToken(result.data.access_token)
        setAuthEmail(email)
        return { success: true }
      } else {
        console.log("Login failed:", result.kind)
        return { 
          success: false, 
          error: result.kind === "bad-data" ? "Invalid response from server" : "Login failed" 
        }
      }
    } catch (error) {
      console.log("Login error:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }
    } finally {
      setIsLoading("false")
    }
  }, [setAuthToken, setAuthEmail, setIsLoading])

  const register = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading("true")
      console.log("Attempting registration for:", email)
      const result = await api.register(email, password)
      
      if (result.kind === "ok") {
        console.log("Registration successful, attempting login")
        // After successful registration, automatically log in
        return await login(email, password)
      } else {
        console.log("Registration failed:", result.kind)
        return { 
          success: false, 
          error: result.kind === "bad-data" ? "Invalid response from server" : "Registration failed" 
        }
      }
    } catch (error) {
      console.log("Registration error:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }
    } finally {
      setIsLoading("false")
    }
  }, [login, setIsLoading])

  const logout = useCallback(() => {
    console.log("Logging out")
    setAuthToken(undefined)
    setAuthEmail("")
    api.clearAuthToken()
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
