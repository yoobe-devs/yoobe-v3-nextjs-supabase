'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  email: string
  status: string
}

interface CompanySelectProps {
  value?: string
  onValueChange: (value: string) => void
  mode: 'internal' | 'b2b'
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CompanySelect({
  value,
  onValueChange,
  mode,
  placeholder = 'Selecionar empresa...',
  disabled = false,
  className,
}: CompanySelectProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const fetchCompanies = async (searchTerm: string = '') => {
    try {
      setLoading(true)

      // Get user info from localStorage or context
      const userInfo = localStorage.getItem('userInfo')
      if (!userInfo) {
        toast.error('Informações de usuário não encontradas')
        return
      }

      const {
        id: userId,
        role: userRole,
        company_id: userCompanyId,
      } = JSON.parse(userInfo)

      const params = new URLSearchParams()
      params.set('mode', mode)
      if (searchTerm) {
        params.set('q', searchTerm)
      }

      const response = await fetch(
        `/api/budgets/company-options?${params.toString()}`,
        {
          headers: {
            'X-User-ID': userId,
            'X-User-Role': userRole,
            'X-User-Company-ID': userCompanyId || '',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao carregar empresas')
      }

      const data = await response.json()
      setCompanies(data.items || [])
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar empresas')
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  // Load companies on mount
  useEffect(() => {
    fetchCompanies()
  }, [mode])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== '') {
        fetchCompanies(search)
      } else {
        fetchCompanies()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, mode])

  const selectedCompany = companies.find(company => company.id === value)
  const filteredCompanies = companies.filter(
    company =>
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={selectedCompany ? selectedCompany.name : placeholder}
          disabled={disabled}
          className={className}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled}
        >
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">Carregando...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              Nenhuma empresa encontrada
            </div>
          ) : (
            <div className="py-1">
              {filteredCompanies.map(company => (
                <button
                  key={company.id}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    onValueChange(company.id)
                    setSearch('')
                    setShowDropdown(false)
                  }}
                >
                  <Building2 className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-sm text-gray-500">
                      {company.email}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
