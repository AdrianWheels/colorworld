import React from "react";

import "../styles/Tiles.css";

const tileSizes = {
    sm: "tile-sm",
    md: "tile-md",
    lg: "tile-lg",
};

export function Tiles({
    className = "",
    rows = 100,
    cols = 20,
    tileClassName = "",
    tileSize = "md",
}) {
    const rowsArray = new Array(rows).fill(1);
    const colsArray = new Array(cols).fill(1);

    return (
        <div className={`tiles-container ${className}`}>
            {rowsArray.map((_, i) => (
                <div
                    key={`row-${i}`}
                    className={`tiles-row ${tileSizes[tileSize]} ${tileClassName}`}
                    style={{ height: 'auto', width: '100%', borderLeft: 'none' }} // Override specific row styles if needed
                >
                    {/* We actually need the row to be a flex container of tiles, 
               but the original code structure had rows containing cols. 
               Let's stick to the structure but fix the sizing logic. 
               The row itself doesn't need fixed width/height, the tiles do.
           */}
                    <div className="tiles-row" style={{ borderLeft: '1px solid var(--tile-border)' }}>
                        {colsArray.map((_, j) => (
                            <div
                                key={`col-${j}`}
                                className={`tile ${tileSizes[tileSize]} ${tileClassName}`}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
