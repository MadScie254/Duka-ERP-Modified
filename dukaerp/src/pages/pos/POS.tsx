import { useState } from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/common/SearchBar";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const products = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  name: `Item ${i + 1}`,
  price: Math.round(30 + Math.random() * 200),
}));

const POS = () => {
  const [cart, setCart] = useState<{ id: number; name: string; qty: number; price: number }[]>([]);

  const addToCart = (product: (typeof products)[number]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: Math.max(1, qty) } : c)));
  };

  const subtotal = cart.reduce((acc, cur) => acc + cur.qty * cur.price, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">Point of Sale</h1>
          <SearchBar placeholder="Search products, SKU, barcode" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="card p-3 text-left hover:shadow-md transition shadow-sm"
            >
              <p className="font-semibold text-slate-800">{p.name}</p>
              <p className="text-sm text-brand-700 font-bold">{formatCurrency(p.price)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cart</h2>
          <p className="text-xs text-slate-500">F2 focus search • F4 complete</p>
        </div>
        <div className="space-y-3 max-h-[360px] overflow-y-auto">
          {cart.length === 0 && <p className="text-sm text-slate-500">No items yet</p>}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-16"
                  value={item.qty}
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  min={1}
                />
                <p className="font-semibold">{formatCurrency(item.qty * item.price)}</p>
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
            <Button className="w-full">Cash</Button>
            <Button variant="outline" className="w-full">M-Pesa</Button>
          </div>
          <Button className="w-full">Complete Sale</Button>
        </div>
      </div>
    </div>
  );
};

export default POS;
