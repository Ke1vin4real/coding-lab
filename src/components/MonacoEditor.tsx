import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import styled from 'styled-components';
import { useDebounceFn } from '../utils/hooks';

const Container = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
`;

const MonacoEditor: React.FC = () => {
  const editorDOMRef = useRef<HTMLDivElement | null>(null);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorDOMRef.current) {
      editorRef.current = monaco.editor.create(editorDOMRef.current, {
        value: '',
        language: 'javascript',
        automaticLayout: true
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    }
  }, []);

  const debouncedFn = useDebounceFn(() => {
    const value = editorRef?.current?.getModel()?.getValue();
    console.log(value)
  });

  const changeFnRef = useRef<() => any>(debouncedFn);

  useEffect(() => {
    if (editorRef.current && changeFnRef.current) {
      const model = editorRef.current.getModel();

      model?.onDidChangeContent(changeFnRef.current)
    }
  }, []);

  return (
    <Container
      ref={editorDOMRef}
    />
  );
};

export default MonacoEditor;