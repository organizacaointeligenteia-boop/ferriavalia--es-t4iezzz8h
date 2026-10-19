import pb from '@/lib/pocketbase/client'

export type ReportType = 'texto' | 'video'
export type ReportPivotStatus = 'pendente' | 'aprovado' | 'oculto'

export interface ReportRecord {
  id: string
  created: string
  updated: string
  author?: string
  tipo: ReportType
  texto?: string
  video_file?: string
  consentimento: boolean
  status_novo: ReportPivotStatus
  received_at_sp?: string
}

export interface CreateReportInput {
  author?: string
  tipo: ReportType
  texto?: string
  videoBlob?: Blob
  consentimento: boolean
}

/**
 * Retorna a URL pública de um arquivo de vídeo do PocketBase
 */
export function getReportVideoUrl(record: ReportRecord): string {
  if (!record.video_file) return ''
  return pb.files.getURL(record, record.video_file)
}

/**
 * Busca relatos aprovados para exibição pública no Mural
 */
export async function listApprovedReports(): Promise<ReportRecord[]> {
  try {
    const records = await pb.collection('reports').getFullList<ReportRecord>({
      filter: "status_novo = 'aprovado'",
      sort: '-created',
    })
    return records
  } catch (err) {
    // Se a coleção ainda estiver com regras restritas ou sem dados, retorna array vazio
    return []
  }
}

/**
 * Criação de relato pelo usuário (fica pendente para aprovação)
 */
export async function submitReport(
  input: CreateReportInput,
): Promise<{ success: boolean; message?: string }> {
  const formData = new FormData()
  formData.append('tipo', input.tipo)
  formData.append('status_novo', 'pendente')
  formData.append('consentimento', input.consentimento ? 'true' : 'false')

  const cleanAuthor = input.author?.trim() || 'Anônimo'
  formData.append('author', cleanAuthor)

  if (input.texto?.trim()) {
    formData.append('texto', input.texto.trim())
  }

  if (input.videoBlob) {
    const ext = input.videoBlob.type.includes('mp4') ? 'mp4' : 'webm'
    const fileName = `video_${Date.now()}.${ext}`
    formData.append('video_file', input.videoBlob, fileName)
  }

  // Gera timestamp no fuso de São Paulo
  const now = new Date()
  const spOffset = -3 * 60
  const spDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + spOffset * 60000)
  const formattedSp = `${String(spDate.getDate()).padStart(2, '0')}/${String(spDate.getMonth() + 1).padStart(2, '0')}/${spDate.getFullYear()} às ${String(spDate.getHours()).padStart(2, '0')}:${String(spDate.getMinutes()).padStart(2, '0')} (America/Sao_Paulo)`
  formData.append('received_at_sp', formattedSp)

  // Envio via SDK para a coleção
  try {
    await pb.collection('reports').create(formData)
    return {
      success: true,
      message:
        'Relato enviado com sucesso! Ele aparecerá no mural após a aprovação da nossa equipe.',
    }
  } catch (err: unknown) {
    // Tenta fallback via rota customizada do backend se o create direto na coleção for restrito por regras
    try {
      const resp = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: input.tipo,
          author: cleanAuthor,
          texto: input.texto?.trim() || '',
          consentimento: input.consentimento,
        }),
      })
      if (resp.ok) {
        return {
          success: true,
          message:
            'Relato enviado com sucesso! Ele aparecerá no mural após a aprovação da nossa equipe.',
        }
      }
    } catch {
      /* intentionally ignored */
    }

    const errorMsg = err instanceof Error ? err.message : 'Falha ao enviar relato'
    throw new Error(errorMsg)
  }
}

/**
 * Operações do Painel (requer autenticação de equipe)
 */
export async function listAllReportsForStaff(): Promise<ReportRecord[]> {
  return await pb.collection('reports').getFullList<ReportRecord>({
    sort: '-created',
  })
}

export async function updateReportStatusByStaff(
  id: string,
  status: ReportPivotStatus,
): Promise<ReportRecord> {
  return await pb.collection('reports').update<ReportRecord>(id, {
    status_novo: status,
  })
}

export async function deleteReportByStaff(id: string): Promise<boolean> {
  return await pb.collection('reports').delete(id)
}
