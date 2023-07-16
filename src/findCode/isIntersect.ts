export const isIntersect = (y1: number[], y2: number[]) =>
    Math.abs(y1[0] - y2[0]) < 0.4 * (y1[1] - y1[0] + y2[1] - y2[0])
