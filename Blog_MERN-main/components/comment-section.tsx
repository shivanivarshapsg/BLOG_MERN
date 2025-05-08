"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Reply, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { formatDate } from "@/lib/format-date"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CommentSectionProps {
  articleId: string
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comment, setComment] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/comments`)

        if (response.ok) {
          const data = await response.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [articleId])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !user) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([...comments, data.comment])
        setComment("")
      }
    } catch (error) {
      console.error("Comment submission failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim() || !user) return

    try {
      const response = await fetch(`/api/articles/${articleId}/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: replyContent }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update the comments state with the new reply
        setComments(
          comments.map((c) => {
            if (c._id === commentId) {
              return {
                ...c,
                replies: [...c.replies, data.reply],
              }
            }
            return c
          }),
        )

        setReplyContent("")
        setReplyingTo(null)
      }
    } catch (error) {
      console.error("Reply submission failed:", error)
    }
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim() || !user) return

    try {
      const response = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update the comments state with the edited comment
        setComments(
          comments.map((c) => {
            if (c._id === commentId) {
              return {
                ...c,
                content: data.comment.content,
              }
            }
            return c
          }),
        )

        setEditContent("")
        setEditingComment(null)
      }
    } catch (error) {
      console.error("Comment update failed:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the deleted comment from state
        setComments(comments.filter((c) => c._id !== commentId))
      }
    } catch (error) {
      console.error("Comment deletion failed:", error)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/articles/${articleId}/comments/${commentId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()

        // Update the comments state with the updated likes
        setComments(
          comments.map((c) => {
            if (c._id === commentId) {
              return {
                ...c,
                likes: data.liked ? [...c.likes, user.id] : c.likes.filter((id: string) => id !== user.id),
              }
            }
            return c
          }),
        )
      }
    } catch (error) {
      console.error("Comment like failed:", error)
    }
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b pb-6">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2 resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!comment.trim() || isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-muted p-4 rounded-md mb-8 text-center">
          <p className="mb-2">Sign in to join the conversation</p>
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="border-b pb-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/user/${comment.user.username}`} className="font-medium hover:underline">
                    {comment.user.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                </div>

                {editingComment === comment._id ? (
                  <div className="mb-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="mb-2 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingComment(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateComment(comment._id)} disabled={!editContent.trim()}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mb-2">{comment.content}</p>
                )}

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => handleLikeComment(comment._id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${user && comment.likes.includes(user.id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                    <span>{comment.likes.length}</span>
                  </Button>

                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => {
                        setReplyingTo(replyingTo === comment._id ? null : comment._id)
                        setReplyContent("")
                      }}
                    >
                      <Reply className="h-4 w-4" />
                      <span>Reply</span>
                    </Button>
                  )}

                  {user && user.id === comment.user._id && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => {
                          setEditingComment(comment._id)
                          setEditContent(comment.content)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-red-500">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this comment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteComment(comment._id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>

                {replyingTo === comment._id && (
                  <div className="mt-4 pl-6 border-l">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="mb-2 resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment._id)}
                            disabled={!replyContent.trim()}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 pl-6 border-l">
                    {comment.replies.map((reply: any) => (
                      <div key={reply._id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.user.avatar || "/placeholder.svg"} alt={reply.user.name} />
                          <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/user/${reply.user.username}`} className="font-medium hover:underline">
                              {reply.user.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="mb-2">{reply.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs">
                              <Heart className="h-3 w-3" />
                              <span>{reply.likes.length}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
