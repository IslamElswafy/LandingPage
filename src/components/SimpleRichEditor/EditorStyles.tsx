import React from "react";

const EditorStyles: React.FC = () => (
  <style>{`
        .advanced-rich-editor .ProseMirror {
          outline: none;
          /* Ensure scrolling behavior and visible scrollbar styling */
          max-height: 400px;
          overflow-y: auto;
          scrollbar-gutter: stable both-edges;
          /* Enable relative positioning for absolutely positioned images */
          position: relative;
        }

        /* WebKit scrollbar styling */
        .advanced-rich-editor .ProseMirror::-webkit-scrollbar {
          width: 10px;
        }
        .advanced-rich-editor .ProseMirror::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .advanced-rich-editor .ProseMirror::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 8px;
        }
        .advanced-rich-editor .ProseMirror::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Firefox scrollbar styling */
        .advanced-rich-editor .ProseMirror {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }

        .advanced-rich-editor .editor-table {
          border-collapse: collapse;
          margin: 16px 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
          --table-border-color: #e0e0e0;
          --table-border-width: 2px;
          --table-border-style: solid;
        }

        .advanced-rich-editor .editor-table td,
        .advanced-rich-editor .editor-table th {
          min-width: 1em;
          padding: 8px 12px;
          position: relative;
          vertical-align: top;
          box-sizing: border-box;
          border-style: var(--cell-border-style, var(--table-border-style, solid));
          border-width: var(--cell-border-width, 0);
          border-color: var(--cell-border-color, transparent);
        }

        .advanced-rich-editor .editor-table.bordered td,
        .advanced-rich-editor .editor-table.bordered th {
          border-color: var(--cell-border-color, var(--table-border-color, #e0e0e0));
          border-width: var(--cell-border-width, var(--table-border-width, 2px));
          border-style: var(--cell-border-style, var(--table-border-style, solid));
        }

        .advanced-rich-editor .editor-table:not(.bordered) td,
        .advanced-rich-editor .editor-table:not(.bordered) th {
          border-width: 0;
          border-color: transparent;
        }

        .advanced-rich-editor .editor-table th {
          font-weight: bold;
          text-align: left;
          background-color: #f5f5f5;
        }

        /* Merged cells styling */
        .advanced-rich-editor .editor-table td[colspan],
        .advanced-rich-editor .editor-table th[colspan],
        .advanced-rich-editor .editor-table td[rowspan],
        .advanced-rich-editor .editor-table th[rowspan] {
          background-color: rgba(25, 118, 210, 0.05);
          position: relative;
        }

        .advanced-rich-editor .editor-table td[colspan]:after,
        .advanced-rich-editor .editor-table th[colspan]:after {
          content: "↔";
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          color: #1976d2;
          opacity: 0.7;
        }

        .advanced-rich-editor .editor-table td[rowspan]:after,
        .advanced-rich-editor .editor-table th[rowspan]:after {
          content: "↕";
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          color: #1976d2;
          opacity: 0.7;
        }

        .advanced-rich-editor .editor-table td[colspan][rowspan]:after,
        .advanced-rich-editor .editor-table th[colspan][rowspan]:after {
          content: "⤡";
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          color: #1976d2;
          opacity: 0.7;
        }

        .advanced-rich-editor .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .advanced-rich-editor .editor-image:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Inline images with text wrapping support */
        .advanced-rich-editor .inline-image-wrapper {
          display: inline-block;
          position: relative;
          box-sizing: border-box;
          flex-shrink: 0;
          vertical-align: top;
        }

        .advanced-rich-editor .inline-image-wrapper.ProseMirror-selectednode {
          outline: none !important;
        }

        .advanced-rich-editor .inline-image-wrapper img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          pointer-events: none;
        }

        /* Float left - text wraps to the right */
        .advanced-rich-editor .inline-image-wrapper[data-float="left"] {
          float: left;
          margin: 0 16px 8px 0;
        }

        /* Float right - text wraps to the left */
        .advanced-rich-editor .inline-image-wrapper[data-float="right"] {
          float: right;
          margin: 0 0 8px 16px;
        }

        /* No float - inline/block behavior */
        .advanced-rich-editor .inline-image-wrapper[data-float="none"] {
          display: block;
          margin: 8px auto;
          float: none;
          clear: both;
        }

        /* Keep image footprint stable while dragging */
        .advanced-rich-editor .ProseMirror-hideselection .inline-image-wrapper {
          opacity: 0.5;
          width: var(--inline-image-width, auto) !important;
          max-width: var(--inline-image-max-width, 100%) !important;
          height: var(--inline-image-height, auto) !important;
        }
        /* Dragging visual feedback */
        .advanced-rich-editor [draggable="true"].inline-image-wrapper {
          cursor: grab;
        }

        .advanced-rich-editor [draggable="true"].inline-image-wrapper:active {
          cursor: grabbing;
        }

        /* Drag indicators and handles */
        .advanced-rich-editor .drag-handle {
          position: absolute;
          background: #1976d2;
          border: 2px solid white;
          border-radius: 50%;
          cursor: grab;
          transition: all 0.2s ease;
        }

        .advanced-rich-editor .drag-handle:hover {
          background: #1565c0;
          transform: scale(1.1);
        }

        .advanced-rich-editor .drag-handle:active {
          cursor: grabbing;
        }

        /* Hide image controls in preview mode */
        .advanced-rich-editor.preview-mode .drag-handle,
        .advanced-rich-editor.preview-mode .MuiIconButton-root {
          display: none !important;
        }

        .advanced-rich-editor.preview-mode [data-node-view-wrapper] {
          cursor: default !important;
        }


        .advanced-rich-editor .ProseMirror .ProseMirror-selectednode {
          outline: none !important;
        }

        .advanced-rich-editor .resize-handle {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 12px;
          height: 12px;
          background: #1976d2;
          border: 2px solid white;
          border-radius: 3px;
          cursor: se-resize;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .advanced-rich-editor .resize-handle:hover {
          background: #1565c0;
          transform: scale(1.1);
        }

        .advanced-rich-editor .resize-tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-family: monospace;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1000;
        }


        .advanced-rich-editor .editor-link {
          color: #1976d2;
          text-decoration: underline;
          cursor: pointer;
        }

        .advanced-rich-editor .editor-link:hover {
          color: #1565c0;
        }

        .advanced-rich-editor figure {
          margin: 24px 0;
          text-align: center;
          position: relative;
          display: inline-block;
          max-width: 100%;
          clear: both;
        }

        .advanced-rich-editor figure img {
          max-width: 100%;
          height: auto;
        }

        /* Image alignment styles */
        .advanced-rich-editor .ProseMirror p[style*="text-align: left"] img,
        .advanced-rich-editor .ProseMirror div[style*="text-align: left"] img {
          display: block;
          margin-left: 0;
          margin-right: auto;
        }

        .advanced-rich-editor .ProseMirror p[style*="text-align: center"] img,
        .advanced-rich-editor .ProseMirror div[style*="text-align: center"] img {
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .advanced-rich-editor .ProseMirror p[style*="text-align: right"] img,
        .advanced-rich-editor .ProseMirror div[style*="text-align: right"] img {
          display: block;
          margin-left: auto;
          margin-right: 0;
        }

        .advanced-rich-editor .ProseMirror p[style*="text-align: left"],
        .advanced-rich-editor .ProseMirror p[style*="text-align: center"],
        .advanced-rich-editor .ProseMirror p[style*="text-align: right"] {
          margin: 16px 0;
        }


        .advanced-rich-editor figcaption {
          color: #666;
          font-size: 0.875rem;
          font-style: italic;
          margin-top: 8px;
          padding: 0 16px;
        }

        .advanced-rich-editor .code-block {
          background-color: #f4f4f4;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          margin: 16px 0;
          overflow-x: auto;
          padding: 16px;
        }

        .advanced-rich-editor .editor-blockquote {
          border-left: 4px solid #1976d2;
          margin: 16px 0;
          padding: 8px 16px;
          background-color: #f8f9fa;
          font-style: italic;
        }

        .advanced-rich-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
);

export default EditorStyles;
