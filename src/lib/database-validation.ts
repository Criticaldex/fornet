import { empreses } from '@/app/constants';
import { NextResponse } from 'next/server';

/**
 * Validates that a database name is allowed
 * @param dbName - The database name to validate
 * @returns true if valid, false otherwise
 */
export function validateDatabaseName(dbName: string): boolean {
    return empreses.includes(dbName);
}

/**
 * Creates a standardized error response for invalid database names
 * @returns NextResponse with error
 */
export function invalidDatabaseResponse() {
    return NextResponse.json(
        { ERROR: 'Invalid database name. Only authorized databases are allowed.' },
        { status: 400 }
    );
}
