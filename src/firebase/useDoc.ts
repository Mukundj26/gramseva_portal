'use client';

import { useState, useEffect } from 'react';
import { isSimulated, db } from './config';
import { doc, onSnapshot } from 'firebase/firestore';

export function useDoc<T = any>(collectionName: string, docId: string | null | undefined) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (isSimulated) {
      // 1. Simulation Mode
      const handleUpdate = () => {
        try {
          const dbData = db.simulator.getData();
          const list = dbData[collectionName];

          if (!list) {
            setData(null);
            setLoading(false);
            return;
          }

          let foundDoc: any = null;

          // Users and Farmers are stored as key-value objects
          if (!Array.isArray(list)) {
            foundDoc = list[docId] || null;
          } else {
            // Arrays (applications, crops, schemes, etc.)
            foundDoc = list.find((item: any) => item.id === docId || item.userId === docId) || null;
          }

          setData(foundDoc as T);
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
        const docRef = doc(db, collectionName, docId);
        const unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setData({ id: snapshot.id, ...snapshot.data() } as T);
            } else {
              setData(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error(`Error loading doc ${collectionName}/${docId}:`, err);
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
  }, [collectionName, docId]);

  return { data, loading, error };
}
