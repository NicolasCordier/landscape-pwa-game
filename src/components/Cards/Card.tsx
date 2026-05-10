import type { BaseCard } from '../../game/cards';
import type { Terrain } from '../../game/terrain';

const TERRAIN_COLOR: Record<Terrain, string> = {
    TREE_1: '#4a7c59',
    TREE_2: '#4a7c59',
    TREE_3: '#4a7c59',
    MTN_1:  '#8a8c8f',
    MTN_2:  '#8a8c8f',
    MTN_3:  '#8a8c8f',
    FIELD:  '#c9a227',
    CITY:   '#b94040',
    RIVER:  '#2e7bbf',
};

function formatName(id: string): string {
    return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface CardProps {
    card:      BaseCard;
    selected?: boolean;
    onClick?:  (card: BaseCard) => void;
}

export function Card({ card, selected, onClick }: CardProps) {
    const color = TERRAIN_COLOR[card.centerTerrain];

    return (
        <div
            onClick={() => onClick?.(card)}
            style={{
                position:     'relative',
                width:        80,
                height:       200,
                borderRadius: 8,
                overflow:     'visible',
                flexShrink:   0,
                cursor:       onClick ? 'pointer' : 'default',
                outline:      selected ? `3px solid #fff` : '3px solid transparent',
                outlineOffset: 2,
                display:      'flex',
                flexDirection: 'row',
                backgroundColor: '#f5f0e8',
                boxShadow:    '0 2px 4px rgba(0,0,0,0.3)',
                userSelect:   'none',
            }}
        >
            {/* Name */}
            <div style={{
                flex:           1,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '4px 6px',
                overflow:       'hidden',
                borderRadius:   '8px 0 0 8px',
            }}>
                <span style={{
                    fontSize:   11,
                    fontWeight: 600,
                    textAlign:  'center',
                    lineHeight: 1.2,
                    color:      '#2a2118',
                }}>
                    {formatName(card.id)}
                </span>
            </div>

            {/* Color bar — right corners rounded to match card */}
            <div style={{
                width:           12,
                backgroundColor: color,
                flexShrink:      0,
                borderRadius:    '0 8px 8px 0',
            }} />

            {/* Score badges — centered on the bar, stick out to the right */}
            <div style={{
                position:      'absolute',
                right:         0,
                top:           8,
                display:       'flex',
                flexDirection: 'column',
                gap:           4,
                zIndex:        1,
            }}>
                {card.points.map((p, i) => (
                    <div key={i} style={{
                        width:           26,
                        height:          26,
                        borderRadius:    '50%',
                        backgroundColor: color,
                        border:          '2px solid #f5f0e8',
                        display:         'flex',
                        alignItems:      'center',
                        justifyContent:  'center',
                        fontSize:        11,
                        fontWeight:      700,
                        color:           '#fff',
                    }}>
                        {p}
                    </div>
                ))}
            </div>
        </div>
    );
}
