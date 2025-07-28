import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './GrapesEditor.css';

interface GrapesEditorProps {
  initialHtml?: string;
  onUpdate?: (data: { html: string; css: string }) => void;
}

const GrapesEditor: React.FC<GrapesEditorProps> = ({ initialHtml, onUpdate }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      fromElement: false,
      height: '100vh',
      width: 'auto',
      storageManager: false,
      components: initialHtml || '',
      style: '',
    });

    // Optional: callback on content change
    editor.on('update' as any, () => {
      const html = editor.getHtml();
      const css = editor.getCss();
      onUpdate?.({ html, css: typeof css === 'string' ? css : '' });
    });

    return () => editor.destroy();
  }, [initialHtml, onUpdate]);

  return <div ref={editorRef} />;
};

export default GrapesEditor; 