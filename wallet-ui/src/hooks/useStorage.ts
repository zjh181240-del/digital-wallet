import { useState, useEffect, useRef } from 'react';

interface StorageOptions<T> {
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
    listenToStorageChanges?: boolean;
}

const useStorage = <T>(
    key: string,
    initialValue: T,
    storage: Storage = localStorage,
    options: StorageOptions<T> = {}
) => {
    const {
        serializer = JSON.stringify,
        deserializer = JSON.parse,
        listenToStorageChanges = true,
    } = options;

    const [value, setValue] = useState<T>(() => {
        try {
            const storedValue = storage.getItem(key);
            if (storedValue !== null) {
                return deserializer(storedValue);
            }
            return initialValue;
        } catch (error) {
            console.error(`Error reading storage key "${key}":`, error);
            return initialValue;
        }
    });

    const keyRef = useRef(key);
    const storageRef = useRef(storage);

    useEffect(() => {
        try {
            if (value === null) {
                storageRef.current.removeItem(keyRef.current);
            } else {
                storageRef.current.setItem(keyRef.current, serializer(value));
            }
        } catch (error) {
            console.error(`Error setting storage key "${keyRef.current}":`, error);
        }
    }, [value, serializer]);

    useEffect(() => {
        if (!listenToStorageChanges) return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === keyRef.current && e.newValue !== serializer(value)) {
                try {
                    setValue(e.newValue ? deserializer(e.newValue) : initialValue);
                } catch (error) {
                    console.error(`Error parsing storage value for key "${keyRef.current}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [initialValue, serializer, deserializer, listenToStorageChanges]);

    return [value, setValue] as const;
};
export default useStorage;
