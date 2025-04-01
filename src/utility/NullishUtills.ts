export const isEmptyObject = (data: object) => {
    if (!data) return true
    else return Object.entries(data)?.length ? false : true
}