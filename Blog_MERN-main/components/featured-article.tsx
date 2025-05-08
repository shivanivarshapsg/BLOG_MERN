import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, Heart } from "lucide-react"

interface Author {
  name: string
  avatar: string
  username: string
}

interface Article {
  id: string
  title: string
  excerpt: string
  coverImage: string
  publishedAt: string
  readTime: string
  author: Author
  tags: string[]
}

interface FeaturedArticleProps {
  article: Article
}

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image src={article.coverImage || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={article.author.avatar || "/placeholder.svg"} alt={article.author.name} />
            <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link href={`/user/${article.author.username}`} className="text-sm font-medium hover:underline">
            {article.author.name}
          </Link>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{article.publishedAt}</span>
        </div>
        <CardTitle className="line-clamp-2 hover:underline">
          <Link href={`/article/${article.id}`}>{article.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 pt-2">
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <Link key={tag} href={`/topic/${tag.toLowerCase().replace(/\s+/g, "-")}`}>
              <Badge variant="secondary" className="text-xs">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">{article.readTime}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Like</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bookmark className="h-4 w-4" />
              <span className="sr-only">Bookmark</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
