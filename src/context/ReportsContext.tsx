import React, { createContext, useContext, useState, ReactNode } from 'react'
import { SyntheticReport, INITIAL_SYNTHETIC_REPORTS, ReportStatus } from '@/data/mockReports'
import { formatDateTimeBRSaoPaulo, formatDateBR } from '@/lib/dateUtils'

interface CreateReportData {
  clientName?: string
  relato: string
  experienceDate: string // Formato YYYY-MM-DD vindo do date input
}

interface ReportsContextType {
  reports: SyntheticReport[]
  addReport: (data: CreateReportData) => SyntheticReport
  updateReportStatus: (id: string, newStatus: ReportStatus, note?: string) => void
  addReportDecision: (id: string, decisionNote: string) => void
  resetToInitial: () => void
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export const ReportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<SyntheticReport[]>(INITIAL_SYNTHETIC_REPORTS)

  const addReport = (data: CreateReportData): SyntheticReport => {
    const nextIndex = reports.length + 1
    const padIndex = String(nextIndex).padStart(3, '0')
    const id = `E2E_SYNTH_${padIndex}`
    const nowTimestamp = formatDateTimeBRSaoPaulo()

    const rawName = data.clientName?.trim()
    const syntheticName = rawName
      ? rawName.startsWith('E2E_SYNTH_')
        ? rawName
        : `E2E_SYNTH_${rawName}`
      : `E2E_SYNTH_Cliente_Voluntario_${padIndex}`

    const newReport: SyntheticReport = {
      id,
      clientName: syntheticName,
      relato: data.relato.trim(),
      experienceDate: formatDateBR(data.experienceDate),
      receivedAt: nowTimestamp,
      status: 'Recebido',
      history: [
        {
          timestamp: nowTimestamp,
          action: 'Relato voluntário registrado em memória (DEMO)',
          note: 'Formulário voluntário preenchido com consentimento prévio confirmado.',
        },
      ],
      decisions: [],
    }

    setReports((prev) => [newReport, ...prev])
    return newReport
  }

  const updateReportStatus = (id: string, newStatus: ReportStatus, note?: string) => {
    const timestamp = formatDateTimeBRSaoPaulo()
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== id) return rep
        return {
          ...rep,
          status: newStatus,
          history: [
            ...rep.history,
            {
              timestamp,
              action: `Status alterado para ${newStatus}`,
              note: note || undefined,
            },
          ],
        }
      }),
    )
  }

  const addReportDecision = (id: string, decisionNote: string) => {
    const timestamp = formatDateTimeBRSaoPaulo()
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== id) return rep
        return {
          ...rep,
          decisions: [
            ...rep.decisions,
            {
              timestamp,
              note: decisionNote.trim(),
            },
          ],
          history: [
            ...rep.history,
            {
              timestamp,
              action: 'Decisão humana registrada (simulado)',
              note: decisionNote.trim(),
            },
          ],
        }
      }),
    )
  }

  const resetToInitial = () => {
    setReports(INITIAL_SYNTHETIC_REPORTS)
  }

  return (
    <ReportsContext.Provider
      value={{
        reports,
        addReport,
        updateReportStatus,
        addReportDecision,
        resetToInitial,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) {
    throw new Error('useReports deve ser usado dentro de um ReportsProvider')
  }
  return ctx
}
