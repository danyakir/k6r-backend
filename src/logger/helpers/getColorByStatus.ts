import { bgRed, red, yellow, green, gray } from 'colorette';

export const getColorByStatus = (status: number) => {
    if (status >= 500) {
        return bgRed;
    } else if (status >= 400) {
        return red;
    } else if (status >= 300) {
        return yellow;
    } else if (status >= 200) {
        return green;
    } else {
        return gray;
    }
};
