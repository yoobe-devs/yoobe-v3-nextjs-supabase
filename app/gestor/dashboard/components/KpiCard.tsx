import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Info } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  delta: string
  hint: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function KpiCard({
  title,
  value,
  delta,
  hint,
  icon: Icon,
  color,
}: KpiCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
  }

  const deltaColor = delta.startsWith('+')
    ? 'text-green-600'
    : delta.startsWith('-')
      ? 'text-red-600'
      : 'text-gray-600'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                <Info className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Próxima Ação</h4>
                <p className="text-sm text-muted-foreground">{hint}</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span className={deltaColor}>{delta}</span> vs período anterior
        </p>
      </CardContent>
    </Card>
  )
}
