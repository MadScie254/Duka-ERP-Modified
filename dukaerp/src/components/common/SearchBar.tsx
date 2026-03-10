import { forwardRef } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ placeholder = "Search...", onChange }, ref) => (
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
    <input
      ref={ref}
      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
));

SearchBar.displayName = "SearchBar";

export default SearchBar;
