"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  adminProductService,
  CreateProductData,
  ProductWithDetails,
} from "@/services/admin/adminProductService";
import { useCategories } from "@/hooks/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductData) => Promise<void>;
  product?: ProductWithDetails | null;
  title: string;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  image: string;
  stock: string;
  sku: string;
  category_id: string;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  title,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    image: "",
    stock: "",
    sku: "",
    category_id: "no-category",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the query hook to fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        image: product.image || "",
        stock: product.stock?.toString() || "",
        sku: product.sku || "",
        category_id: product.category_id?.toString() || "no-category",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        price: "",
        image: "",
        stock: "",
        sku: "",
        category_id: "no-category",
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number";
      }
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "Stock is required";
    } else {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Stock must be a non-negative number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData: CreateProductData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim() || undefined,
        stock: parseInt(formData.stock),
        sku: formData.sku.trim() || undefined,
        category_id:
          formData.category_id && formData.category_id !== "no-category"
            ? parseInt(formData.category_id)
            : undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(
        `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      );
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)");
      return;
    }

    try {
      setUploading(true);
      const publicUrl = await adminProductService.uploadProductImage(file);
      handleInputChange("image", publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {product ? "Edit product details" : "Create a new product"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter product title"
              className={
                errors.title
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : ""
              }
            />
            {errors.title && (
              <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={3}
              className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                errors.description
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-slate-300 focus:ring-blue-500"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                className={
                  errors.price
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    : ""
                }
              />
              {errors.price && (
                <p className="mt-1 text-sm text-rose-600">{errors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                className={
                  errors.stock
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    : ""
                }
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-rose-600">{errors.stock}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => handleInputChange("sku", e.target.value)}
              placeholder="Product SKU (optional)"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            {categoriesError && (
              <div className="border-destructive/30 bg-destructive/10 mt-1 mb-2 space-y-2 rounded-md border p-2 text-sm">
                <p className="text-destructive">{categoriesError.message}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => void refetchCategories()}
                >
                  Retry categories
                </Button>
              </div>
            )}
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                handleInputChange("category_id", value ?? "")
              }
              disabled={categoriesLoading || !!categoriesError}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-category">No category</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Product Image</Label>
            <div className="mt-1 flex items-center gap-3">
              {formData.image && (
                <Image
                  src={formData.image}
                  alt="Product preview"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-md border object-cover"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                {uploading ? "Uploading..." : "Upload from computer"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </div>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleInputChange("image", e.target.value)}
              placeholder="Or paste an image URL"
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
