'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'Overview' },
        { href: '/admin/process-docs', label: 'Process Documentation' },
    ];

    return (
        <div className="w-64">
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2 rounded-lg transition-colors ${
                            pathname === item.href
                                ? 'bg-primary text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
} 