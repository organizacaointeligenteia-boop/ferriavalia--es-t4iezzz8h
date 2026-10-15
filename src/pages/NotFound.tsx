/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F8F7] px-4">
      <div className="text-center bg-white p-8 rounded-lg border border-[#D8E2E0] shadow-sm max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-[#8A6D1A] flex items-center justify-center mx-auto font-bold text-lg">
          404
        </div>
        <h1 className="text-xl font-bold text-[#0B3B4F]">Página não encontrada</h1>
        <p className="text-sm text-[#52656B]">
          A rota solicitada não existe nesta demonstração de Ferri &amp; Ferri.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#0B3B4F] text-white text-xs font-semibold hover:bg-[#09546B] transition-colors"
        >
          Retornar à Página Inicial
        </a>
      </div>
    </div>
  )
}

export default NotFound
