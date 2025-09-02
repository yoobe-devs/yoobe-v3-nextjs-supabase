import { z } from 'zod'

// Base schemas
export const AddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  country: z.string().min(1, 'País é obrigatório'),
  zip_code: z.string().min(1, 'CEP é obrigatório'),
  is_default: z.boolean().default(false)
})

export const UserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  surname: z.string().optional(),
  phone: z.string().optional(),
  tax_id: z.string().optional(),
  fiscal_regime: z.string().optional(),
  role: z.enum(['superadmin', 'admin_gestor', 'gestor', 'funcionario']).default('funcionario')
})

export const CompanySchema = z.object({
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  tax_id: z.string().optional()
})

// Cart schemas
export const AddToCartDTO = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int().positive('Quantidade deve ser um número positivo'),
  unitPrice: z.number().nonnegative('Preço unitário deve ser não negativo'),
  points: z.number().int().nonnegative('Pontos devem ser não negativos'),
  metadata: z.record(z.any()).optional()
})

export const CartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  points: z.number().int().nonnegative(),
  metadata: z.record(z.any()).optional()
})

// Checkout schemas
export const StartCheckoutDTO = z.object({
  paymentMethod: z.enum(['points', 'credit_card', 'pix', 'debit', 'boleto', 'donation']),
  shipping: AddressSchema.optional(),
  billing: AddressSchema.optional(),
  meta: z.record(z.any()).optional()
})

export const CheckoutSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  companyId: z.string().uuid().optional(),
  cartSnapshot: z.record(z.any()),
  paymentMethod: z.string(),
  amount: z.number().nonnegative(),
  points: z.number().int().nonnegative(),
  status: z.enum(['draft', 'pending_payment', 'paid', 'failed', 'abandoned']),
  shippingAddress: z.record(z.any()).optional(),
  billingAddress: z.record(z.any()).optional(),
  meta: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

// Quote schemas
export const QuoteItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int().positive('Quantidade deve ser um número positivo'),
  unitPrice: z.number().nonnegative('Preço unitário deve ser não negativo')
})

export const CreateQuoteDTO = z.object({
  companyId: z.string().uuid('ID da empresa inválido'),
  items: z.array(QuoteItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  notes: z.string().optional()
})

export const UpdateQuoteStatusDTO = z.object({
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired', 'paid']),
  notes: z.string().optional()
})

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  requestedBy: z.string().uuid(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired', 'paid']),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().nonnegative(),
  notes: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().optional(),
  paidAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

// Payment schemas
export const CreatePaymentDTO = z.object({
  quoteId: z.string().uuid().optional(),
  redemptionId: z.string().uuid().optional(),
  method: z.enum(['points', 'credit_card', 'pix', 'debit', 'boleto', 'donation']),
  provider: z.string().optional(),
  externalId: z.string().optional(),
  amount: z.number().nonnegative('Valor deve ser não negativo')
})

export const PaymentWebhookDTO = z.object({
  externalId: z.string(),
  status: z.enum(['paid', 'failed', 'pending']),
  amount: z.number().nonnegative(),
  metadata: z.record(z.any()).optional()
})

// Redemption schemas
export const CreateRedemptionDTO = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  paymentMethod: z.enum(['points', 'credit_card', 'pix', 'debit', 'boleto', 'donation']),
  amount: z.number().nonnegative('Valor deve ser não negativo'),
  addressId: z.string().uuid().optional(),
  address: AddressSchema.optional() // For creating new address during checkout
})

export const RedemptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  paymentMethod: z.string(),
  amount: z.number().nonnegative(),
  addressId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'shipped', 'delivered', 'cancelled']),
  createdAt: z.string()
})

// Invitation schemas
export const CreateInvitationDTO = z.object({
  email: z.string().email('Email inválido'),
  companyId: z.string().uuid('ID da empresa inválido'),
  role: z.enum(['admin_gestor', 'gestor', 'funcionario']).default('funcionario')
})

export const AcceptInvitationDTO = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  user: UserSchema.omit({ role: true }) // Role comes from invitation
})

export const InvitationSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  companyId: z.string().uuid().optional(),
  status: z.enum(['pending', 'accepted', 'expired']),
  invitedBy: z.string().uuid().optional(),
  token: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
})

// Wallet schemas
export const WalletCreditDTO = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  amount: z.number().int().positive('Valor deve ser um número positivo'),
  reason: z.string().min(1, 'Motivo é obrigatório')
})

export const WalletDebitDTO = z.object({
  amount: z.number().int().positive('Valor deve ser um número positivo'),
  reason: z.string().min(1, 'Motivo é obrigatório')
})

export const WalletSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  balance: z.number().int(),
  updatedAt: z.string()
})

// Replication schemas
export const ReplicationSchema = z.object({
  id: z.string().uuid(),
  quoteId: z.string().uuid(),
  companyId: z.string().uuid(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  error: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional()
})

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    perPage: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
})

// Export types
export type Address = z.infer<typeof AddressSchema>
export type User = z.infer<typeof UserSchema>
export type Company = z.infer<typeof CompanySchema>
export type AddToCartDTO = z.infer<typeof AddToCartDTO>
export type CartItem = z.infer<typeof CartItemSchema>
export type StartCheckoutDTO = z.infer<typeof StartCheckoutDTO>
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>
export type QuoteItem = z.infer<typeof QuoteItemSchema>
export type CreateQuoteDTO = z.infer<typeof CreateQuoteDTO>
export type UpdateQuoteStatusDTO = z.infer<typeof UpdateQuoteStatusDTO>
export type Quote = z.infer<typeof QuoteSchema>
export type CreatePaymentDTO = z.infer<typeof CreatePaymentDTO>
export type PaymentWebhookDTO = z.infer<typeof PaymentWebhookDTO>
export type CreateRedemptionDTO = z.infer<typeof CreateRedemptionDTO>
export type Redemption = z.infer<typeof RedemptionSchema>
export type CreateInvitationDTO = z.infer<typeof CreateInvitationDTO>
export type AcceptInvitationDTO = z.infer<typeof AcceptInvitationDTO>
export type Invitation = z.infer<typeof InvitationSchema>
export type WalletCreditDTO = z.infer<typeof WalletCreditDTO>
export type WalletDebitDTO = z.infer<typeof WalletDebitDTO>
export type Wallet = z.infer<typeof WalletSchema>
export type Replication = z.infer<typeof ReplicationSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>


