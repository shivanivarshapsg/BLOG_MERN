"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, Heart, MessageSquare, Share2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import CommentSection from "@/components/comment-section"
import MarkdownRenderer from "@/components/markdown-renderer"
import { useAuth } from "@/context/auth-context"
import { formatDate } from "@/lib/format-date"
import { Skeleton } from "@/components/ui/skeleton"

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch article")
        }

        const data = await response.json()
        setArticle(data)
        setLikesCount(data.likesCount || 0)

        // Check if user has liked the article
        if (user && data.likes && data.likes.includes(user.id)) {
          setIsLiked(true)
        }

        // Check if user has bookmarked the article
        if (user) {
          const checkBookmarkStatus = async () => {
            try {
              const bookmarkResponse = await fetch(`/api/users/bookmarks`)
              if (bookmarkResponse.ok) {
                const bookmarkData = await bookmarkResponse.json()
                const isBookmarked = bookmarkData.articles.some((a: any) => a.id === params.id)
                setIsBookmarked(isBookmarked)
              }
            } catch (error) {
              console.error("Error checking bookmark status:", error)
            }
          }

          checkBookmarkStatus()
        }
      } catch (error) {
        console.error("Error fetching article:", error)
        setError("Failed to load article")
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [params.id, user])

  const handleLike = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/articles/${params.id}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount)
      }
    } catch (error) {
      console.error("Error liking article:", error)
    }
  }

  const handleBookmark = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/articles/${params.id}/bookmark`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setIsBookmarked(data.bookmarked)
      }
    } catch (error) {
      console.error("Error bookmarking article:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <article className="max-w-3xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </article>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error || "Failed to load article"}</p>
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12 border">
              <AvatarImage
                src={article.author.avatar || "/placeholder.svg?height=40&width=40"}
                alt={article.author.name}
              />
              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/user/${article.author.username}`} className="font-medium hover:underline">
                  {article.author.name}
                </Link>
                {user && user.id !== article.author.id && (
                  <Button variant="outline" size="sm" className="h-7 rounded-full">
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(article.createdAt)}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1" onClick={handleLike}>
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                <span>{likesCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{article.comments?.length || 0}</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBookmark}>
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                <span className="sr-only">Bookmark</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>
          {article.coverImage && (
            <div className="relative h-[400px] w-full mb-8">
              <Image
                src={article.coverImage || "/placeholder.svg?height=400&width=800"}
                alt={article.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
        </header>
        <MarkdownRenderer content={article.content} className="mb-8" />
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag: string) => (
            <Link key={tag} href={`/topic/${tag.toLowerCase().replace(/\s+/g, "-")}`}>
              <Badge variant="outline" className="text-sm py-1 px-3 hover:bg-muted cursor-pointer">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage
                src={article.author.avatar || "/placeholder.svg?height=40&width=40"}
                alt={article.author.name}
              />
              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/user/${article.author.username}`} className="font-medium text-lg hover:underline">
                {article.author.name}
              </Link>
              <p className="text-sm text-muted-foreground">{article.author.bio}</p>
            </div>
          </div>
          {user && user.id !== article.author.id && <Button>Follow</Button>}
        </div>
        <Separator className="my-8" />
        <CommentSection articleId={article.id} />
      </article>
    </div>
  )
}
