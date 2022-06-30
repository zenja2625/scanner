export const matchesCount = (numbers: number[], numberArray: number[]) => {
    let maxLength = 0
    let maxMatch = 0
    let numberMatches: { p: number, m: number }[] = []

    for (let i = 0; i < numberArray.length; i++) {
        const number = numberArray[i]

        for (let j = 0; j < numberMatches.length; j++) {
            const match = numberMatches[j]

            if (match.p < numbers.length - 1) {
                match.p = match.p + 1
                if (numbers[match.p] === number) {
                    match.m++
                    if (match.m > maxMatch) maxMatch = match.m
                }
            } else numberMatches.splice(j--, 1)
        }

        if (maxLength < numberMatches.length) maxLength = numberMatches.length

        for (let j = 0; j < numbers.length; j++) {
            const element = numbers[j]

            if (number === element) {
                numberMatches.push({ p: j, m: 1 })
            }
        }
    }

    if (maxLength < numberMatches.length) maxLength = numberMatches.length

    return maxMatch
}   