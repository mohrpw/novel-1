/**
 * @fileoverview Menü-Umschalter für das generative AI-Feature im Editor-Popover.
 * Bietet schnellen Zugriff auf AI-Assistenzfunktionen basierend auf Textmarkierungen.
 * @module GenerativeMenuSwitch
 */

import { EditorBubble, removeAIHighlight, useEditor } from "novel";
import { Fragment, useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "../ui/button";
import Magic from "../ui/icons/magic";
import { AISelector } from "./ai-selector";

/**
 * Eigenschaften für den GenerativeMenuSwitch-Umschalter.
 * 
 * @interface GenerativeMenuSwitchProps
 * @property {ReactNode} children - Die zusätzlichen Steuerungselemente oder Menü-Knöpfe im Bubble-Menü.
 * @property {boolean} open - Gibt an, ob der KI-Fragedialog geöffnet ist.
 * @property {(open: boolean) => void} onOpenChange - Callback-Handler bei Statusänderung des Dialogs.
 */
interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Menü-Umschalter für generative AI-Aufrufe innerhalb des Tiptap Bubble-Menüs.
 * Schaltet zwischen dem Standardmenü und der AI-Selektorleiste hin- und her.
 * 
 * @remarks
 * UX/Mental-Health: Durch Fokussierung des AI-Selectors wird dem Anwender eine
 * kontextbasierte Unterstützung zur Entlastung des Arbeitsgedächtnisses bereitgestellt.
 * 
 * @param props - Eigenschaften des AI-Umschalters.
 * @returns Ein Tiptap EditorBubble Menü-Element.
 */
const GenerativeMenuSwitch = ({ children, open, onOpenChange }: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    if (!open) {
      removeAIHighlight(editor);
    }
  }, [open, editor]);

  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          editor.chain().unsetHighlight().run();
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      {open && <AISelector open={open} onOpenChange={onOpenChange} />}
      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
