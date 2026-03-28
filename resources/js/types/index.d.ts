import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    roles: string[];
    permissions: string[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export type FormFieldType = 'text' | 'textarea' | 'dropdown' | 'file' | 'image' | 'checkbox' | 'date' | 'number';

export interface FormField {
    name: string;
    label: string;
    type: FormFieldType;
    required: boolean;
    placeholder: string;
    options: string[];
}

export interface ServiceData {
    id: number;
    name: string;
    description: string | null;
    form_schema: FormField[];
    completion_schema: FormField[];
    is_active: boolean;
    document_type_ids?: number[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
    flash?: {
        success?: string;
        error?: string;
    };
};
