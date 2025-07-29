# API Layer Migration to TanStack Query

This document describes the migration from apisauce to TanStack Query for better data fetching, caching, and state management.

## What Changed

### Before (apisauce)
- Manual state management with `useState` and `useEffect`
- Manual loading states
- Manual error handling
- No automatic caching
- No background refetching

### After (TanStack Query)
- Automatic caching and background refetching
- Built-in loading and error states
- Automatic retry logic
- Optimistic updates
- Request deduplication

## Available Hooks

### Authentication Hooks

#### `useLogin()`
```typescript
const loginMutation = useLogin()

// Usage
const handleLogin = async () => {
  try {
    const result = await loginMutation.mutateAsync({ 
      email: "user@example.com", 
      password: "password" 
    })
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

#### `useRegister()`
```typescript
const registerMutation = useRegister()

// Usage
const handleRegister = async () => {
  try {
    await registerMutation.mutateAsync({ 
      email: "user@example.com", 
      password: "password" 
    })
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

#### `useCurrentUser(token)`
```typescript
const { data: user, isLoading, error } = useCurrentUser(authToken)

// Usage
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage />
if (user) return <UserProfile user={user} />
```

#### `useTestToken(token)`
```typescript
const { data: user, isError } = useTestToken(authToken)

// Usage
if (isError) {
  // Token is invalid, redirect to login
}
```

### Items Hooks

#### `useItems(token)`
```typescript
const { data: itemsData, isLoading, error, refetch } = useItems(authToken)

// Usage
const items = itemsData?.data || []

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage />
return <ItemsList items={items} />
```

#### `useCreateItem()`
```typescript
const createItemMutation = useCreateItem()

// Usage
const handleCreate = async () => {
  try {
    await createItemMutation.mutateAsync({
      title: "New Item",
      description: "Description",
      token: authToken
    })
    // Item created successfully
  } catch (error) {
    // Handle error
  }
}
```

#### `useUpdateItem()`
```typescript
const updateItemMutation = useUpdateItem()

// Usage
const handleUpdate = async () => {
  try {
    await updateItemMutation.mutateAsync({
      id: "item-id",
      title: "Updated Title",
      description: "Updated Description",
      token: authToken
    })
    // Item updated successfully
  } catch (error) {
    // Handle error
  }
}
```

#### `useDeleteItem()`
```typescript
const deleteItemMutation = useDeleteItem()

// Usage
const handleDelete = async (id: string) => {
  try {
    await deleteItemMutation.mutateAsync({ id, token: authToken })
    // Item deleted successfully
  } catch (error) {
    // Handle error
  }
}
```

## Migration Benefits

1. **Automatic Caching**: Data is cached and automatically kept fresh
2. **Background Refetching**: Data is refetched when the app comes back to focus
3. **Loading States**: Built-in loading states for better UX
4. **Error Handling**: Automatic retry logic and error states
5. **Optimistic Updates**: Immediate UI updates with rollback on error
6. **Request Deduplication**: Multiple components requesting the same data won't trigger multiple requests
7. **DevTools**: Better debugging experience with React Query DevTools

## Configuration

The QueryClient is configured in `queryClient.ts` with:
- 3 retry attempts for queries
- 1 retry attempt for mutations
- 5-minute stale time
- 10-minute cache time
- Exponential backoff for retries

## Error Handling

All hooks include proper error handling:
- 401 errors are not retried (authentication issues)
- Network errors are retried with exponential backoff
- Errors are properly typed and can be handled in components

## Best Practices

1. **Always check for token**: Most hooks require a valid auth token
2. **Handle loading states**: Use `isLoading` or `isPending` for better UX
3. **Handle errors**: Always provide error handling in your components
4. **Use refetch**: Provide a way for users to manually refresh data
5. **Optimistic updates**: Use mutations for immediate UI feedback 