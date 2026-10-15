/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
      <div className="w-12 h-12 rounded-full bg-[#0A1F33] text-[#E5C048] flex items-center justify-center mx-auto font-bold text-lg border border-[#C9A227]/40">
        !
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#0A1F33]">Página não encontrada</h1>
        <p className="text-xs text-slate-600">
          O endereço solicitado não existe neste protótipo demonstrativo.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 text-xs font-semibold hover:bg-[#132E4A] transition-colors"
      >
        Voltar à página inicial
      </Link>
    </div>
  )
}

export default NotFound
