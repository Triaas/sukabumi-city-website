import { Navbar } from '@/app/components/Navbar' // Sesuaikan path jika error
import { Footer } from '@/app/components/Footer' // Sesuaikan path jika error
import ScrollToTop from '@/components/ScrollToTop'

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ScrollToTop />
    </>
  )
}