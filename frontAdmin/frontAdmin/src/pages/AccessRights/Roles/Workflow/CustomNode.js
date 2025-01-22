import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";

function CustomNode({ id, data }) {
  
  return (
    <div className={`custom-node-wrapper ${data.error ? "error-node" : ""}`}>
      <div className="custom-node">
        <div className="emoji-wrapper">{data.emoji}</div>
        <div className="info">
          <div className="name">{data.name}</div>
          <div className="job">{data.job}</div>
        </div>
        <svg width="100" height="100">
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="lightgreen" />
              <stop offset="100%" stopColor="green" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="url(#greenGradient)"
            stroke="darkgreen"
            strokeWidth="2"
          />
        </svg>
        <Handle type="target" position={Position.Top} className="handle-top" />
        <Handle
          type="source"
          position={Position.Bottom}
          className="handle-bottom"
        />
      </div>
    </div>
  );
}

export default memo(CustomNode);
