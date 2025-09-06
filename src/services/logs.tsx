import _ from "lodash"
import { getSession } from "@/services/session"
import { LogIface } from "@/schemas/log";

const getValues = async (filter: LogIface, fields?: string[], db?: string) => {
   try {
      if (!db) {
         const session = await getSession();
         db = session?.user.db;
      }

      if (!fields) {
         fields = ['-_id'];
      }

      // Use relative URL for internal API calls
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs/${db}`, {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify({
            fields: fields,
            filter: filter,
            sort: { timestamp: -1 } // Sort by timestamp descending
         }),
      });

      if (!response.ok) {
         return [];
      }

      const data = await response.json();
      return data;
   } catch (error) {
      return [];
   }
}

const insertValue = async (body: LogIface, db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!body) {
      throw new Error('Body is required');
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(body),
      }).then(res => res.json());
}

export const getTableValues = async (filter: LogIface, fields?: string[], db?: string) => {
   const data: [] = await getValues(filter, fields, db);
   return data;
}

export { insertValue };

export const deleteValues = async (filter: LogIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

// Enhanced logging functions for user actions
export const logUserAction = async (
   user: string,
   resource: string,
   action: string,
   details?: {
      oldValue?: any;
      newValue?: any;
      message?: string;
      severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
   },
   db?: string
) => {
   try {
      const logEntry: LogIface = {
         user,
         resource: `${resource}:${action}`,
         timestamp: Date.now(),
         message: details?.message || `${action} performed on ${resource}`,
         oldValue: details?.oldValue ? JSON.stringify(details.oldValue) : undefined,
         newValue: details?.newValue ? JSON.stringify(details.newValue) : undefined,
      };

      // Add severity if provided, otherwise it will default to INFO in the schema
      if (details?.severity) {
         (logEntry as any).severity = details.severity;
      }

      return await insertValue(logEntry, db);
   } catch (error) {
      console.error('Failed to log user action:', error);
      // Don't throw error to avoid breaking the main operation
      return null;
   }
};

// Convenience functions for common actions
export const logCreate = async (user: string, resource: string, newValue: any, db?: string) => {
   return logUserAction(user, resource, 'CREATE', {
      newValue,
      message: `Created new ${resource}`,
      severity: 'INFO'
   }, db);
};

export const logUpdate = async (user: string, resource: string, oldValue: any, newValue: any, db?: string) => {
   return logUserAction(user, resource, 'UPDATE', {
      oldValue,
      newValue,
      message: `Updated ${resource}`,
      severity: 'INFO'
   }, db);
};

export const logDelete = async (user: string, resource: string, deletedValue: any, db?: string) => {
   return logUserAction(user, resource, 'DELETE', {
      oldValue: deletedValue,
      message: `Deleted ${resource}`,
      severity: 'WARNING'
   }, db);
};

export const logLogin = async (user: string, db?: string) => {
   return logUserAction(user, 'AUTH', 'LOGIN', {
      message: `User ${user} logged in`,
      severity: 'INFO'
   }, db);
};

export const logLogout = async (user: string, db?: string) => {
   return logUserAction(user, 'AUTH', 'LOGOUT', {
      message: `User ${user} logged out`,
      severity: 'INFO'
   }, db);
};

export const logError = async (user: string, resource: string, error: string, db?: string) => {
   return logUserAction(user, resource, 'ERROR', {
      message: `Error in ${resource}: ${error}`,
      severity: 'ERROR'
   }, db);
};