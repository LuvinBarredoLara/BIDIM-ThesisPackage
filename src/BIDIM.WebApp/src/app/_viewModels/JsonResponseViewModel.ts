

export interface IJsonResponse<T> {
    IsSuccess: boolean,
    Status?: number,
    Message?: string,
    Data?: T
}