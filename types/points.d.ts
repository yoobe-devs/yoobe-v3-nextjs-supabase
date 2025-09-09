export interface PointsTransaction {
  id: string
  amount: number
  type: 'credit' | 'debit'
  created_at: string
}
export interface PointsBalance {
  balance: number
  pending: number
}
