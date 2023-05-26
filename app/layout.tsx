import MyProfilePic from './components/MyProfilePic'
import Navbar from './components/Navbar'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Saeid's Blog",
  description: 'Created by Saeid M.Parast',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={` dark:bg-slate-800 ${inter.className}`}>
        <Navbar />
        <MyProfilePic />
        {children}
      </body>
    </html>
  )
}
