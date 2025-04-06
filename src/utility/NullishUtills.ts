export const isEmptyObject = (data: object) => {
    if (!data) return true
    else return Object.entries(data)?.length ? false : true
}
export const isUUID = (id:string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)