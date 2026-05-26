/**
 * @fileoverview Custom Hook zum Verwalten von persistentem State im localStorage des Browsers.
 * Synchronisiert den Zustand automatisch bei Änderungen.
 * @module UseLocalStorageHook
 */

import { useEffect, useState } from "react";

/**
 * Ein React-Hook, der einen Zustand im localStorage des Browsers persistiert.
 * 
 * @remarks
 * UX/Performance: Reagiert auf Änderungen des Schlüssels und aktualisiert den gespeicherten Wert.
 * Die Wiedereinspielung aus dem localStorage erfolgt asynchron über ein Timeout, da synchrone 
 * Zustandsänderungen in Effects in Next.js/SSR-Umgebungen zu kaskadierenden Renders führen und 
 * Hydration-Mismatch riskieren.
 * 
 * @template T - Der Typ des gespeicherten Zustandswerkes.
 * @param key - Der localStorage-Schlüssel für die Persistierung.
 * @param initialValue - Der initiale Standardwert, falls kein Eintrag im localStorage vorhanden ist.
 * @returns Ein Tupel mit dem aktuellen Zustand und einer Setter-Funktion.
 */
const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    // Abrufen aus dem localStorage auf Client-Seite
    const item = window.localStorage.getItem(key);
    if (item) {
      const timer = setTimeout(() => {
        setStoredValue(JSON.parse(item));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [key]);

  /**
   * Aktualisiert den Wert sowohl im lokalen State als auch im localStorage des Browsers.
   * 
   * @param value - Der neue Zustandswert.
   */
  const setValue = (value: T) => {
    // Zustand speichern
    setStoredValue(value);
    // Im localStorage persistieren
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
