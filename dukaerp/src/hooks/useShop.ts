import { useAuthStore } from "@/store/authStore";

export function useShop() {
  const activeShop = useAuthStore((s) => s.activeShop);
  const setActiveShop = useAuthStore((s) => s.setActiveShop);
  const shops = useAuthStore((s) => s.shops);
  return { activeShop, setActiveShop, shops };
}
