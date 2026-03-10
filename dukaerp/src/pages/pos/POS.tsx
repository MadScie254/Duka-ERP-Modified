import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/common/SearchBar";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/hooks/useInventory";
import { useSales } from "@/hooks/useSales";
import { useCustomers } from "@/hooks/useCustomers";
import toast from "react-hot-toast";
import type { Product, PaymentMethod } from "@/types";

interface CartItem {
  product_id: string;
  name: string;
  qty: number;
  unit_price: number;
  cost_price: number;
}

const POS = () => {
  const { products } = useInventory();
  const { customers } = useCustomers();
  const { createSale } = useSales();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const allProducts = products.data ?? [];
  const filtered = search.length >= 1
    ? allProducts.filter((p) => p.is_active && (p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode ?? "").includes(search) || (p.sku ?? "").toLowerCase().includes(search.toLowerCase()))).slice(0, 24)
    : allProducts.filter((p) => p.is_active).slice(0, 24);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === product.id);
      if (existing) {
        return prev.map((c) => c.product_id === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { product_id: product.id, name: product.name, qty: 1, unit_price: product.selling_price, cost_price: product.cost_price }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.product_id !== productId));
    } else {
      setCart((prev) => prev.map((c) => c.product_id === productId ? { ...c, qty } : c));
    }
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product_id !== productId));
  };

  const subtotal = cart.reduce((acc, cur) => acc + cur.qty * cur.unit_price, 0);

  const completeSale = useCallback(async (method: PaymentMethod) => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    try {
      await createSale.mutateAsync({
        payment_method: method,
        customer_id: selectedCustomer || undefined,
        items: cart.map((c) => ({
          product_id: c.product_id,
          product_name: c.name,
          quantity: c.qty,
          unit_price: c.unit_price,
          cost_price: c.cost_price,
        })),
      });
      toast.success(`Sale completed (${method.toUpperCase()})`);
      setCart([]);
      setSelectedCustomer("");
    } catch (err: any) {
      toast.error(err.message ?? "Sale failed");
    }
  }, [cart, selectedCustomer, createSale]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "F4") { e.preventDefault(); completeSale("cash"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [completeSale]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">Point of Sale</h1>
          <SearchBar ref={searchRef} placeholder="Search products, SKU, barcode (F2)" onChange={setSearch} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="card p-3 text-left hover:shadow-md transition shadow-sm"
            >
              <p className="font-semibold text-slate-800 truncate">{p.name}</p>
              <p className="text-sm text-brand-700 font-bold">{formatCurrency(p.selling_price)}</p>
              <p className="text-xs text-slate-400">Stock: {p.stock_quantity}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-sm text-slate-500 col-span-full">No products found</p>}
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cart</h2>
          <p className="text-xs text-slate-500">F2 search &bull; F4 cash sale</p>
        </div>

        <select className="w-full border rounded px-2 py-1.5 text-sm" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
          <option value="">Walk-in customer</option>
          {(customers.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ""}</option>)}
        </select>

        <div className="space-y-3 max-h-[360px] overflow-y-auto">
          {cart.length === 0 && <p className="text-sm text-slate-500">No items yet</p>}
          {cart.map((item) => (
            <div key={item.product_id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">{item.name}</p>
                <p className="text-xs text-slate-500">{formatCurrency(item.unit_price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  type="number"
                  className="w-16"
                  value={item.qty}
                  onChange={(e) => updateQty(item.product_id, Number(e.target.value))}
                  min={0}
                />
                <p className="font-semibold w-24 text-right">{formatCurrency(item.qty * item.unit_price)}</p>
                <button onClick={() => removeItem(item.product_id)} className="text-red-500 text-xs ml-1">&times;</button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex gap-2">
            <Button className="w-full" onClick={() => completeSale("cash")} disabled={createSale.isPending}>Cash</Button>
            <Button variant="outline" className="w-full" onClick={() => completeSale("mpesa")} disabled={createSale.isPending}>M-Pesa</Button>
          </div>
          <Button variant="outline" className="w-full" onClick={() => completeSale("credit")} disabled={createSale.isPending || !selectedCustomer}>Credit</Button>
        </div>
      </div>
    </div>
  );
};

export default POS;
