import React from 'react';
import styled from 'styled-components';

const Aside = styled.aside`
  width: 40px;
  height: 100%;
  background-color: var(--bg-sidebar);
`;

const Sidebar: React.FC<{}> = () => (
  <Aside />
);

export default Sidebar;