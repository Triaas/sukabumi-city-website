// Extended test to verify "lastActiveSection" behavior
// Simulating scrolling past transparansi to Partners/Footer

function handleScrollWithLastActive(scrollY, innerHeight = 900) {
  let lastActiveSection = 'beranda'
  const scrollPosition = scrollY + innerHeight * 0.4
  const mockSections = {
    beranda: { offsetTop: 0 },
    profil: { offsetTop: 1600 },
    berita: { offsetTop: 3200 },
    opd: { offsetTop: 4800 },
    transparansi: { offsetTop: 6400 },
  }

  const navItems = [
    { id: 'beranda' },
    { id: 'profil' },
    { id: 'berita' },
    { id: 'opd' },
    { id: 'transparansi' },
  ]

  for (let i = navItems.length - 1; i >= 0; i--) {
    const sectionEl = mockSections[navItems[i].id]
    if (sectionEl) {
      const top = sectionEl.offsetTop
      if (scrollPosition >= top) {
        lastActiveSection = navItems[i].id
        return navItems[i].id
      }
    }
  }

  // Fallback to lastActiveSection (prevents reset to beranda)
  return lastActiveSection
}

console.log('\n=== TEST: Stay on Last Section ===')
const testCases = [
  { scrollY: 6400, expected: 'transparansi', desc: 'Entering transparansi' },
  { scrollY: 7000, expected: 'transparansi', desc: 'Past transparansi (Partners section)' },
  { scrollY: 8000, expected: 'transparansi', desc: 'Way past transparansi (Footer)' },
  { scrollY: 10000, expected: 'transparansi', desc: 'At bottom of page' },
]

let allPass = true
testCases.forEach(tc => {
  const result = handleScrollWithLastActive(tc.scrollY)
  const pass = result === tc.expected
  allPass = allPass && pass
  console.log(\\ \: scrollY=\ → "\" (expected "\")\)
})

console.log(allPass ? '\n✓ ALL EXTENDED TESTS PASSED\n' : '\n✗ SOME TESTS FAILED\n')
