export interface CustomResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}
