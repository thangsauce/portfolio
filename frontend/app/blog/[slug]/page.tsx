import dynamic from 'next/dynamic'

const BlogPostClient = dynamic(() => import('./BlogPostClient'), { ssr: false })

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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostClient slug={params.slug} />
}
