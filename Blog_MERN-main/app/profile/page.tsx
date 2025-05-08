import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Settings } from "lucide-react"
import FeaturedArticle from "@/components/featured-article"

export default function ProfilePage() {
  // This would come from your database
  const user = {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Full Stack Developer | MERN Enthusiast | Technical Writer",
    followers: 1243,
    following: 567,
    joinedDate: "January 2022",
  }

  const articles = [
    {
      id: "1",
      title: "Building Scalable MERN Applications: Best Practices",
      excerpt:
        "Learn how to structure your MongoDB, Express, React, and Node.js applications for maximum scalability and maintainability...",
      coverImage: "/placeholder.svg?height=400&width=600",
      publishedAt: "April 28, 2023",
      readTime: "12 min read",
      author: {
        name: user.name,
        avatar: user.avatar,
        username: user.username,
      },
      tags: ["MERN", "MongoDB", "Scalability"],
    },
    {
      id: "2",
      title: "Understanding TypeScript Generics",
      excerpt: "A deep dive into TypeScript generics and how they can make your code more reusable and type-safe...",
      coverImage: "/placeholder.svg?height=400&width=600",
      publishedAt: "May 2, 2023",
      readTime: "6 min read",
      author: {
        name: user.name,
        avatar: user.avatar,
        username: user.username,
      },
      tags: ["TypeScript", "JavaScript", "Web Development"],
    },
    {
      id: "3",
      title: "Optimizing MongoDB Queries",
      excerpt: "Learn advanced techniques for optimizing your MongoDB queries and improving database performance...",
      coverImage: "/placeholder.svg?height=400&width=600",
      publishedAt: "April 25, 2023",
      readTime: "9 min read",
      author: {
        name: user.name,
        avatar: user.avatar,
        username: user.username,
      },
      tags: ["MongoDB", "Database", "Performance"],
    },
  ]

  const bookmarkedArticles = [
    {
      id: "4",
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
      id: "5",
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

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </div>
            </div>
            <p className="mb-4">{user.bio}</p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-bold">{user.followers}</span> Followers
              </div>
              <div>
                <span className="font-bold">{user.following}</span> Following
              </div>
              <div>Joined {user.joinedDate}</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="stories">
          <TabsList className="mb-8">
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Published Stories</h2>
              <Link href="/new-story">
                <Button>Write a Story</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <FeaturedArticle key={article.id} article={article} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-8">
            <h2 className="text-2xl font-bold mb-4">Bookmarked Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedArticles.map((article) => (
                <FeaturedArticle key={article.id} article={article} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-8">
            <h2 className="text-2xl font-bold mb-4">About {user.name}</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Bio</h3>
                    <p>{user.bio}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Joined</h3>
                    <p>{user.joinedDate}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Topics of Interest</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Web Development", "MERN Stack", "JavaScript", "TypeScript", "MongoDB", "React", "Node.js"].map(
                        (topic) => (
                          <Link key={topic} href={`/topic/${topic.toLowerCase().replace(/\s+/g, "-")}`}>
                            <Button variant="outline" size="sm" className="rounded-full">
                              {topic}
                            </Button>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
