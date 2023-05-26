# Searching and Routing Dynamically
We can route programmatically and dynamically in next js when we handle a form:

```typescript
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearch('')
    //Routing dynamically
    router.push(`/${search}/`)
  }
```
now to handle it we should create a dynamic route, for example: **[searchTerm]** and _page.tsx_ inside it.

# Generating Dynamic metaData

```typescript
//It accepts what dynamic routes accept and next will deduplicate the request
export async function generateMetadata({params:{searchTerm}}:Params){
    const wikiData: Promise<SearchResult> = getWikiResults(searchTerm)
    const data = await wikiData
    const displayTerm = searchTerm.replaceAll('%20', ' ' )
    //If not found
    if(!data?.query?.pages){
        return{
            title: `${displayTerm} Not Found`
        }
    }
    //results
    return {
        title:displayTerm,
        description: `Search results for ${displayTerm}`
    }

}
```

# Tailwind _prose_
**@tailwindcss/typography**

first install it: _npm install -D @tailwindcss/typography_
then add it to _tailwind.config.js_
```typescript
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...
  ],
}
```

>The official Tailwind CSS Typography plugin provides a set of prose classes you can use to add beautiful typographic defaults to any vanilla HTML you don’t control, like HTML rendered from Markdown, or pulled from a CMS.

## Formatting date by internationalization API
here we do that by _getFormattedDate_ function :

```typescript
return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(
    new Date(dateString)
  )
```

## Nested props in TS

```typescript

type Props = {
  params: { postId: string }
}
const Post = async ({ params}: Props) => {
    const {postId} = params
  return <div>Post</div>
}
```
# SSR and SSG

To create SSR dynamic pages an dynamic meta data we need:
```typescript
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
  const pubDate = getFormattedDate(date)
  //   const pubDate = date
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
```
Additionally to convert it to __**SSG**__ that is much more better, we need getStaticParams:

```typescript
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
  const pubDate = getFormattedDate(date)
  //   const pubDate = date
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
```

## ISR 