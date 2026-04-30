
export const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    // Note: HttpOnly cannot be set from client-side JavaScript. 
    // We use Secure and SameSite=Strict for best available client-side security.
    const isSecure = window.location.protocol === "https:";
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; ${isSecure ? "Secure;" : ""} SameSite=Strict`;
};

export const getCookie = (name: string): string => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
};

export const removeCookie = (name: string) => {
    document.cookie = `${name}=; max-age=0; path=/; Secure; SameSite=Strict`;
};
