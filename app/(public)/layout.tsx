import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import { getSiteSettings } from '@/lib/site-settings/actions'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSiteSettings()

  return (
    <>
      <Navbar settings={settings.headerFooter} />
      {children}
      <Footer settings={settings.headerFooter} />
      <ScrollToTop />
    </>
  )
}
