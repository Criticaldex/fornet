import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Shifts Management - Admin',
    description: 'Manage work shifts and schedules',
}

export default function ShiftsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full w-full">
            {children}
        </div>
    )
}
