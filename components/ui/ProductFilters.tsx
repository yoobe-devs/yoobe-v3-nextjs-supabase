import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown, X } from 'lucide-react'

interface ProductFiltersProps {
  categories: Array<{
    id: string
    name: string
    products_count: number
  }>
  filters: {
    category: string
    featured: boolean
    colors: string[]
    sizes: string[]
    tags: string[]
  }
  onFiltersChange: (filters: Partial<typeof filters>) => void
  availableOptions?: {
    colors: string[]
    sizes: string[]
    tags: string[]
  }
}

export function ProductFilters({
  categories,
  filters,
  onFiltersChange,
  availableOptions = { colors: [], sizes: [], tags: [] },
}: ProductFiltersProps) {
  const [openSections, setOpenSections] = React.useState({
    category: true,
    colors: true,
    sizes: true,
    tags: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      category: categoryId === filters.category ? '' : categoryId,
    })
  }

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color]
    onFiltersChange({ colors: newColors })
  }

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size]
    onFiltersChange({ sizes: newSizes })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    onFiltersChange({ tags: newTags })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      category: '',
      featured: false,
      colors: [],
      sizes: [],
      tags: [],
    })
  }

  const hasActiveFilters =
    filters.category ||
    filters.featured ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.tags.length > 0

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filtro de categoria */}
      <Collapsible
        open={openSections.category}
        onOpenChange={() => toggleSection('category')}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
          <span className="font-medium">Categoria</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openSections.category ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 p-2">
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.category === category.id}
                  onCheckedChange={() => handleCategoryChange(category.id)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="flex-1 cursor-pointer"
                >
                  {category.name}
                  <span className="text-gray-500 ml-2">
                    ({category.products_count})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Filtro de destaque */}
      <div className="flex items-center space-x-2 p-2">
        <Checkbox
          id="featured"
          checked={filters.featured}
          onCheckedChange={checked => onFiltersChange({ featured: !!checked })}
        />
        <Label htmlFor="featured" className="cursor-pointer">
          Apenas produtos em destaque
        </Label>
      </div>

      {/* Filtro de cores */}
      {availableOptions.colors.length > 0 && (
        <Collapsible
          open={openSections.colors}
          onOpenChange={() => toggleSection('colors')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
            <span className="font-medium">Cores</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openSections.colors ? 'rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2">
            <div className="flex flex-wrap gap-2">
              {availableOptions.colors.map(color => (
                <Badge
                  key={color}
                  variant={
                    filters.colors.includes(color) ? 'default' : 'outline'
                  }
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleColorToggle(color)}
                >
                  {color}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Filtro de tamanhos */}
      {availableOptions.sizes.length > 0 && (
        <Collapsible
          open={openSections.sizes}
          onOpenChange={() => toggleSection('sizes')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
            <span className="font-medium">Tamanhos</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openSections.sizes ? 'rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2">
            <div className="flex flex-wrap gap-2">
              {availableOptions.sizes.map(size => (
                <Badge
                  key={size}
                  variant={filters.sizes.includes(size) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSizeToggle(size)}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Filtro de tags */}
      {availableOptions.tags.length > 0 && (
        <Collapsible
          open={openSections.tags}
          onOpenChange={() => toggleSection('tags')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
            <span className="font-medium">Tags</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openSections.tags ? 'rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2">
            <div className="flex flex-wrap gap-2">
              {availableOptions.tags.map(tag => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Filtros ativos:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleCategoryChange('')}
              >
                Categoria:{' '}
                {categories.find(c => c.id === filters.category)?.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.featured && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onFiltersChange({ featured: false })}
              >
                Destaque
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {filters.colors.map(color => (
              <Badge
                key={color}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleColorToggle(color)}
              >
                {color}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.sizes.map(size => (
              <Badge
                key={size}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleSizeToggle(size)}
              >
                {size}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

