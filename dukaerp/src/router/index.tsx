import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import OnboardingWizard from "@/pages/auth/OnboardingWizard";
import Dashboard from "@/pages/dashboard/Dashboard";
import Inventory from "@/pages/inventory/Inventory";
import ProductForm from "@/pages/inventory/ProductForm";
import StockAdjustment from "@/pages/inventory/StockAdjustment";
import POS from "@/pages/pos/POS";
import Sales from "@/pages/sales/Sales";
import SaleDetail from "@/pages/sales/SaleDetail";
import Customers from "@/pages/customers/Customers";
import CustomerDetail from "@/pages/customers/CustomerDetail";
import DebtTracker from "@/pages/customers/DebtTracker";
import Suppliers from "@/pages/suppliers/Suppliers";
import SupplierDetail from "@/pages/suppliers/SupplierDetail";
import Expenses from "@/pages/expenses/Expenses";
import Analytics from "@/pages/analytics/Analytics";
import Reports from "@/pages/reports/Reports";
import Settings from "@/pages/settings/Settings";
import { useAuthStore } from "@/store/authStore";
import { useAuthInit } from "@/hooks/useAuthInit";
import React from "react";
import { Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  const { ready } = useAuthInit();
  const session = useAuthStore((state) => state.session);
  const activeShop = useAuthStore((state) => state.activeShop);

  // Wait for auth to initialise before deciding
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading DukaERP…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!activeShop) {
    return <Navigate to="/onboarding" replace />;
  }

  return <AppShell />;
};

const ProtectedOutlet = () => {
  return (
    <React.Suspense fallback={<div className="p-6">Loading...</div>}>
      <Outlet />
    </React.Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        element: <ProtectedOutlet />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "inventory", element: <Inventory /> },
          { path: "inventory/new", element: <ProductForm /> },
          { path: "inventory/adjust", element: <StockAdjustment /> },
          { path: "pos", element: <POS /> },
          { path: "sales", element: <Sales /> },
          { path: "sales/:id", element: <SaleDetail /> },
          { path: "customers", element: <Customers /> },
          { path: "customers/:id", element: <CustomerDetail /> },
          { path: "debts", element: <DebtTracker /> },
          { path: "suppliers", element: <Suppliers /> },
          { path: "suppliers/:id", element: <SupplierDetail /> },
          { path: "expenses", element: <Expenses /> },
          { path: "analytics", element: <Analytics /> },
          { path: "reports", element: <Reports /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/onboarding", element: <OnboardingWizard /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
