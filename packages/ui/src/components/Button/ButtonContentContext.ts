import { createContext } from 'react';

/** Marks descendants rendered inside Button content for contrast-aware controls. */
export const ButtonContentContext = createContext(false);