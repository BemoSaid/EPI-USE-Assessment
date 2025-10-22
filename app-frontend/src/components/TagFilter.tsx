import React from "react";
import { Chip } from "../components/ui/Chip";

interface TagFilterProps {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ tags, selected, onToggle }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {tags.map((tag) => (
      <button
        key={tag}
        className={`focus:outline-none ${selected.includes(tag) ? 'bg-[#5F9EA0] text-white' : 'bg-[#F0F9F9] text-[#3A6F6F]'} px-3 py-1 rounded-full border border-[#B2D8D8] text-xs font-semibold transition`}
        onClick={() => onToggle(tag)}
      >
        {tag}
      </button>
    ))}
  </div>
);
