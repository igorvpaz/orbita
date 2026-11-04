export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
    requested: 'Solicitado',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Recusado',
  }
  return labels[status] ?? 'Não informado'
}
