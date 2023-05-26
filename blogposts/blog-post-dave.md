---
title: "Next 13 blog post"
date: "2023-25-05"
---

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

