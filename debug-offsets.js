// Quick debug script to check offsetTop values
const sections = ['beranda', 'profil', 'berita', 'opd', 'transparansi'];

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    console.log(Section # offsetTop:, el.offsetTop);
  } else {
    console.log(Section # NOT FOUND);
  }
});

// Test click navigation for each section
sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    const scrollTarget = el.offsetTop - 100;
    console.log(Click # would scroll to:, scrollTarget);
  }
});
