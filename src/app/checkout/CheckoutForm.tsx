"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useAddresses, useCreateAddress } from "@/hooks/queries/use-addresses";
import { useCreateOrder } from "@/hooks/queries/use-orders";
import { toast } from "sonner";

const SHIPPING_COST = 5.99;

interface FormData {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, subtotal, isLoading: cartLoading, clearCart } = useCart();

  const { data: addresses } = useAddresses(user?.id || "");
  const createAddress = useCreateAddress();
  const createOrder = useCreateOrder();

  const [formData, setFormData] = useState<FormData>({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill from the user's most recent (or default) saved address
  useEffect(() => {
    if (!addresses || addresses.length === 0) return;
    const preferred = addresses.find((a) => a.is_default) || addresses[0];
    setFormData({
      street: preferred.street || "",
      city: preferred.city || "",
      state: preferred.state || "",
      zip_code: preferred.zip_code || "",
      country: preferred.country || "",
      phone: preferred.phone || "",
    });
  }, [addresses]);

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartLoading, cartItems, router]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.street.trim()) newErrors.street = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zip_code.trim()) newErrors.zip_code = "ZIP code is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const total = subtotal + SHIPPING_COST;

  const handleConfirm = async () => {
    if (!user) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const address = await createAddress.mutateAsync({
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zip_code: formData.zip_code.trim(),
          country: formData.country.trim(),
          phone: formData.phone.trim(),
          is_default: true,
        },
        userId: user.id,
      });

      const order = await createOrder.mutateAsync({
        userId: user.id,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: address,
        totalAmount: total,
        paymentMethod: "Cash on Delivery",
      });

      await clearCart();
      router.push(`/checkout/success?order_id=${order.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center">
        <Link href="/cart" className="text-primary flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
        <h1 className="ml-4 text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  placeholder="123 Main St"
                  className={errors.street ? "border-destructive" : ""}
                />
                {errors.street && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.street}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="City"
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    placeholder="State (optional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="zip_code">ZIP / Postal Code *</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleChange("zip_code", e.target.value)}
                    placeholder="ZIP code"
                    className={errors.zip_code ? "border-destructive" : ""}
                  />
                  {errors.zip_code && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.zip_code}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="Country"
                    className={errors.country ? "border-destructive" : ""}
                  />
                  {errors.country && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 555 123 4567"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3">
                  <Image
                    src={item.image || ""}
                    alt={item.title}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${SHIPPING_COST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full cursor-pointer"
                onClick={handleConfirm}
                disabled={isSubmitting || cartItems.length === 0}
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                {isSubmitting ? "Placing order..." : "Confirm Order"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
