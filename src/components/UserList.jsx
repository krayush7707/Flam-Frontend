/**
 * UserList component showing online users
 * Displays user avatars, colors, and online status
 */

import React from 'react';

export default function UserList({ users, currentUserId }) {
    return (
        <div className="fixed top-4 right-4 z-10">
            <div className="glass-panel px-4 py-3 min-w-200 animate-slide-in">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">Online Users</h3>
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        {users.length}
                    </span>
                </div>

                <div className="space-y-2">
                    {users.map((user) => (
                        <div
                            key={user.userId}
                            className="flex items-center gap-3 p-2 rounded-lg bg-white-10 hover:bg-white-10 transition-all"
                        >
                            <div className="relative">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white-30"
                                    style={{ backgroundColor: user.color }}
                                >
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {user.username}
                                    {user.userId === currentUserId && (
                                        <span className="ml-1 text-xs text-primary-300">(You)</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}

                    {users.length === 0 && (
                        <p className="text-white-50 text-sm text-center py-4">
                            No users online
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
