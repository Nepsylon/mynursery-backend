export interface PaginatedItems<T> {
    items: T[];
    totalPages: number;
    totalCount: number;
}
