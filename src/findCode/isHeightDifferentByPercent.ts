export const isHeightDifferentByPercent = (height1: number, height2: number, percent: number) => {
    const heightDiff = Math.abs(height1 - height2)
    const percentDiff = heightDiff / height1
    return percentDiff > percent
}