import { Button } from "../ui/Button";
import { RotateCw } from "lucide-react";
import { Badge } from "../ui/Badge";

interface ViewControlsProps {
  orientation?: "vertical" | "horizontal";
  onOrientationChange?: (orientation: "vertical" | "horizontal") => void;
  onReset?: () => void;
  totalNodes?: number;
}

export const ViewControls = ({
  orientation = "vertical",
  onOrientationChange,
  onReset,
  totalNodes = 0,
}: ViewControlsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Orientation Toggle */}
      {onOrientationChange && (
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            size="sm"
            variant={orientation === "vertical" ? "secondary" : "ghost"}
            onClick={() => onOrientationChange("vertical")}
          >
            Vertical
          </Button>
          <Button
            size="sm"
            variant={orientation === "horizontal" ? "secondary" : "ghost"}
            onClick={() => onOrientationChange("horizontal")}
          >
            Horizontal
          </Button>
        </div>
      )}

      {/* Reset Button */}
      {onReset && (
        <Button size="sm" variant="outline" onClick={onReset}>
          <RotateCw size={16} />
        </Button>
      )}

      {/* Stats Badge */}
      <Badge variant="secondary" className="ml-auto">
        {totalNodes} {totalNodes === 1 ? "Employee" : "Employees"}
      </Badge>
    </div>
  );
};
