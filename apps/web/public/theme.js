// Runs before the page is painted, including on the first visit.
;(() => {
  let preference
  try {
    preference = localStorage.getItem('orbita_theme')
  } catch {}
  const dark =
    preference === 'dark' ||
    (preference !== 'light' &&
      matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
})()
