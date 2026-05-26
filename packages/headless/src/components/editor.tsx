/**
 * @fileoverview Hauptkomponenten für das Headless Novel Editor-System. Stellt den Kontext-Provider
 * und die Rendering-Komponente für Tiptap-basierte Editoren bereit.
 * @module HeadlessEditorComponents
 */

import { EditorProvider } from "@tiptap/react";
import type { EditorProviderProps, JSONContent } from "@tiptap/react";
import { Provider } from "jotai";
import { forwardRef, useState } from "react";
import type { FC, ReactNode } from "react";
import tunnel from "tunnel-rat";
import { novelStore } from "../utils/store";
import { EditorCommandTunnelContext } from "./editor-command";

/**
 * Eigenschaften für den Editor-Wrapper.
 * 
 * @interface EditorProps
 * @property {ReactNode} children - Die Kind-Elemente des Editors.
 * @property {string} [className] - Optionaler CSS-Klassennamen für das Styling.
 */
export interface EditorProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Eigenschaften für die EditorRoot-Komponente.
 * 
 * @interface EditorRootProps
 * @property {ReactNode} children - Die untergeordneten Komponenten des Editors.
 */
interface EditorRootProps {
  readonly children: ReactNode;
}

/**
 * Der Root-Kontext-Provider für den Novel-Editor. Spawnt einen Tunnel für Editor-Befehle
 * und stellt den Jotai-State-Store bereit.
 * 
 * @remarks
 * UX/Performance: Der Tunnel wird über `useState` faul initialisiert, um sicherzustellen,
 * dass er nur einmal auf dem Client instanziiert wird und Linter-Meldungen zu Referenz-Dereferenzierungen
 * in der Render-Phase umgangen werden.
 * 
 * @param props - Die Eigenschaften der Komponente mit children.
 * @returns React-Element mit verknüpftem Tunnel- und Jotai-State.
 */
export const EditorRoot: FC<EditorRootProps> = ({ children }) => {
  const [tunnelInstance] = useState(() => tunnel());

  return (
    <Provider store={novelStore}>
      <EditorCommandTunnelContext.Provider value={tunnelInstance}>{children}</EditorCommandTunnelContext.Provider>
    </Provider>
  );
};

/**
 * Eigenschaften für die EditorContent-Komponente.
 * 
 * @interface EditorContentProps
 * @extends {Omit<EditorProviderProps, "content">}
 * @property {ReactNode} [children] - Optionale untergeordnete Elemente.
 * @property {string} [className] - Optionaler CSS-Klassennamen für die Layout-Styling.
 * @property {JSONContent} [initialContent] - Der initiale JSON-Inhalt für den Editor.
 */
export type EditorContentProps = Omit<EditorProviderProps, "content"> & {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly initialContent?: JSONContent;
};

/**
 * Die Hauptkomponente zum Rendern des Tiptap-Editors.
 * Reicht das Ref an die umschließende HTMLElement-Container weiter.
 * 
 * @remarks
 * Kapselt das Rendering und instanziiert den Tiptap `EditorProvider`.
 * 
 * @param props - Konfigurationseigenschaften.
 * @param ref - Referenz auf das HTML-Div-Element des Containers.
 * @returns Das React-Element des Editors.
 */
export const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  ({ className, children, initialContent, ...rest }, ref) => (
    <div ref={ref} className={className}>
      <EditorProvider {...rest} content={initialContent}>
        {children}
      </EditorProvider>
    </div>
  ),
);

EditorContent.displayName = "EditorContent";
