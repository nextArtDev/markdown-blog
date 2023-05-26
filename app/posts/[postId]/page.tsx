import getFormattedDate from '@/lib/getFormattedDate'
import getPostData, { getSortedPostsData } from '@/lib/posts'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

type Props = {
  params: { postId: string }
}

export function generateStaticParams() {
  const posts = getSortedPostsData() //deduped
  //To create SSG
  return posts.map((post) => ({
    postId: post.id,
  }))
}
export const generateMetadata = ({ params }: Props) => {
  const posts = getSortedPostsData() //deduped
  const { postId } = params

  const post = posts.find((post) => post.id === postId)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }
  return {
    title: post.title,
  }
}

const Post = async ({ params }: Props) => {
  const posts = getSortedPostsData()
  const { postId } = params

  if (!posts.find((post) => post.id === postId)) {
    return notFound()
  }
  const { title, date, contentHtml } = await getPostData(postId)
  // const pubDate = getFormattedDate(date)
  const pubDate = date
  return (
    <main className="px-6 prose prose-xl prose-slate dark:prose-invert mx-auto ">
      <h1 className="text-3xl mt-4 mb-0">{title}</h1>
      <p className="mt-0">{pubDate}</p>
      <article>
        <section dangerouslySetInnerHTML={{ __html: contentHtml }} />
        <p>
          <Link href="/">⬅️ Back to home</Link>
        </p>
      </article>
    </main>
  )
}

export default Post
