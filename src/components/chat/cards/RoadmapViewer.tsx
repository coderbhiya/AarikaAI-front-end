"use client";

import React from "react";
import DiagramCard from "./DiagramCard";

interface RoadmapViewerProps {
  chart: string;
  title?: string;
}

export default function RoadmapViewer({ chart, title = "Visual Roadmap" }: RoadmapViewerProps) {
  if (!chart) return null;

  return (
    <DiagramCard
      type="flowchart"
      title={title}
      mermaid={chart}
    />
  );
}
