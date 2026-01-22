/**
 * Toolbar component for drawing tools
 * Provides brush, eraser, color picker, stroke width, and undo/redo controls
 */

import React, { useState } from 'react';

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
];

const STROKE_WIDTHS = [2, 4, 8, 12, 16, 24];

export default function Toolbar({
    currentTool,
    currentColor,
    currentWidth,
    onToolChange,
    onColorChange,
    onWidthChange,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
}) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [customColor, setCustomColor] = useState('#000000');

    return (
        <div className="fixed top-4 left-half translate-x-neg-half z-10">
            <div className="glass-panel px-6 py-4 flex items-center gap-6 animate-slide-in">
                {/* Tool Selection */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onToolChange('brush')}
                        className={`btn-icon ${currentTool === 'brush' ? 'bg-primary-500 text-white' : 'text-white'
                            }`}
                        title="Brush (B)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onToolChange('eraser')}
                        className={`btn-icon ${currentTool === 'eraser' ? 'bg-primary-500 text-white' : 'text-white'
                            }`}
                        title="Eraser (E)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                <div className="w-px h-8 bg-white-20" />

                {/* Color Picker */}
                <div className="relative">
                    <div className="flex gap-2 items-center">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => onColorChange(color)}
                                className={`w-8 h-8 rounded-lg border-2 transition-all hover-scale-110 ${currentColor === color ? 'border-white scale-110' : 'border-white-30'
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="btn-icon text-white"
                            title="Custom Color"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </button>
                    </div>

                    {showColorPicker && (
                        <div className="absolute top-12 right-0 glass-panel p-4 animate-fade-in">
                            <input
                                type="color"
                                value={customColor}
                                onChange={(e) => {
                                    setCustomColor(e.target.value);
                                    onColorChange(e.target.value);
                                }}
                                className="w-32 h-32 cursor-pointer rounded-lg"
                            />
                        </div>
                    )}
                </div>

                <div className="w-px h-8 bg-white-20" />

                {/* Stroke Width */}
                <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-medium">
                        Width: {currentWidth}px
                    </label>
                    <div className="flex gap-2">
                        {STROKE_WIDTHS.map((width) => (
                            <button
                                key={width}
                                onClick={() => onWidthChange(width)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white-20 ${currentWidth === width ? 'bg-primary-500' : 'bg-white-10'
                                    }`}
                                title={`${width}px`}
                            >
                                <div
                                    className="rounded-full bg-white"
                                    style={{ width: `${width}px`, height: `${width}px` }}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-px h-8 bg-white-20" />

                {/* Undo/Redo */}
                <div className="flex gap-2">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="btn-icon text-white"
                        title="Undo (Ctrl+Z)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="btn-icon text-white"
                        title="Redo (Ctrl+Y)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
