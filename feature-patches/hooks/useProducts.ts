'use client'

import { useState, useEffect } from 'react'
import { 
  getProducts, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  type Product,
  type ProductCreateInput,
  type ProductUpdateInput
} from '@/lib/queries/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const createNewProduct = async (productData: ProductCreateInput) => {
    try {
      const newProduct = await createProduct(productData)
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create product')
    }
  }

  const updateExistingProduct = async (productData: ProductUpdateInput) => {
    try {
      const updatedProduct = await updateProduct(productData)
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      )
      return updatedProduct
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update product')
    }
  }

  const deleteExistingProduct = async (id: string) => {
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(product => product.id !== id))
      return true
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  const searchProductsQuery = async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchProducts(query)
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products')
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

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
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
        const data = await getProductById(id)
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return {
    product,
    loading,
    error
  }
}

