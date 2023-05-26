---
title: "Dave's ssg and ssr Next 13"
date: "2023-25-05"
---

## *lib* folder
We __can__ create a *lib* folder to place all fetching functions inside it to organize our code and possible reusability.
it should be in the **root** of our project

## _type_ define and _folderName.d.ts_ file
---
We can import types by *type* keyword 
```typescript
import type { Metadata } from "next";
```
---
we can create a _type_ definition like whats in root directory of next app: _next-env.d.ts_ for a type and we don't **need to import it!**
because _tsconfig.json_ **includes** it. 
we can name it: **types.d.ts** inside _root_ dir.

# Fetching Data
1. Fetch data on the server using Server Components.
2. Fetch data in parallel to minimize waterfalls and reduce loading times.
...It means do not *await* data for each request:

```typescript
const UserPage = async ({ params: { userId } }: UserPageProps) => {
  const userData: Promise<User> = getUser(userId)
  const userPostsData: Promise<Post[]> = getUserPosts(userId)
```

instead we're waiting to resolve them in **parallel** to not create waterfalls for awaiting for each request separately.
we request them at the same time.

```typescript
 const [user, userPosts] = await Promise.all([userData, userPostsData])
```

or we can **await** for one and **Suspense** another one!

```typescript
const userData: Promise<User> = getUser(userId)
  const userPostsData: Promise<Post[]> = getUserPosts(userId)
const user = await userData //One await
  return (
    <>
      <h2>{user.name}</h2>
      <br />
      <Suspense fallback={<h2>Loading</h2>}>
         <UserPosts promise={userPosts} />  //One promise 
      </Suspense>
    </>
  )
}
```

and then we get it in **UserPosts** component:
```typescript
interface UserPostsProps {
  promise: Promise<Post[]>
}

const UserPosts = async ({ promise }: UserPostsProps) => {
  const posts = await promise

  const content = posts.map((post) => {
    const { id, title, body } = post
    return (
      <article key={id}>
        <h2>{title}</h2>
        <p>{body}</p>
        <br />
      </article>
    )
  })
  return content
}
```

that **Suspense** cause to incrementally show the data we get.

---
when we request data in **generateMetadata** request will deduplicate and does not repeat again.

---
In **ssr** we fetch all the data in advanced. they are server side rendered pages, they're not statically generated. because *next* does not know how to send user id's and what they are.
we can get it by *npm run build* and *npm run start*

## Data caching:
by default it's **forced-cache** It means it knows the data after the first time.

```typescript
const getUserPosts = async (userId: string) => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${userId}` , {cache:"force-cache"}
  )
```
_cache:'no-store'_ or _always dynamic data_
>If the data **always is changing** we don't want to cache data and we use _no-store_ and it means w don't want old data.

 _next: { revalidate: 60 }_ or _Incremental Static Regeneration_ or _ISR_
 >To update specific static routes without needing to rebuild your entire site.
 There are two types of revalidation in Next.js:

    1. Background: Revalidates the data at a specific time interval.
>1. ...To revalidate cached data at a specific interval _next: { revalidate: 60 }_ 
    ...How it works?
    ...1. When a request is made to the route that was statically rendered at build time, it will initially show the cached data.
    ...1. Any requests to the route after the initial request and before 60 seconds are also cached and instantaneous.
    ...1. After the 60-second window, the next request will still show the cached (stale) data.
    ...1. Next.js will trigger a regeneration of the data in the background.
    ...1. Once the route generates successfully, Next.js will invalidate the cache and show the updated route.  
    1. On-demand: Revalidates the data based on an event such as an update.
      ...If you set a revalidate time of 60, all visitors will see the same generated version of your site for one minute. The only way to invalidate the cache is if someone visits the page after the minute has passed.
      ...await fetch('https://...', { next: { tags: ['collection'] } })

      ---
      ## Segment-level Caching
      >It allows you to cache and revalidate data used in route segments.
      This mechanism allows different segments of a path to control the cache lifetime of the entire route. Each _page.tsx_ and _layout.tsx_ in the route hierarchy can export a revalidate value that sets the revalidation time for the route.

      ```typescript
      export const revalidate = 60; // revalidate this segment every 60 seconds
      ```

# SSG or _Static Site Generation_
>It means the HTML page is generated at build time and in production. This HTML will then be reused on each request. It can be cached by a CDN. we can statically generate pages with or without data.
>1. Static Generation without data
...By default, Next.js pre-renders pages using Static Generation without fetching data.
```typescript
function About() {
  return <div>About</div>;
}
```
>1. Static Generation with data
  ...Some pages require fetching external data for pre-rendering. and there are two scenarios:
  ...1. Your page **content** depends on external data: Use getStaticProps (Example: Your blog page might need to fetch the list of blog posts from a CMS).
  ```typescript
  export default function Blog({ posts }) {
    return (
      <ul>
        {posts.map((post) => (
          <li>{post.title}</li>
        ))}
      </ul>
    );
  }
  ```
  >To fetch this data on pre-render, Next.js allows you to export an async function called getStaticProps from the same file. This function gets called at build time and lets you pass fetched data to the page's props on pre-render.

  ```typescript
  export default function Blog({ posts }) {
  // Render posts...
  }
  
  // This function gets called at build time
  export async function getStaticProps() {
    // Call an external API endpoint to get posts
    const res = await fetch('https://.../posts');
    const posts = await res.json();
  
    // By returning { props: { posts } }, the Blog component
    // will receive `posts` as a prop at build time
    return {
      props: {
        posts,
      },
    };
  }
  ```
  >...1. Your page **paths** depend on external data: Use getStaticPaths (usually in addition to getStaticProps).
  Next.js allows you to create pages with dynamic routes. For example, you can create a file called pages/posts/[id].js to show a single blog post based on id. This will allow you to show a blog post with id: 1 when you access posts/1.

  ```typescript
    // This function gets called at build time
  export async function getStaticPaths() {
    // Call an external API endpoint to get posts
    const res = await fetch('https://.../posts');
    const posts = await res.json();
  
    // Get the paths we want to pre-render based on posts
    const paths = posts.map((post) => ({
      params: { id: post.id },
    }));
  
    // We'll pre-render only these paths at build time.
    // { fallback: false } means other routes should 404.
    return { paths, fallback: false };
  }

  ```
===
  __OUR EXAMPLE__
  ```typescript
  export async function generateStaticParams() {
  const usersData: Promise<User[]> = getAllUsers()
  const users = await usersData

  return users.map((user) => ({
    //We providing them in advanced as we map over them, And Know nextjs statically generate them in advanced without the server side rendering!
    userId: user.id.toString(),
  }))
}
  ```
  __Amazingly! after first request at once, there is no more requests for posts!__ after build and start.
and its good to know _dynamicParams_

## _notFound_
We can create **not-found** file within a route segment or we can import _notFound_ at the top and from _next/navigation_ after that if there is an error, for example if user doesn't exists, it throw a _notFound_ error
```typescript
import { notFound } from 'next/navigation'
  const user = await userData

  if(!user.name){
    return {
      //Costume title for our not found error
      title : "User Not Found"
    }
  }
```
or using it like:
```typescript
if(!user.name) return notFound()
```
**_But we should return *undefined* for throwing new error on our functions_** :
```typescript
const getUserPosts = async (userId: string) => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
    { next: { revalidate: 60 } }
  )

  if (!res.ok) return undefined;
  return res.json()
}
```



>The notFound function allows you to render the not-found file within a route segment

**notFound()** Function:
>Invoking the notFound() function throws a NEXT_NOT_FOUND error and terminates rendering of the route segment in which it was thrown. Specifying a not-found file allows you to gracefully handle such errors by rendering a Not Found UI within the segment.
```typescript
import { notFound } from 'next/navigation';
 
async function fetchUsers(id) {
  const res = await fetch('https://...');
  if (!res.ok) return undefined;
  return res.json();
}
 
export default async function Profile({ params }) {
  const user = await fetchUser(params.id);
 
  if (!user) {
    notFound();
  }
 
  // ...
}
```