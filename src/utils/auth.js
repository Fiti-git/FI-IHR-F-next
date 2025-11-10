// auth.js
export const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
    return null;
};

export const setAuthToken = (token) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
    }
};

export const removeAuthToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
    }
};

export const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token;
};

