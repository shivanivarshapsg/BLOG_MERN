export function calculateReadingTime(content: string): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/#{1,6}\s?/g, "") // Remove headings
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/\[(.*?)\]$$.*?$$/g, "$1") // Remove links
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`(.*?)`/g, "$1") // Remove inline code
    .replace(/>\s?(.*)/g, "$1") // Remove blockquotes
    .replace(/- (.*)/g, "$1") // Remove list items
    .replace(/\d+\. (.*)/g, "$1") // Remove numbered list items
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
    .trim()

  // Count words (split by whitespace)
  const words = plainText.split(/\s+/).filter(Boolean).length

  // Average reading speed: 200-250 words per minute
  // We'll use 225 words per minute
  const minutes = Math.ceil(words / 225)

  return `${minutes} min read`
}
