import { useCallback, useMemo, useRef } from "react";
import Tree from "react-d3-tree";
import { OrgChartNode } from "./OrgChartNode";

interface OrgChart2DProps {
  data: any;
  orientation: "vertical" | "horizontal";
  onNodeClick?: (node: any) => void;
}

export const OrgChart2D = ({ data, orientation, onNodeClick }: OrgChart2DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const translate = useMemo(() => {
    if (!containerRef.current) return { x: 400, y: 100 };
    const { width, height } = containerRef.current.getBoundingClientRect();
    return {
      x: orientation === "vertical" ? width / 2 : 100,
      y: orientation === "vertical" ? 100 : height / 2,
    };
  }, [orientation]);

  const renderNode = useCallback(
    ({ nodeDatum, toggleNode }: any) => (
      <OrgChartNode nodeDatum={nodeDatum} toggleNode={toggleNode} />
    ),
    []
  );

  const pathClassFunc = useCallback(() => {
    return "org-chart-link";
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Tree
        data={data}
        orientation={orientation}
        translate={translate}
        zoom={0.8}
        scaleExtent={{ min: 0.3, max: 2 }}
        nodeSize={orientation === "vertical" ? { x: 300, y: 220 } : { x: 220, y: 300 }}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        pathFunc="step"
        pathClassFunc={pathClassFunc}
        renderCustomNodeElement={renderNode}
        onNodeClick={onNodeClick}
        enableLegacyTransitions
        transitionDuration={500}
        depthFactor={orientation === "vertical" ? 300 : 350}
        collapsible
      />
      <style>{`
        .org-chart-link {
          stroke: #14b8a6;
          stroke-width: 2px;
          fill: none;
          transition: all 0.3s ease;
        }
        .org-chart-link:hover {
          stroke: #0d9488;
          stroke-width: 3px;
        }
      `}</style>
    </div>
  );
};
