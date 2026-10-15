export type ReportStatus = 'Recebido' | 'Em Revisão' | 'Arquivado' | 'Retirada Solicitada'

export interface ReportHistoryItem {
  timestamp: string // Formato: DD/MM/AAAA às HH:mm (America/São Paulo, UTC-3)
  action: string
  note?: string
}

export interface SyntheticReport {
  id: string // Prefixo E2E_SYNTH_
  clientName: string // Ex: E2E_SYNTH_Cliente_Demo
  relato: string
  experienceDate: string // Formato DD/MM/AAAA
  receivedAt: string // Formato DD/MM/AAAA às HH:mm (America/São Paulo, UTC-3)
  status: ReportStatus
  history: ReportHistoryItem[]
  decisions: {
    timestamp: string
    note: string
  }[]
}

export const INITIAL_SYNTHETIC_REPORTS: SyntheticReport[] = [
  {
    id: 'E2E_SYNTH_001',
    clientName: 'E2E_SYNTH_Cliente_Demo_Alpha',
    relato:
      'O atendimento inicial foi conduzido com clareza nas explicações e pontualidade na reunião remota. Todas as dúvidas preliminares sobre as etapas do procedimento foram esclarecidas com urbanidade e atenção.',
    experienceDate: '15/01/2025',
    receivedAt: '15/01/2025 às 14:32 (America/São Paulo, UTC-3)',
    status: 'Recebido',
    history: [
      {
        timestamp: '15/01/2025 às 14:32 (America/São Paulo, UTC-3)',
        action: 'Relato voluntário registrado em memória (DEMO)',
      },
    ],
    decisions: [],
  },
  {
    id: 'E2E_SYNTH_002',
    clientName: 'E2E_SYNTH_Cliente_Demo_Beta',
    relato:
      'Equipe demonstrou cordialidade e respeito aos prazos combinados para retorno dos contatos. Ambiente sóbrio e profissional durante o acolhimento da consulta inicial.',
    experienceDate: '10/01/2025',
    receivedAt: '11/01/2025 às 09:15 (America/São Paulo, UTC-3)',
    status: 'Em Revisão',
    history: [
      {
        timestamp: '11/01/2025 às 09:15 (America/São Paulo, UTC-3)',
        action: 'Relato voluntário registrado em memória (DEMO)',
      },
      {
        timestamp: '12/01/2025 às 11:00 (America/São Paulo, UTC-3)',
        action: 'Status alterado para Em Revisão',
        note: 'Triagem preliminar para conferência de ausência de dados sensíveis ou sigilosos.',
      },
    ],
    decisions: [
      {
        timestamp: '12/01/2025 às 11:05 (America/São Paulo, UTC-3)',
        note: 'Verificado que o relato não contém dados de terceiros ou termos vedados pelo Código de Ética e Disciplina da OAB. Mantido internamente.',
      },
    ],
  },
  {
    id: 'E2E_SYNTH_003',
    clientName: 'E2E_SYNTH_Cliente_Demo_Gama',
    relato:
      'Atendimento atencioso e respeitoso desde a recepção até a conferência documental inicial. Orientações claras quanto à necessidade de sigilo e prudência jurídica.',
    experienceDate: '04/01/2025',
    receivedAt: '05/01/2025 às 16:40 (America/São Paulo, UTC-3)',
    status: 'Arquivado',
    history: [
      {
        timestamp: '05/01/2025 às 16:40 (America/São Paulo, UTC-3)',
        action: 'Relato voluntário registrado em memória (DEMO)',
      },
      {
        timestamp: '08/01/2025 às 10:20 (America/São Paulo, UTC-3)',
        action: 'Status alterado para Arquivado',
        note: 'Revisão interna concluída. Armazenado apenas para fins de aprimoramento interno de atendimento.',
      },
    ],
    decisions: [
      {
        timestamp: '08/01/2025 às 10:25 (America/São Paulo, UTC-3)',
        note: 'Arquivamento deferido internamente. Registro mantido em arquivo passivo.',
      },
    ],
  },
  {
    id: 'E2E_SYNTH_004',
    clientName: 'E2E_SYNTH_Cliente_Demo_Delta',
    relato:
      'Atenção aos detalhes e postura ética durante a conversa com os advogados. Tiraram minhas dúvidas institucionais com transparência.',
    experienceDate: '28/12/2024',
    receivedAt: '29/12/2024 às 17:05 (America/São Paulo, UTC-3)',
    status: 'Retirada Solicitada',
    history: [
      {
        timestamp: '29/12/2024 às 17:05 (America/São Paulo, UTC-3)',
        action: 'Relato voluntário registrado em memória (DEMO)',
      },
      {
        timestamp: '02/01/2025 às 14:10 (America/São Paulo, UTC-3)',
        action: 'Status alterado para Retirada Solicitada',
        note: 'Cliente exerceu direito de retirada e revogação do envio voluntário.',
      },
    ],
    decisions: [
      {
        timestamp: '02/01/2025 às 14:15 (America/São Paulo, UTC-3)',
        note: 'Pedido de retirada acatado imediatamente conforme diretrizes éticas e de privacidade.',
      },
    ],
  },
]
