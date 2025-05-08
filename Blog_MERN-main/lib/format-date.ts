export function formatDate(dateString: string): string {
  const date = new Date(dateString)

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date"
  }

  // Get current date for comparison
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // If less than 1 day ago
  if (diffDays < 1) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60))

      if (diffMinutes < 1) {
        return "Just now"
      }

      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`
    }

    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  }

  // If less than 7 days ago
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  }

  // Format date as Month Day, Year
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return date.toLocaleDateString("en-US", options)
}
