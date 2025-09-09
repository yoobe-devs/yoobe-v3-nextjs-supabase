import { z } from 'zod'

// Schema para validação de orçamentos
export const BudgetItemSchema = z.object({
  product_id: z.string().uuid('ID do produto deve ser um UUID válido'),
  quantity: z
    .number()
    .int()
    .positive('Quantidade deve ser um número inteiro positivo'),
  unit_price: z.number().positive('Preço unitário deve ser positivo'),
  notes: z.string().optional(),
})

export const CreateBudgetSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(255, 'Título muito longo'),
  description: z.string().optional(),
  items: z.array(BudgetItemSchema).min(1, 'Pelo menos um item é obrigatório'),
})

export const UpdateBudgetSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
  admin_notes: z.string().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
})

// Schema para validação de UUIDs
export const UUIDSchema = z.string().uuid('Deve ser um UUID válido')

// Schema para validação de IDs numéricos (BIGINT)
export const BigIntSchema = z
  .number()
  .int()
  .positive('Deve ser um número inteiro positivo')

// Schema para validação de produtos base
export const BaseProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  base_price: z.number().positive(),
  base_points_cost: z.number().int().min(0),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  category_id: z.string().uuid().optional(),
})

// Schema para validação de store products (quando implementado)
export const StoreProductSchema = z.object({
  id: z.number().int().positive(),
  store_id: z.string().uuid(),
  base_product_id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  points_cost: z.number().int().min(0),
  status: z.enum(['active', 'inactive', 'draft']),
  is_active: z.boolean(),
  quantity_available: z.number().int().min(0),
})

// Função para validar payload de orçamento
export function validateBudgetPayload(data: unknown) {
  try {
    return CreateBudgetSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      throw new Error(
        `Dados inválidos: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`
      )
    }
    throw error
  }
}

// Função para validar UUID
export function validateUUID(value: string, fieldName: string = 'ID') {
  try {
    UUIDSchema.parse(value)
    return true
  } catch (error) {
    throw new Error(`${fieldName} deve ser um UUID válido`)
  }
}

// Função para validar BIGINT
export function validateBigInt(value: number, fieldName: string = 'ID') {
  try {
    BigIntSchema.parse(value)
    return true
  } catch (error) {
    throw new Error(`${fieldName} deve ser um número inteiro positivo`)
  }
}
