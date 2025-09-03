import { NextResponse } from 'next/server'

export async function GET() {
  const csv = 'name,description,category_id,base_price,image_url,sku,ncm\n' +
              'Camiseta Azul,Camiseta 100% algodão,cat-001,49.9,https://exemplo.com/img1.jpg,CAM-AZUL-001,61044300\n'
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="yoobe-import-template.csv"'
    }
  })
}

