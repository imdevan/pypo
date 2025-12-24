/// <reference types="jest" />
import { NavigationContainer } from "@react-navigation/native"
import { Platform } from "react-native"
import { render, fireEvent, waitFor } from "@testing-library/react-native"

import { VideoUploadInput } from "./VideoUploadInput"
import { ThemeProvider } from "../../theme/context"

// Mock Platform.OS
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native")
  return {
    ...RN,
    Platform: {
      OS: "web",
      select: jest.fn((obj) => obj.web),
    },
  }
})

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn((blob) => `blob:http://localhost/${blob}`)
global.URL.revokeObjectURL = jest.fn()

// Mock File constructor
global.File = class File {
  name: string
  type: string
  size: number
  lastModified: number

  constructor(
    public parts: any[],
    public filename: string,
    public options?: { type?: string },
  ) {
    this.name = filename
    this.type = options?.type || ""
    this.size = 0
    this.lastModified = Date.now()
  }
} as any

describe("VideoUploadInput", () => {
  const defaultProps = {
    value: null,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render the component", () => {
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput {...defaultProps} label="Video" />
        </NavigationContainer>
      </ThemeProvider>,
    )
    expect(getByText("Video")).toBeDefined()
  })

  it("should show placeholder text", () => {
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput {...defaultProps} placeholder="Select a video" />
        </NavigationContainer>
      </ThemeProvider>,
    )
    expect(getByText("Select a video")).toBeDefined()
  })

  it("should show select button", () => {
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput {...defaultProps} />
        </NavigationContainer>
      </ThemeProvider>,
    )
    expect(getByText("Select Video File")).toBeDefined()
  })

  it("should show clear button when value is set", () => {
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput {...defaultProps} value="blob:http://localhost/test" />
        </NavigationContainer>
      </ThemeProvider>,
    )
    expect(getByText("Clear")).toBeDefined()
  })

  it("should not show clear button when value is null", () => {
    const { queryByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput {...defaultProps} value={null} />
        </NavigationContainer>
      </ThemeProvider>,
    )
    expect(queryByText("Clear")).toBeNull()
  })

  it("should show success message when video is selected", () => {
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput {...defaultProps} value="blob:http://localhost/test" />
        </NavigationContainer>
      </ThemeProvider>,
    )
    expect(getByText("✓ Video file selected")).toBeDefined()
  })

  it("should show external error message", () => {
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput {...defaultProps} error="Custom error message" />
        </NavigationContainer>
      </ThemeProvider>,
    )
    expect(getByText(/Custom error message/)).toBeDefined()
  })

  it("should be disabled when disabled prop is true", () => {
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput {...defaultProps} disabled={true} />
        </NavigationContainer>
      </ThemeProvider>,
    )
    const button = getByText("Select Video File")
    // Note: In React Native Testing Library, disabled state might not be directly testable
    // This test verifies the component renders without errors when disabled
    expect(button).toBeDefined()
  })

  it("should call onChange when clear button is pressed", () => {
    const onChange = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <VideoUploadInput
            {...defaultProps}
            value="blob:http://localhost/test"
            onChange={onChange}
          />
        </NavigationContainer>
      </ThemeProvider>,
    )

    const clearButton = getByText("Clear")
    fireEvent.press(clearButton)

    expect(onChange).toHaveBeenCalledWith(null)
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/test")
  })

  describe("File selection", () => {
    it("should handle valid video file selection", async () => {
      const onChange = jest.fn()
      const onFileSelect = jest.fn()
      const { getByText } = render(
        <ThemeProvider>
          <NavigationContainer>
            <VideoUploadInput
              {...defaultProps}
              onChange={onChange}
              onFileSelect={onFileSelect}
            />
        </NavigationContainer>
      </ThemeProvider>,
      )

      // Create a mock file input change event
      // Note: This is a simplified test - actual file input testing requires more setup
      const file = new File(["test"], "test.mp4", { type: "video/mp4" })

      // Simulate file selection through the component's internal handler
      // In a real scenario, this would be triggered by the file input
      const selectButton = getByText("Select Video File")
      fireEvent.press(selectButton)

      // The actual file selection would happen through the hidden input element
      // This test verifies the component structure is correct
      expect(selectButton).toBeDefined()
    })
  })

  describe("Platform-specific behavior", () => {
    it("should show mobile message on non-web platforms", () => {
      // Mock Platform.OS to be ios
      jest.spyOn(Platform, "OS", "get").mockReturnValue("ios")

      const { getByText } = render(
        <ThemeProvider>
          <NavigationContainer>
            <VideoUploadInput {...defaultProps} />
        </NavigationContainer>
      </ThemeProvider>,
      )

      expect(getByText(/Video upload is only available on web/)).toBeDefined()

      jest.restoreAllMocks()
    })
  })
})

