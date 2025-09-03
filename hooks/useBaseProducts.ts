'use client'

import { useState, useEffect } from 'react'
import { 
  getBaseProducts, 
  getBaseProductById,
  createBaseProduct,
  updateBaseProduct,
  deleteBaseProduct,
  searchBaseProducts,
  type BaseProduct,
  type BaseProductCreateInput,
  type BaseProductUpdateInput
} from '@/lib/queries/base-products'

export function useBaseProducts() {
  const [products, setProducts] = useState<BaseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getBaseProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch base products')
    } finally {
      setLoading(false)
    }
  }

  const createNewProduct = async (productData: BaseProductCreateInput) => {
    try {
      const newProduct = await createBaseProduct(productData)
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create base product')
    }
  }

  const updateExistingProduct = async (productData: BaseProductUpdateInput) => {
    try {
      const updatedProduct = await updateBaseProduct(productData)
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      )
      return updatedProduct
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update base product')
    }
  }

  const deleteExistingProduct = async (id: string) => {
    try {
      await deleteBaseProduct(id)
      setProducts(prev => prev.filter(product => product.id !== id))
      return true
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete base product')
    }
  }

  const searchProductsQuery = async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchBaseProducts(query)
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search base products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    create: createNewProduct,
    update: updateExistingProduct,
    delete: deleteExistingProduct,
    search: searchProductsQuery
  }
}

export function useBaseProduct(id: string | null) {
  const [product, setProduct] = useState<BaseProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setProduct(null)
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getBaseProductById(id)
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch base product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}
