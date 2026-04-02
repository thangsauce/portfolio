import BlogPostClient from './BlogPostClient'

export async function generateStaticParams() {
  try {
    const posts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`)
      .then(r => r.json()) as { slug: string }[]
    return posts.map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostClient slug={params.slug} />
}
