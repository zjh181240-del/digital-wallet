const TokenKey = 'Admin-Token';
//
// const [value, setValue] = useStorage<null | string>(TokenKey, null)
//
// export const getToken = () => value;
//
// export const setToken = (access_token: string) => (setValue(access_token));
//
// export const removeToken = () => (setValue(null));

// 直接操作 sessionStorage，不使用 Hooks
export const getToken = (): string | null => {
    try {
        const stored = localStorage.getItem(TokenKey);
        return stored ? stored : null;
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const setToken = (access_token: string): void => {
    try {
        localStorage.setItem(TokenKey, access_token);
    } catch (error) {
        console.error('Error setting token:', error);
    }
};

export const removeToken = (): void => {
    try {
        localStorage.removeItem(TokenKey);
    } catch (error) {
        console.error('Error removing token:', error);
    }
};
