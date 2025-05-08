import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bookmark, Heart } from "lucide-react"
import FeaturedArticle from "@/components/featured-article"

export default function Home() {
  // This would come from your database
  const featuredArticles = [
    {
      id: "1",
      title: "The Future of Web Development: What's Next After React?",
      excerpt:
        "As React continues to dominate the frontend landscape, new frameworks and approaches are emerging that challenge its supremacy...",
      coverImage: "/placeholder.svg?height=400&width=600",
      publishedAt: "May 5, 2023",
      readTime: "8 min read",
      author: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "janesmith",
      },
      tags: ["Web Development", "React", "Frontend"],
    },
    {
      id: "2",
      title: "Building Scalable MERN Applications: Best Practices",
      excerpt:
        "Learn how to structure your MongoDB, Express, React, and Node.js applications for maximum scalability and maintainability...",
      coverImage: "/placeholder.svg?height=400&width=600",
      publishedAt: "April 28, 2023",
      readTime: "12 min read",
      author: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "johndoe",
      },
      tags: ["MERN", "MongoDB", "Scalability"],
    },
    {
      id: "3",
      title: "The Complete Guide to Next.js 14",
      excerpt:
        "Explore the latest features in Next.js 14 and how they can improve your development workflow and application performance...",
      coverImage: "/placeholder.svg?height=400&width=600",
      publishedAt: "April 15, 2023",
      readTime: "10 min read",
      author: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "alexj",
      },
      tags: ["Next.js", "React", "Performance"],
    },
  ]

  const trendingArticles = [
    {
      id: "4",
      title: "Understanding TypeScript Generics",
      excerpt: "A deep dive into TypeScript generics and how they can make your code more reusable and type-safe...",
      publishedAt: "May 2, 2023",
      readTime: "6 min read",
      author: {
        name: "Sarah Williams",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "sarahw",
      },
    },
    {
      id: "5",
      title: "Optimizing MongoDB Queries",
      excerpt: "Learn advanced techniques for optimizing your MongoDB queries and improving database performance...",
      publishedAt: "April 25, 2023",
      readTime: "9 min read",
      author: {
        name: "Michael Brown",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "michaelb",
      },
    },
    {
      id: "6",
      title: "State Management in 2023",
      excerpt: "A comparison of modern state management solutions for React applications...",
      publishedAt: "April 18, 2023",
      readTime: "7 min read",
      author: {
        name: "Emily Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        username: "emilyc",
      },
    },
  ]

  return (
    <div className="container py-8">
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Articles</h2>
          <Link href="/explore">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArticles.map((article) => (
            <FeaturedArticle key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Trending on BlogMERN</h2>
          <Link href="/trending">
            <Button variant="outline">More Trending</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingArticles.map((article, index) => (
            <Card key={article.id} className="overflow-hidden">
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
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                </div>
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
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Discover by Topic</h2>
          <Link href="/topics">
            <Button variant="outline">All Topics</Button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Web Development",
            "JavaScript",
            "React",
            "Node.js",
            "MongoDB",
            "Express",
            "Next.js",
            "TypeScript",
            "Frontend",
            "Backend",
            "Full Stack",
            "Database",
            "API",
            "Performance",
            "UI/UX",
          ].map((topic) => (
            <Link key={topic} href={`/topic/${topic.toLowerCase().replace(/\s+/g, "-")}`}>
              <Badge variant="outline" className="text-sm py-1 px-3 hover:bg-muted cursor-pointer">
                {topic}
              </Badge>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
