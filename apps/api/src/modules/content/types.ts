import { SelectTrashMode } from '../database/constants';

export type SearchType = `like` | `against` | `meili`;

export interface ContentConfig {
    searchType?: SearchType;
}

export interface SearchOptions {
    trashed?: SelectTrashMode;
    isPublished?: boolean;
    page?: number;
    limit?: number;
}
