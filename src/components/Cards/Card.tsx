import type { BaseCard } from '../../game/cards';
import { TERRAIN_COLOR } from './colors';
import { PatternPreview } from './PatternPreview';

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
            {/* Name (top) + pattern preview (bottom) */}
            <div style={{
                flex:           1,
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '6px 4px 4px',
                overflow:       'hidden',
                borderRadius:   '8px 0 0 8px',
            }}>
                <span style={{
                    fontSize:   9,
                    fontWeight: 600,
                    textAlign:  'center',
                    lineHeight: 1.2,
                    color:      '#2a2118',
                }}>
                    {formatName(card.id)}
                </span>
                <PatternPreview
                    centerTerrain={card.centerTerrain}
                    pattern={card.pattern}
                    cubeAt={card.cubeAt}
                />
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
