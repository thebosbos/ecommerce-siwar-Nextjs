"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Plus, Edit, Trash2, FolderTree, Package } from "lucide-react";
import {
  adminCategoryService,
  CategoryWithCount,
  CreateCategoryData,
} from "@/services/admin/adminCategoryService";
import { toast } from "sonner";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminCategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      await adminCategoryService.createCategory(data);
      toast.success("Category created successfully");
      setShowCreateModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleUpdateCategory = async (data: CreateCategoryData) => {
    if (!editingCategory) return;
    try {
      await adminCategoryService.updateCategory(editingCategory.id, data);
      toast.success("Category updated successfully");
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setDeleting(true);
      await adminCategoryService.deleteCategory(deletingCategory.id);
      toast.success("Category deleted successfully");
      setDeletingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Category Management
          </h1>
          <p className="text-muted-foreground">
            Manage the categories products can be organized into
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge variant="secondary">
                  <Package className="mr-1 h-3 w-3" />
                  {category.product_count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                {category.description || "No description"}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                  className="hover:bg-accent/80 flex-1 cursor-pointer transition-all hover:scale-105"
                >
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingCategory(category)}
                  className="cursor-pointer text-red-600 transition-all hover:scale-105 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderTree className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-muted-foreground mb-2 text-lg font-medium">
              No categories found
            </h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first category.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      <CategoryFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCategory}
        title="Create New Category"
      />

      <CategoryFormModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdateCategory}
        category={editingCategory}
        title="Edit Category"
      />

      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        loading={deleting}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? ${
          deletingCategory && deletingCategory.product_count > 0
            ? `${deletingCategory.product_count} product(s) in this category will become uncategorized.`
            : "This action cannot be undone."
        }`}
      />
    </div>
  );
}
