import React from 'react';
import { createGlobalStyle } from 'styled-components';
import Layout from './components/Layout';

const GlobalStyles = createGlobalStyle`
  :root {
    --bg-sidebar: hsl(0 0% 91%);
    --bg-sidebar-collapsibale: #f3f3f3;
  }
`;

const App = () => (
  <>
    <GlobalStyles />
    <Layout />
  </>
);

export default App;
