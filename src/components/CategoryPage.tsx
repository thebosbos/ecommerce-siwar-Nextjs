'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/ProductCard'
import { useCategories, useProductsByCategory } from '@/hooks/queries'
import { ErrorState } from '@/components/ErrorState'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface CategoryPageProps {
	categoryName: string
}

export default function CategoryPage({ categoryName }: CategoryPageProps) {
	const [searchTerm, setSearchTerm] = useState('')

	// Resolve the category id dynamically from its name instead of hardcoding it,
	// since category ids depend on what's actually seeded in the database.
	const { data: categories, isLoading: categoriesLoading } = useCategories()
	const category = categories?.find(
		(c) => c.name.toLowerCase() === categoryName.toLowerCase()
	)

	// Use TanStack Query hook instead of manual state management
	const {
		data: products,
		isLoading: productsLoading,
		error,
		refetch: fetchProducts,
	} = useProductsByCategory(category?.id ?? 0)

	const loading = categoriesLoading || (!!category && productsLoading)

	// Filter products based on search term using useMemo
	const filteredProducts = useMemo(() => {
		if (!products) return []

		if (searchTerm.trim() === '') {
			return products
		}

		return products.filter(
			(product) =>
				product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(product.description?.toLowerCase() || '').includes(
					searchTerm.toLowerCase()
				)
		)
	}, [searchTerm, products])


	return (
		<ErrorBoundary>
			<div className="bg-background min-h-screen">
				<div className="container mx-auto px-4">
					<div className="space-y-4 py-4">
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<h1 className="mb-4 text-3xl font-bold">{categoryName}</h1>
						</motion.div>

						{/* Search Input */}
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="mx-auto w-full max-w-md"
						>
							<Input
								type="text"
								placeholder={`Search ${categoryName.toLowerCase()}...`}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
						</motion.div>

						<div className="mt-6">
							<AnimatePresence mode="wait">
								{loading ? (
									<motion.div
										key="loader"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="flex min-h-[200px] items-center justify-center"
									>
										<motion.div
											animate={{ rotate: 360 }}
											transition={{
												duration: 1,
												repeat: Infinity,
												ease: 'linear',
											}}
											className="border-primary h-8 w-8 rounded-full border-t-2 border-b-2"
										/>
									</motion.div>
								) : error ? (
									<motion.div
										key="error"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
									>
										<ErrorState
											title={`Failed to load ${categoryName.toLowerCase()}`}
											description={`We couldn't load the ${categoryName.toLowerCase()} products. Please try again.`}
											onRetry={fetchProducts}
											error={error}
											type="network"
										/>
									</motion.div>
								) : filteredProducts.length === 0 ? (
									<motion.div
										key="empty"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
									>
										<ErrorState
											title={`No ${categoryName.toLowerCase()} found`}
											description={
												searchTerm
													? 'Try a different search term'
													: `No ${categoryName.toLowerCase()} products are available right now.`
											}
											showRetry={!searchTerm}
											onRetry={!searchTerm ? fetchProducts : undefined}
											type="not-found"
										/>
									</motion.div>
								) : (
									<motion.div
										key="products"
										className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.3 }}
									>
										<AnimatePresence>
											{filteredProducts.map((product, index) => (
												<motion.div
													key={product.product_id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -20 }}
													transition={{
														duration: 0.3,
														delay: index * 0.1,
													}}
												>
													<ProductCard product={product} />
												</motion.div>
											))}
										</AnimatePresence>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</ErrorBoundary>
	)
}

