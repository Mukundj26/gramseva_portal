'use client';

import { useState, useEffect } from 'react';
import { isSimulated, db } from './config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface Filter {
  field: string;
  operator: '==' | 'array-contains';
  value: any;
}

export function useCollection<T = any>(
  collectionName: string,
  filters?: Filter[],
  sortField?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    if (isSimulated) {
      // 1. Simulation Mode
      const handleUpdate = () => {
        try {
          const dbData = db.simulator.getData();
          let list = dbData[collectionName];

          if (!list) {
            // Check if it's a sub-table or not found
            setData([]);
            setLoading(false);
            return;
          }

          // Convert object to array if it is registered as an object Map (e.g. users, farmers)
          if (!Array.isArray(list)) {
            list = Object.values(list);
          }

          let result = [...list];

          // Apply filters
          if (filters) {
            filters.forEach((filter) => {
              const { field, operator, value } = filter;
              result = result.filter((item: any) => {
                const itemVal = item[field];
                if (operator === '==') {
                  return itemVal === value;
                }
                if (operator === 'array-contains') {
                  return Array.isArray(itemVal) && itemVal.includes(value);
                }
                return true;
              });
            });
          }

          // Apply sorting
          if (sortField) {
            result.sort((a: any, b: any) => {
              const valA = a[sortField];
              const valB = b[sortField];

              if (valA === undefined) return 1;
              if (valB === undefined) return -1;

              if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc'
                  ? valA.localeCompare(valB)
                  : valB.localeCompare(valA);
              }

              return sortOrder === 'asc'
                ? (valA as any) - (valB as any)
                : (valB as any) - (valA as any);
            });
          }

          setData(result as T[]);
          setLoading(false);
        } catch (e: any) {
          setError(e);
          setLoading(false);
        }
      };

      // Run initially
      handleUpdate();

      // Subscribe to updates
      const unsubscribe = db.simulator.subscribe(handleUpdate);
      return () => unsubscribe();
    } else {
      // 2. Real Firebase Mode
      try {
        const colRef = collection(db, collectionName);
        let q = query(colRef);

        if (filters) {
          filters.forEach((f) => {
            q = query(q, where(f.field, f.operator, f.value));
          });
        }

        if (sortField) {
          q = query(q, orderBy(sortField, sortOrder));
        }

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const list: any[] = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() });
            });
            setData(list as T[]);
            setLoading(false);
          },
          (err) => {
            console.error(`Error loading collection ${collectionName}:`, err);
            setError(err);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    }
  }, [collectionName, JSON.stringify(filters), sortField, sortOrder]);

  return { data, loading, error };
}
