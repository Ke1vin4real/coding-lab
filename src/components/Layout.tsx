import React from 'react';
import styled from "styled-components";
import Sidebar from './Sidebar';
import Workspace from './Workspace';

const Main = styled.main`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: var(--bg-sidebar);
  height: 40px;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
`;

const Layout: React.FC<{}> = () => (
  <Main>
    <Header>Header</Header>
    <Body>
      <Sidebar />
      <Workspace />
    </Body>
  </Main>
);

export default Layout;