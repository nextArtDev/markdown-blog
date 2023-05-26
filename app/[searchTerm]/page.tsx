import React from 'react'

type Props = {
  params: {
    searchTerm: string
  }
}

function page({ params: { searchTerm: string } }: Props) {
  return <div>page</div>
}

export default page
