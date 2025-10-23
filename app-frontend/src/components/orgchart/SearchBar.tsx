import { Search, X } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder = "Search employees...",
}: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative flex items-center gap-2">
      <Search className="absolute left-3 text-muted-foreground" size={18} />
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {query && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClear}
          className="absolute right-2"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
};
