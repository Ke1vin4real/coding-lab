import React from 'react';
import styled from "styled-components";
import MonacoEditor from "./MonacoEditor";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const EditorPanel: React.FC<{}> = () => {
  return (
    <Container>
      <MonacoEditor />
    </Container>
  )
};

export default EditorPanel;