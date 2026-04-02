import BlogPostClient from './BlogPostClient'

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`)
    const posts = await res.json() as { slug: string }[]
    if (Array.isArray(posts) && posts.length > 0) {
      return posts.map(p => ({ slug: p.slug }))
    }
  } catch {}
  return [{ slug: '_' }]
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <BlogPostClient slug={slug} />
}
