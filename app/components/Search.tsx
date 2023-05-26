'use client'

import { useRouter } from 'next/navigation'
import { FC, FormEvent, useState } from 'react'

interface SearchProps {}

const Search: FC<SearchProps> = ({}) => {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearch('')
    router.push(`/${search}/`)
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="flex justify-center md:justify-between"
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-white p-2 w-80 text-xl rounded-xl"
        placeholder="Search"
      />
      <button className="p-2 text-xl rounded-xl bg-slate-300 font-bold ml-2 ">
        {' '}
        🚀{' '}
      </button>
    </form>
  )
}

export default Search
