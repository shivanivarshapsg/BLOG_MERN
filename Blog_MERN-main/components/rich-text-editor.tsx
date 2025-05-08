"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Code, LinkIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your story here...",
  className,
}: RichTextEditorProps) {
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 })
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

  const handleSelectionChange = () => {
    if (textareaRef) {
      setSelection({
        start: textareaRef.selectionStart,
        end: textareaRef.selectionEnd,
      })
    }
  }

  useEffect(() => {
    const textarea = textareaRef
    if (textarea) {
      textarea.addEventListener("select", handleSelectionChange)
      textarea.addEventListener("click", handleSelectionChange)
      textarea.addEventListener("keyup", handleSelectionChange)

      return () => {
        textarea.removeEventListener("select", handleSelectionChange)
        textarea.removeEventListener("click", handleSelectionChange)
        textarea.removeEventListener("keyup", handleSelectionChange)
      }
    }
  }, [textareaRef])

  const insertFormat = (before: string, after = "") => {
    if (!textareaRef) return

    const newValue =
      value.substring(0, selection.start) +
      before +
      value.substring(selection.start, selection.end) +
      after +
      value.substring(selection.end)

    onChange(newValue)

    // Set focus back to textarea and update cursor position
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus()
        const newCursorPos = selection.end + before.length
        textareaRef.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const formatHandlers = {
    bold: () => insertFormat("**", "**"),
    italic: () => insertFormat("*", "*"),
    underline: () => insertFormat("<u>", "</u>"),
    heading1: () => insertFormat("# "),
    heading2: () => insertFormat("## "),
    quote: () => insertFormat("> "),
    bulletList: () => insertFormat("- "),
    numberedList: () => insertFormat("1. "),
    code: () => insertFormat("```\n", "\n```"),
    link: () => {
      const url = prompt("Enter URL:", "https://")
      if (url) {
        const selectedText = value.substring(selection.start, selection.end)
        const linkText = selectedText || "link text"
        insertFormat(`[${linkText}](`, `${url})`)
      }
    },
  }

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <div className="flex flex-wrap gap-1 p-1 border rounded-md bg-muted/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.bold}>
                <Bold className="h-4 w-4" />
                <span className="sr-only">Bold</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.italic}>
                <Italic className="h-4 w-4" />
                <span className="sr-only">Italic</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.underline}>
                <Underline className="h-4 w-4" />
                <span className="sr-only">Underline</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1 self-center" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.heading1}>
                <Heading1 className="h-4 w-4" />
                <span className="sr-only">Heading 1</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.heading2}>
                <Heading2 className="h-4 w-4" />
                <span className="sr-only">Heading 2</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1 self-center" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.bulletList}>
                <List className="h-4 w-4" />
                <span className="sr-only">Bullet List</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.numberedList}>
                <ListOrdered className="h-4 w-4" />
                <span className="sr-only">Numbered List</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.quote}>
                <Quote className="h-4 w-4" />
                <span className="sr-only">Quote</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quote</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1 self-center" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.code}>
                <Code className="h-4 w-4" />
                <span className="sr-only">Code Block</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatHandlers.link}>
                <LinkIcon className="h-4 w-4" />
                <span className="sr-only">Link</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Link</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <Textarea
        ref={setTextareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("min-h-[300px] resize-y font-mono", className)}
      />
    </div>
  )
}
