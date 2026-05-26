/**
 * @fileoverview Custom-Tiptap-Erweiterung für benutzerdefinierte Tastaturkürzel.
 * Ermöglicht eine verbesserte Textauswahl innerhalb von Blockgrenzen.
 * @module CustomKeymapExtension
 */

import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customkeymap: {
      /**
       * Wählt den gesamten Text innerhalb der Node-Grenzen aus.
       */
      selectTextWithinNodeBoundaries: () => ReturnType;
    };
  }
}

/**
 * CustomKeymap-Erweiterung für Tiptap.
 * Implementiert verbesserte Selektionsmechaniken (z.B. Strg+A zur Bereichsauswahl).
 * 
 * @remarks
 * UX: Ermöglicht ein intuitiveres Markieren von Text innerhalb von Überschriften,
 * Listen und Absätzen, ohne versehentlich den gesamten Editorinhalt zu selektieren.
 */
const CustomKeymap = Extension.create({
  name: "CustomKeymap",

  /**
   * Registriert neue Befehle in der Editor-Befehlspalette.
   * 
   * @returns Die benutzerdefinierten Befehlsfunktionen.
   */
  addCommands() {
    return {
      selectTextWithinNodeBoundaries:
        () =>
        ({ editor, commands }) => {
          const { state } = editor;
          const { tr } = state;
          const startNodePos = tr.selection.$from.start();
          const endNodePos = tr.selection.$to.end();
          return commands.setTextSelection({
            from: startNodePos,
            to: endNodePos,
          });
        },
    };
  },

  /**
   * Registriert benutzerdefinierte Shortcuts für Tastaturereignisse.
   * 
   * @returns Zuordnung von Hotkeys zu Steuerungsfunktionen.
   */
  addKeyboardShortcuts() {
    return {
      "Mod-a": ({ editor }) => {
        const { state } = editor;
        const { tr } = state;
        const startSelectionPos = tr.selection.from;
        const endSelectionPos = tr.selection.to;
        const startNodePos = tr.selection.$from.start();
        const endNodePos = tr.selection.$to.end();
        const isCurrentTextSelectionNotExtendedToNodeBoundaries =
          startSelectionPos > startNodePos || endSelectionPos < endNodePos;
        if (isCurrentTextSelectionNotExtendedToNodeBoundaries) {
          editor.chain().selectTextWithinNodeBoundaries().run();
          return true;
        }
        return false;
      },
    };
  },
});

export default CustomKeymap;
