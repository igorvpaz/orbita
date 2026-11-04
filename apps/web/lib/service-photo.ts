// Local fictional photos keep the demonstration catalog complete.
// A private photo uploaded by the administrator always takes precedence.
export function servicePhoto(name: string, category: string) {
  const normalized = `${name} ${category}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const key = /podcast|estudio/.test(normalized)
    ? 'estudio-podcast'
    : /cafe|manha/.test(normalized)
      ? 'cafe-da-manha'
      : /almoco|gastronomia/.test(normalized)
        ? 'almoco'
        : /biciclet|mobilidade/.test(normalized)
          ? 'bicicletario'
          : /impress|produtividade/.test(normalized)
            ? 'impressao'
            : 'sala-executiva'
  return {
    image_url: `/services/${key}.webp`,
    alt_pt: `${name} — imagem ilustrativa fictícia`,
  }
}
