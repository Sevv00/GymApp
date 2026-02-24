/**
 * Format date string to readable format
 * @param dateString ISO date string (e.g., "2024-01-15T10:30:00Z")
 * @returns Formatted date (e.g., "15-01-2024")
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"

  // Check for zero date (Go's default time.Time value)
  if (dateString.startsWith("0001-01-01")) return "N/A"

  try {
    const date = new Date(dateString)
    // Check if date is invalid
    if (isNaN(date.getTime())) return "N/A"
    
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(date)
      .replaceAll("/", "-")
  } catch {
    return "N/A"
  }
}

/**
 * Format date+time string to dd-mm-yyyy HH:mm:ss
 * @param dateString ISO date string (e.g., "2024-01-15T10:30:00Z")
 * @returns Formatted date+time (e.g., "15-01-2024 10:30:00")
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"

  if (dateString.startsWith("0001-01-01")) return "N/A"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"

    const datePart = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(date)
      .replaceAll("/", "-")

    const timePart = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date)

    return `${datePart} ${timePart}`
  } catch {
    return "N/A"
  }
}

/**
 * Format currency amount
 * @param amount Numeric amount
 * @param currency Currency code (default: "USD")
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number | null | undefined, currency = "USD"): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "N/A"
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

/**
 * Format full name from first and last name
 * @param firstName First name
 * @param lastName Last name
 * @returns Full name (e.g., "John Doe")
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const names = [firstName?.trim(), lastName?.trim()].filter(Boolean)
  return names.length > 0 ? names.join(" ") : "Unknown"
}

/**
 * Truncate text to specified length
 * @param text Text to truncate
 * @param length Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, length = 50): string {
  if (text.length <= length) return text
  return text.slice(0, length - 3) + "..."
}

/**
 * Capitalize first letter of string
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
