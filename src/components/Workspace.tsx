import React from 'react';
import styled from 'styled-components';
import SplitPane from 'react-split-pane';
import EditorPanel from './EditorPanel';
import FileTree from './FileTree';

const Container = styled.div`
  flex: 1;
  position: relative;
`;

const Workspace: React.FC<{}> = () => {

  return (
    <Container>
      <SplitPane
        split="vertical"
        defaultSize="200px"
        minSize={0}
        resizerClassName="resizer-collapsible-area"
      >
        <FileTree />
        <SplitPane split="vertical" defaultSize="50%" resizerClassName="resizer-editor">
          <EditorPanel />
          <div>pane 3</div>
        </SplitPane>
      </SplitPane>
    </Container>
  );
};

export default Workspace;