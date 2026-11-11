import type { Token } from '../../game/cell';

import imgBlue   from '../../assets/tokens/blue.png';
import imgYellow from '../../assets/tokens/yellow.png';
import imgGreen  from '../../assets/tokens/green.png';
import imgBrown  from '../../assets/tokens/brown.png';
import imgGrey   from '../../assets/tokens/grey.png';
import imgRed    from '../../assets/tokens/red.png';

export const TOKEN_IMG: Record<Token, string> = {
    BLUE:   imgBlue,
    YELLOW: imgYellow,
    GREEN:  imgGreen,
    BROWN:  imgBrown,
    GRAY:   imgGrey,
    RED:    imgRed,
};
