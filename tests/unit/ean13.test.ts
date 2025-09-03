describe('ean13 generation (smoke)', () => {
  function ean13FromSku(sku: string): string {
    const digits = (sku || '').toUpperCase().replace(/[^A-Z0-9]/g, '').split('').map(ch => (/\d/.test(ch) ? parseInt(ch) : ((ch.charCodeAt(0) - 55) % 10)))
    const base: number[] = []
    for (let i = 0; i < 12; i++) base[i] = digits[i % digits.length] ?? 0
    const sum = base.reduce((acc, d, idx) => acc + d * (idx % 2 === 0 ? 1 : 3), 0)
    const check = (10 - (sum % 10)) % 10
    return base.join('') + String(check)
  }

  function valid(code: string) {
    if (!/^\d{13}$/.test(code)) return false
    const arr = code.split('').map(Number)
    const base = arr.slice(0, 12)
    const check = arr[12]
    const sum = base.reduce((acc, d, idx) => acc + d * (idx % 2 === 0 ? 1 : 3), 0)
    const exp = (10 - (sum % 10)) % 10
    return exp === check
  }

  it('generates 13 digits with valid checksum', () => {
    const sku = 'ABC-123'
    const code = ean13FromSku(sku)
    expect(code).toHaveLength(13)
    expect(valid(code)).toBe(true)
  })
})

