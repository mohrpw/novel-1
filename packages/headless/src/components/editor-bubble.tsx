/**
 * @fileoverview EditorBubble-Komponente für das schwebende Kontextmenü (Bubble-Menü) im Tiptap-Editor.
 * Bietet schnellen Zugriff auf Textformatierungsoptionen direkt an der aktuellen Selektion.
 * @module HeadlessEditorBubble
 */

import { BubbleMenu, isNodeSelection, useCurrentEditor } from "@tiptap/react";
import type { BubbleMenuProps } from "@tiptap/react";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import type { Instance, Props } from "tippy.js";

/**
 * Eigenschaften für die EditorBubble-Komponente.
 * 
 * @interface EditorBubbleProps
 * @extends {Omit<BubbleMenuProps, "editor">}
 * @property {ReactNode} children - Die Steuerelemente / Buttons, die im Kontextmenü angezeigt werden sollen.
 */
export interface EditorBubbleProps extends Omit<BubbleMenuProps, "editor"> {
  readonly children: ReactNode;
}

/**
 * Eine Wrapper-Komponente für das Tiptap Bubble-Menü mit optimierten Anzeigekriterien.
 * Reicht das Ref an das umschließende HTMLElement-Element weiter.
 * 
 * @remarks
 * UX/Mental-Health: Zeigt das Formatierungsmenü nur bei tatsächlichen, nicht-leeren Textselektionen an.
 * Ausgeschlossen sind Bild-Knoten, nicht-editierbare Zustände sowie reine Ziehgriff-Selektionen (Node-Selection),
 * um kognitives Rauschen zu minimieren.
 * 
 * @param props - Eigenschaften zur Konfiguration des schwebenden Menüs.
 * @param ref - Ref auf das Container-Div-Element für Drittelemente (wie Tippy).
 * @returns Das schwebende Menü-Element als ReactNode, oder null bei fehlendem Editor.
 */
export const EditorBubble = forwardRef<HTMLDivElement, EditorBubbleProps>(
  ({ children, tippyOptions, ...rest }, ref) => {
    const { editor: currentEditor } = useCurrentEditor();
    const instanceRef = useRef<Instance<Props> | null>(null);

    useEffect(() => {
      if (!instanceRef.current || !tippyOptions?.placement) return;

      instanceRef.current.setProps({ placement: tippyOptions.placement });
      instanceRef.current.popperInstance?.update();
    }, [tippyOptions?.placement]);

    const bubbleMenuProps: Omit<BubbleMenuProps, "children"> = useMemo(() => {
      const shouldShow: BubbleMenuProps["shouldShow"] = ({ editor, state }) => {
        const { selection } = state;
        const { empty } = selection;

        // Bubble-Menü nicht anzeigen, wenn:
        // - der Editor nicht editierbar ist
        // - das markierte Element ein Bild ist
        // - die Selektion leer ist
        // - es eine Knotenselektion ist (z. B. für Drag-Handles)
        if (!editor.isEditable || editor.isActive("image") || empty || isNodeSelection(selection)) {
          return false;
        }
        return true;
      };

      return {
        shouldShow,
        tippyOptions: {
          onCreate: (val) => {
            instanceRef.current = val;

            instanceRef.current.popper.firstChild?.addEventListener("blur", (event) => {
              event.preventDefault();
              event.stopImmediatePropagation();
            });
          },
          moveTransition: "transform 0.15s ease-out",
          ...tippyOptions,
        },
        editor: currentEditor,
        ...rest,
      };
    }, [rest, tippyOptions, currentEditor]);

    if (!currentEditor) return null;

    return (
      // Zur Behebung des Fehlers: https://github.com/ueberdosis/tiptap/issues/2658
      <div ref={ref}>
        <BubbleMenu {...bubbleMenuProps}>{children}</BubbleMenu>
      </div>
    );
  },
);

EditorBubble.displayName = "EditorBubble";

export default EditorBubble;
