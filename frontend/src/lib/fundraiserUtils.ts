/**
 * Converts a fundraiser icon (stored as byte array or base64 string) to a base64 data URL
 * Supports both string base64 and number array formats
 */
export const convertIconToBase64 = (
  icon: number[] | string | null | undefined,
): string | undefined => {
  if (!icon) return undefined
  if (typeof icon === "string") return `data:image/png;base64,${icon}`

  try {
    if (Array.isArray(icon)) {
      const bytes = new Uint8Array(icon)
      let binaryString = ""
      for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i])
      }
      return `data:image/png;base64,${btoa(binaryString)}`
    }
  } catch {
    return undefined
  }
}

/**
 * Reads a file and converts it to base64 string (without data URL prefix)
 */
export const readFileAsBase64 = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [, b64] = result.split(",")
      resolve(b64 || null)
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}
