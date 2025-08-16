/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface EpisodeItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author: string
  thumbnail: string
  description: string
  content: string
  enclosure: {
    link: string
    type: string
    length: number
    duration: number
    rating: { scheme: string; value: string }
  }
  categories: string[]
}

export interface ApiFeedResponse {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author: string
    description: string
    image: string
  }
  items: EpisodeItem[]
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}

/**
 * Backend API Types
 */

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  email: string
  is_active: boolean
  is_superuser: boolean
  full_name?: string
}

export interface ItemResponse {
  id: string
  title: string
  description?: string
  owner_id: string
  date_posted: string
}

export interface ItemsResponse {
  data: ItemResponse[]
  count: number
}

export interface CreateItemRequest {
  title: string
  description?: string
}

export interface UpdateItemRequest {
  title?: string
  description?: string
}
