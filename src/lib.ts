import { nanoid } from 'nanoid';
import * as types from '@/types';


// Constants

export const DEFAULT_FILE_NAME = 'unknown';


// Checking Functions

export function inarr<T extends any, A extends any[]>(val: T, ...arr: A): types.Inarr<T, A> {
    return arr.includes(val) as types.Inarr<T, A>;
}

export function has<T extends types.Obj, K extends keyof T>(obj: T, key: K): types.Has<T, K> {
    return obj.hasOwnProperty(key) as types.Has<T, K>;
}

export function isset<T extends any>(val: T): types.Isset<T> {
    return !inarr(val, null, undefined) as types.Isset<T>;
}

export function isNumber<T extends any>(val: T): types.IsNumber<T> {
    return (isset(val) && !isNaN(Number(val))) as types.IsNumber<T>;
}

export function isObject<T extends any>(val: T): types.IsObject<T> {
    return (typeof val === 'object' && val !== null) as types.IsObject<T>;
}


// Framework Functions

export function audit(val: any): string {
    if (isObject(val))
        return JSON.stringify(val);

    else if (typeof val === 'string')
        return `'${val}'`;

    else
        return String(val);
}

export function time(): number {
    return Date.now();
}

export function unslash(path: string): string {
    let result = path;

    if (result?.startsWith('/'))
        result = result.slice(1);

    if (result?.endsWith('/'))
        result = result.slice(0, -1);

    return result;
}

export function slash(path: string): string {
    const result = unslash(path);

    return '/'+result;
}

export function serialize(obj: types.Storable, logError: boolean = true): string|null {
    let result: string|null = null;

    try {
        result = JSON.stringify(obj);
    } catch (_e: any) {
        if (logError)
            console.error(`Unable to serialize the object: ${audit(obj)}`);
    }

    return result;
}

export function unserialize(val: string, logError: boolean = true): types.Serializable | null {
    let result: types.Serializable | null = null;

    try {
        result = JSON.parse(val);
    } catch (_e: any) {
        if (logError)
            console.error(`Unable to unserialize the string: ${audit(val)}`);
    }

    return result;
}

export function base64(val: string): string {
    const array = new TextEncoder().encode(val);
    return btoa(String.fromCharCode(...array));
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(String(reader.result));
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

export function base64ToFile(val: string, filename = DEFAULT_FILE_NAME): File {
    const [ meta, base64 ] = val?.split(',') ?? '';

    const matches = meta?.match(/data:(.*);base64/);
    const mime = matches ? matches[1] : 'application/octet-stream';

    const bytes = atob(base64);
    const array = Uint8Array.from(bytes, c => c?.charCodeAt(0) ?? 0);


    return new File([ array ], filename, { type: mime });
}

export function ensurePromise<T extends any = any>(val: types.MaybePromise): Promise<T> {
    return new Promise((resolve, reject) => {
        const isAsync = val instanceof Promise;

        if (isAsync)
            val.then(resolve).catch(reject);
        else
            resolve(val);
    }) as Promise<T>;
}

export function ensureAsync<T extends any = any>(val: any): (...val: any[]) => Promise<T> {
    return (...args: any[]) => ensurePromise<T>(val(...args));
}


export { nanoid };
