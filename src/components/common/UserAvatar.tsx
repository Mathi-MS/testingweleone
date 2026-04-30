import React, { useState } from "react";

interface UserAvatarProps {
    src?: string;
    name: string;
    className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, className }) => {
    const [error, setError] = useState(false);

    const getInitials = (n: string) => {
        if (!n) return '?';
        const parts = n.split(' ').filter(part => part.length > 0);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return n[0].toUpperCase();
    };

    const getAvatarColor = (n: string) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-red-500',
            'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-orange-500', 'bg-teal-500'
        ];
        let hash = 0;
        for (let i = 0; i < (n?.length || 0); i++) {
            hash = n.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    if (src && !error) {
        return (
            <img
                src={src}
                alt={name}
                className={className}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div className={`${className} ${getAvatarColor(name)} flex items-center justify-center text-white font-semibold`}>
            {getInitials(name)}
        </div>
    );
};
