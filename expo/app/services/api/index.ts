/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"

import Config from "@/config"

import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, LoginRequest, LoginResponse, UserResponse, ItemResponse, ItemsResponse } from "./types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  }

  /**
   * Set auth token for future requests
   */
  setAuthToken(token: string) {
    console.log("API: Setting auth token:", token.substring(0, 20) + "...")
    this.apisauce.setHeader("Authorization", `Bearer ${token}`)
    console.log("API: Auth token set")
  }

  /**
   * Clear auth token
   */
  clearAuthToken() {
    console.log("API: Clearing auth token")
    this.apisauce.deleteHeader("Authorization")
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<{ kind: "ok"; data: LoginResponse } | GeneralApiProblem> {
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    const response: ApiResponse<LoginResponse> = await this.apisauce.post(
      "login/access-token",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      if (data?.access_token) {
        this.setAuthToken(data.access_token)
      }
      return { kind: "ok", data: data! }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Register new user
   */
  async register(email: string, password: string): Promise<{ kind: "ok"; data: UserResponse } | GeneralApiProblem> {
    const response: ApiResponse<UserResponse> = await this.apisauce.post("users/signup", {
      email,
      password,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      return { kind: "ok", data: data! }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<{ kind: "ok"; data: UserResponse } | GeneralApiProblem> {
    console.log("API: Getting current user...")
    const response: ApiResponse<UserResponse> = await this.apisauce.get("users/me")

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      return { kind: "ok", data: data! }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Get all items for the current user
   */
  async getItems(): Promise<{ kind: "ok"; data: ItemsResponse } | GeneralApiProblem> {
    console.log("API: Getting items...")
    const response: ApiResponse<ItemsResponse> = await this.apisauce.get("items/")

    console.log("API: Items response status:", response.status)
    console.log("API: Items response ok:", response.ok)

    if (!response.ok) {
      console.log("API: Items request failed:", response.problem)
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      console.log("API: Items data received:", data)
      return { kind: "ok", data: data! }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Create a new item
   */
  async createItem(title: string, description?: string): Promise<{ kind: "ok"; data: ItemResponse } | GeneralApiProblem> {
    const response: ApiResponse<ItemResponse> = await this.apisauce.post("items/", {
      title,
      description,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      return { kind: "ok", data: data! }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Update an item
   */
  async updateItem(id: string, title: string, description?: string): Promise<{ kind: "ok"; data: ItemResponse } | GeneralApiProblem> {
    const response: ApiResponse<ItemResponse> = await this.apisauce.patch(`items/${id}`, {
      title,
      description,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      return { kind: "ok", data: data! }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Delete an item
   */
  async deleteItem(id: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<void> = await this.apisauce.delete(`items/${id}`)

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }

  /**
   * Test the current token
   */
  async testToken(): Promise<{ kind: "ok"; data: UserResponse } | GeneralApiProblem> {
    const response: ApiResponse<UserResponse> = await this.apisauce.post("login/test-token")

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const data = response.data
      return { kind: "ok", data: data! }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
