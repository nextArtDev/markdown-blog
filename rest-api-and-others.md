---
title: "blog post"
date: "2023-26-05"
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

---
API Routes (PART 7 from dave )
===
the old way of doing api route (that is replaced by route handlers) is by creating a _pages_ file inside _src_ and creating **_api_** folder. inside it every thing is a route. 
inside _src/pages/api/example.ts_ :
```typescript
import {NextApiRequest, NextApiResponse} from 'next'
const handler = (req: NextApiRequest, res:NextApiResponse)=>{
  const body = req.body
  console.log(req.body)

//name of the cookie
  cookies = req.cookies.cookie

  res.status(200)..json({hello:'world'})
}
export default handler
```

and in the _client side_ we catch it by:
```typescript
'use client'

export default function Home(){
  const makeApiCall= async ()=>{
    await fetch('/api/example' , {
      method:'POST',
      body:JSON.stringify({hello:'world'})
    })
  }
  return <button onClick={makeApiCall}> make call</button>
}
```
## At the **new** way
since _next 13.2_ we do'nt need _pages_ directory, we just want an **_api_** folder inside _app_ dir and _page.ts_ inside a folder that would be the routes name, sth like this:
_app/api/hello/route.ts_
```typescript
//we no more need {NextApiRequest, NextApiResponse}
export async function POST(request: Request){
  //we don't access body by "req.body"!
  const body = await req.json()
  console.log(body)

//Instead of "res.status(200).json({hello:'world'})" we use "Response"
//We can pass "status", "headers" and "statusText" to it too!
//if we get an error we should switch to "NextResponse"
  return new Response(JSON.stringify({hello: "world"}), {status:200})

}
```

To access the _cookies_ and _headers_ like *Authorization* headers, next allow us to import **NextRequest** from "next/server"

```typescript
//Instead of "Request" we import "NextRequest"
export async function POST(request: NextRequest){
  const body = await req.json()

  const cookie = req.cookies.get('cookie')
  console.log(cookies)

  return new Response(JSON.stringify({hello: "world"}))

}
```
In this method we can **_redirect_** any request in GET requests.
```typescript
import {redirect} from 'next/navigation'
export async function POST(request: NextRequest){
  //We get not-found route because it doesn't exists
redirect('anyRoute.com')

  return new Response(JSON.stringify({hello: "world"}))

}
```
We can do _*streaming*_ too!

---
Some says to it work in production we need a _middleware.ts_ file at the *root* this file sets up headers to allow cross-origin requests and logs request metadata.

```typescript
import {NextResponse} from 'next/server'

export function middleware(request) {
  const origin = request.headers.get('origin');

  const response = NextResponse.next();
  //Alow to any source
  response.header.set("Access-Control-Allow-Origin" , "*")
  // What kind of endpoints you're using? 
  // OPTIONS is needed for get & post requests
  response.header.set("Access-Control-Allow-Methods" , "GET, POST, PUT, DELETE, OPTIONS")
  response.header.set("Access-Control-Allow-Headers" , "Content-type , Authorization")
  response.header.set("Access-Control-Max-Age" , "86400")

  return response
//when some one trying to access api/whatever
  export const config = {
    matcher:'/api/:path*'
  }
}
```

### Dave Points
1. we no more need to create an _api_ directory.
2. we can not have _route.ts_ in the same directory as _page.tsx_ 
3. TS warns about **Response.json()** and e use **NextResponse.json()** instead.


### Static Route Handlers
Route handlers are statically evaluated by default when using the _GET_ method with the _Response_ object.
```typescript
//we don't need the 'Request' object in GET, in Static Route
export async function GET() {
  return new Response('Hello , Next!')
}
```
#### Example for getting search params from request:

From http://localhost:3000/api/echo?nickname=Dave&hoby=guitar
it will return {
  "name":"Dave",
  "instrument":"guitar"
}

```typescript
import {NextResponse} from "next/server"

export async function GET(request: Request) {
  //URL is an object snd we can set/get by that
  const {searchParams} = new URL(request.url)

  const obj = Object.fromEntries(searchParams.entries())

  return NextResponse.json(obj)
}
```

#### Explaining _Object.fromEntries(searchParams.entries())_

>The **entries()** method of a URLSearchParams object returns an iterator that contains the [key, value] pairs of the query string parameters. For example, if the query string is _?name=John&age=30_, the entries() method will return an iterator with two entries: _["name", "John"] and ["age", "30"]_.
>The **Object.fromEntries()** static method was introduced in ECMAScript 2019. It takes an iterator of key-value pairs and returns a new object where each key-value pair is converted into a property of the object. For example, given the input _[['a', 1], ['b', 2]]_, the Object.fromEntries() method would return _{a: 1, b: 2}_.
>So, when we use Object.fromEntries() with the searchParams.entries() iterator, **we get a new object where each key is a query string parameter name and each value is a query string parameter value**. For example, if searchParams is the iterator for ?name=John&age=30, the resulting object obj would be {name: "John", age: "30"}.

### Dynamic Route Handlers
>Route handlers are evaluated dynamically when:

  * Using the Request object with the GET method.
  * Using any of the other HTTP methods.
  * Using Dynamic Functions like cookies and headers.
  * The Segment Config Options manually specifies dynamic mode.

for example for form data we use dynamic route handlers
example:

```javascript
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  });
  const product = await res.json();
 
  return NextResponse.json({ product });
}
```

===
# REST API
===

### GET Request

```typescript
export async function GET() {
  const res = await fetch(DATA_SOURCE_URL)

  const todos: Todo[] = await res.json()

  return NextResponse.json(todos)
}

```

### DELETE Request

```typescript
export async function DELETE(request: Request) {
  //Partial<T> is a built-in utility type in TypeScript that makes all properties of type T optional. This allows you to create a new type that has the same structure as T, but with fewer required properties. (GPT)
  const { id }: Partial<Todo> = await request.json()
  if (!id) return NextResponse.json({ message: 'Id is required' })

  await fetch(`${DATA_SOURCE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': API_KEY,
    },
  })

  return NextResponse.json({ message: `Todo ${id} deleted ` })
}
```
### PUT Request
```typescript
export async function PUT(request: Request) {
  const { userId, title, id, completed }: Partial<Todo> = await request.json()

//We can not check the 'complete' boolean value by "!", we should check it by "typeof" 
  if (!userId || !title || !id || typeof completed !== 'boolean')
    return NextResponse.json({ message: 'Missing required data ' })

  const res = await fetch(`${DATA_SOURCE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': API_KEY,
    },
    body: JSON.stringify({
      userId,
      title,
      completed,
    }),
  })

  const updatedTodo: Todo = await res.json()

  return NextResponse.json(updatedTodo)
}
```
## GET single TODO
**IF we want to create a dynamic request, we have to add _GET(request: Request)_**
We need "request" because we need get _id_ from it, because it's going to be in _url_ for dynamic routes.

```typescript
export async function GET(request: Request) {
  //we get id from last part of url; slice method indicates where we should start not the exact one
  //It adds 1 to the index of / to get the index of the first character in the last segment of the URL path.
  const id = request.url.slice(request.url.lastIndexOf('/') + 1)
  const res = await fetch(`${DATA_SOURCE_URL}/${id}`)

  const todo: Todo = await res.json()

  if (!todo.id) return NextResponse.json({ message: 'Todo not found' })
  return NextResponse.json(todo)
}

```
Instead of that complicated line of code we can get it from _params_ and **second parameter of API routes**

```TS
import { NextRequest, NextResponse } from 'next/server'

const DATA_SOURCE_URL = 'https://jsonplaceholder.typicode.com/todos'
type Props = {
  params: {
    id: string
  }
}
export async function GET(request: Request, { params: { id } }: Props) {
  //   const id = request.url.slice(request.url.lastIndexOf('/') + 1)
  const res = await fetch(`${DATA_SOURCE_URL}/${id}`)

  const todo: Todo = await res.json()

  if (!todo.id) return NextResponse.json({ message: 'Todo not found' })
  return NextResponse.json(todo)
}

```
## Middleware

### Doc
Middleware allows you to run code before a request is completed.
Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.
**Middleware runs before cached content and routes are matched.**

* Convention
...Define the file _middleware.ts_ in the root.

#### Matching Paths
Middleware will be invoked for every route in your project in this order:
* headers from next.config.js
* redirects from next.config.js
* Middleware (rewrites, redirects, etc.)
* beforeFiles (rewrites) from next.config.js
* Filesystem routes (public/, _next/static/, pages/, app/, etc.)
* afterFiles (rewrites) from next.config.js
* Dynamic Routes (/blog/[slug])
* fallback (rewrites) from next.config.js

There are two ways to define which paths Middleware will run on:
* Custom matcher config
* Conditional statements

**Matcher**
matcher allows you to filter Middleware to run on specific paths.
```typescript
export const config = {
  matcher: '/about/:path*',
};
```
It can be single path or multiple path:
```typescript
export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
};
```
>The matcher config allows full regex so matching like negative lookaheads or character matching is supported. An example of a negative lookahead to match all except specific paths can be seen here:
```typescript
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```
##### Configured matchers:

* MUST start with _/_
* Can include named parameters: _/about/:path_ matches _/about/a_ and _/about/b_ but not _/about/a/c_
* Can have modifiers on named parameters (starting with :): _/about/:path*_ matches _/about/a/b/c_ because _*_ is zero or more. **?** is zero or one and + one or more
* Can use regular expression enclosed in parenthesis: _/about/(.*)_ is the same as _/about/:path*_

**Conditional Statements**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url));
  }
 
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url));
  }
}
```

**Using Cookies**
>Cookies are regular headers. On a Request, they are stored in the Cookie header. On a Response they are in the Set-Cookie header. Next.js provides a convenient way to access and manipulate these cookies through the cookies extension on NextRequest and NextResponse.

  * For incoming requests, cookies comes with the following methods: get, getAll, set, and delete cookies. You can check for the existence of a cookie with has or remove all cookies with clear.
  * For outgoing responses, cookies have the following methods get, getAll, set, and delete.

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function middleware(request: NextRequest) {
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
  let cookie = request.cookies.get('nextjs')?.value;
  console.log(cookie); // => 'fast'
  const allCookies = request.cookies.getAll();
  console.log(allCookies); // => [{ name: 'nextjs', value: 'fast' }]
 
  request.cookies.has('nextjs'); // => true
  request.cookies.delete('nextjs');
  request.cookies.has('nextjs'); // => false
 
  // Setting cookies on the response using the `ResponseCookies` API
  const response = NextResponse.next();
  response.cookies.set('vercel', 'fast');
  response.cookies.set({
    name: 'vercel',
    value: 'fast',
    path: '/test',
  });
  cookie = response.cookies.get('vercel');
  console.log(cookie); // => { name: 'vercel', value: 'fast', Path: '/test' }
  // The outgoing response will have a `Set-Cookie:vercel=fast;path=/test` header.
 
  return response;
}
```
**Setting Headers**
You can set request and response headers using the NextResponse API (setting request headers is available since Next.js v13.0.0).

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function middleware(request: NextRequest) {
  // Clone the request headers and set a new header `x-hello-from-middleware1`
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-hello-from-middleware1', 'hello');
 
  // You can also set request headers in NextResponse.rewrite
  const response = NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  });
 
  // Set a new response header `x-hello-from-middleware2`
  response.headers.set('x-hello-from-middleware2', 'hello');
  return response;
}
```

**Producing a Response**
You can respond from Middleware directly by returning a Response or NextResponse instance. (This is available since Next.js v13.1.0
)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@lib/auth';
 
// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
};
 
export function middleware(request: NextRequest) {
  // Call our authentication function to check the request
  if (!isAuthenticated(request)) {
    // Respond with JSON indicating an error message
    return new NextResponse(
      JSON.stringify({ success: false, message: 'authentication failed' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    );
  }
}
```

## Dave Middleware

It applies to _every_ request on the web application not just our API's,
thats because we may want to limit where that would apply.
```typescript
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  console.log('middleware')
  console.log(request.method)
  console.log(request.url)

  const origin = request.headers.get('origin')
  console.log(origin)
  //Just move on to the route that we're suppose to
  return NextResponse.next()
}

```
We can limit it like: **'/api/:path*'** which means this middleware will be applied to any file inside _api_ route

```typescript
export const config = {
  matcher: '/api/:path*',
}
```
**or** we can use _conditional_ statements, **or** **_regex_** expressions:
```typescript
const regex = new RegExp('/api/*')
  if (regex.test(request)){
    //TODO
  }

```

### limiter

We can use rate limiter with nextjs API;
It has a dependency that wont work on _Edge_ runtime!
 > npm i limiter
 we create a _config_ file inside _api_ and name it _limiter.ts_

 ```TS
 import { RateLimiter } from 'limiter'

export const limiter = new RateLimiter({
  //limit 3 tokens per minutes
  tokensPerInterval: 3,
  interval: 'min',
  //to make code asynchronously and continue th code:
  fireImmediately: true,
})
 ```

 Then we import it in any route we want:
 ```TS
 import {limiter} from '../config/limiter'

 export async function GET(request: REquest){

   const origin = request.headers.get('origin')
//it can be 1 or more to remove when rate breaks limit
  const remaining = await limiter.removeTokens(1)
//Response if we don't have enough token remaining
  if(remaining < 0 ){
    //the first param is body, if we want to send json or sth.
    return new NextResponse(null, {
      status:429,
      statusText: "Too many request",
      headers:{
        //We can define origin, is not required but its good if you work with cors, or put all
        "Access-Control-Allow-Origin": origin || '*',
        "Content-Type": "text/plain",
      }
    })
  }
  //rest of code
 }
 ```
 Its going to share token counts between files, we can use it in multiple places and routes and token will share between them or we can create different limiters for different routes.

 ### About CORS in Middleware
this will essentially blocks anything that is not in our list
 we can set: 
 ```TS
  const allowedOrigins = process.env.NODE_ENV === "production" ?
    ["https://www.yoursite.com","https://yoursite.com"]
    : ['http://localhost:3000', 'https://www.google.com']

 export function middleware(request: Request){
  const origin = request.headers.get('origin') 

  if(origin && !allowedOrigins.includes(origin)){
    return new NextResponse(null,{
      status: 400,
      statusText: "Bad Request",
      headers: {
        "Content-Type": "text/plain",
      }
    })
  }
 // more codes ... 
 }
 ```
 we can not test it by postman.
 **we should make sure to access cors in route too!**
and we should convert this:
 
```typescript
export async function GET() {
  const res = await fetch(DATA_SOURCE_URL)

  const todos: Todo[] = await res.json()

  return NextResponse.json(todos)
}

```

to this:


```typescript
export async function GET(request: Request) {
  const origin = request.headers.get('origin') 
  const res = await fetch(DATA_SOURCE_URL)

  const todos: Todo[] = await res.json()

  return new NextResponse(JSON.stringify(todos), {
    headers:{
// the '*' is for postman or thunder client
        "Access-Control-Allow-Origin": origin || '*',
        "Content-Type": "application/json",
  })
}

```
===
# Revalidating data

===

