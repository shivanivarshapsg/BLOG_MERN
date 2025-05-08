"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import RichTextEditor from "@/components/rich-text-editor"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewStory() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault()
      if (!tags.includes(tagInput.trim()) && tags.length < 5) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file")
        return
      }

      // Create a local URL for preview
      const imageUrl = URL.createObjectURL(file)
      setCoverImage(imageUrl)
      setCoverImageFile(file)
      setError("")
    }
  }

  const generateExcerpt = (content: string): string => {
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

    // Limit to ~150 characters and add ellipsis if needed
    return plainText.length > 150 ? plainText.substring(0, 150) + "..." : plainText
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsPublishing(true)
    setError("")

    try {
      // Generate excerpt
      const excerpt = generateExcerpt(content)

      // First, upload the cover image if exists
      let coverImageUrl = ""
      if (coverImageFile) {
        const formData = new FormData()
        formData.append("file", coverImageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }

        const uploadData = await uploadResponse.json()
        coverImageUrl = uploadData.url
      }

      // Then create the article
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          coverImage: coverImageUrl,
          tags,
          authorId: user?.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to publish article")
      }

      const data = await response.json()

      // Redirect to the new article page
      router.push(`/article/${data.article._id}`)
    } catch (error) {
      console.error("Publishing failed:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsPublishing(false)
    }
  }

  // Create a preview of the markdown content
  const contentPreview =
    content.length > 150
      ? content
          .substring(0, 150)
          .replace(/#{1,6}\s?/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1") + "..."
      : content.replace(/#{1,6}\s?/g, "").replace(/\*\*(.*?)\*\*/g, "$1")

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Create a New Story</h1>
          <Button onClick={handlePublish} disabled={!title.trim() || !content.trim() || isPublishing}>
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePublish}>
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter your story title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover-image">Cover Image</Label>
              <Input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Recommended size: 1200x600 pixels. Max size: 5MB.</p>
              {coverImage && (
                <div className="relative mt-2 h-[200px] w-full">
                  <img
                    src={coverImage || "/placeholder.svg"}
                    alt="Cover"
                    className="h-full w-full object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setCoverImage(null)
                      setCoverImageFile(null)
                    }}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your story here..."
                className="min-h-[300px]"
              />
              <p className="text-xs text-muted-foreground">
                Use Markdown to format your content. You can use the toolbar above to help you.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                placeholder="Add tags (press Enter to add)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                disabled={tags.length >= 5}
              />
              <p className="text-xs text-muted-foreground">Add up to 5 tags to help readers discover your story</p>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40"} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user?.name || "Your Name"}</div>
                      <div className="text-xs text-muted-foreground">Just now • Draft</div>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{title || "Your Story Title"}</h2>
                  <p className="text-muted-foreground line-clamp-3">
                    {contentPreview || "Your story content will appear here..."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
