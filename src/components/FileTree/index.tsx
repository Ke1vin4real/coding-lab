import React, { useState, createContext, useEffect, MouseEvent, useCallback } from 'react';
import styled from 'styled-components';

import TreeNode from './TreeNode';
import Contextmenu from '../Contextmenu';
import { useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import type { files } from '../../store/files';

interface TreeProps {
  projectName?: string,
}

interface treeSettingsProps {
  currentContextmenuNode: { path: string, type: 'file' | 'folder' } | null,
  currentSelectNode: string | null,
  currentEditNode: string | null,
  onNodeClick: ((index: number, isFolder: boolean) => void) | null,
  onNodeContextmenu: ((event: MouseEvent, path: string, type: 'file' | 'folder') => void) | null,
  onNodeRename: ((nodeIndex: number, newName: string) => void) | null,
}

export interface TreeNodeProps {
  depth: number,
  path: string,
  name: string,
  type: 'file' | 'folder',
  parentPath: string,
  hidden: boolean,
  expanded?: boolean,
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 13px;
  padding-left: 6px;
  user-select: none;
`;

const ProjectName = styled.div`
  font-size: 12px;
  line-height: 12px;
  padding: 5px 0;
`;

export const TreeSettingsContext = createContext<treeSettingsProps>({
  currentContextmenuNode: null,
  currentSelectNode: null,
  currentEditNode: null,
  onNodeClick: null,
  onNodeContextmenu: null,
  onNodeRename: null,
});

const FileTree: React.FC<TreeProps> = ({ projectName = 'PROJECT' }) => {
  const { filesMap } = useAppSelector((state: RootState) => state.files);

  const [ treeData, setTreeData ] = useState<TreeNodeProps[]>(() => {
    return getInitialDataFromStore(filesMap);
  });

  const [ expanded ] = useState<boolean>(true);

  const [ currentContextmenuNode, setCurrentContextmenuNode ] = useState<{ path: string, type: 'folder' | 'file' } | null>(null);

  const [ currentSelectNode, setCurrentSelectNode ] = useState<string | null>(null);

  const [ currentEditNode, setCurrentEditNode ]  = useState<string | null>(null);

  const [ contextmenuEventPosition, setContextmenuEventPosition ] = useState<{ clientX: number, clientY: number } | null>(null);

  const [ treeSetting, setTreeSetting ] = useState<treeSettingsProps>({
    currentContextmenuNode: null,
    currentEditNode: null,
    currentSelectNode: null,
    onNodeClick: (index, isFolder) => {
      const { path: clickedPath, expanded } = treeData[index];

      setCurrentSelectNode(clickedPath);

      if (!isFolder) return;

      const newTreeData = [...treeData];

      const clickedNodeExpandedState = !expanded;

      newTreeData[index].expanded = clickedNodeExpandedState;

      const expandedRecord: any = {};

      newTreeData.forEach((node) => {
        const { path } = node;

        if (path === clickedPath || !(path).startsWith(clickedPath + '/')) {
          return
        }

        node.hidden = clickedNodeExpandedState ? Object.keys(expandedRecord).some((path) => node.path.startsWith(path + '/') && !expandedRecord[path]) : true;

        if (node.type === 'folder') {
          expandedRecord[path] = node.expanded;
        }
      });

      setTreeData(newTreeData);
    },
    onNodeContextmenu: (event, path, type) => {
      const { clientX, clientY } = event;
      setCurrentContextmenuNode({ path, type });
      setContextmenuEventPosition({ clientX, clientY });
    },
    onNodeRename: (nodeIndex: number, newName: string) => {
      console.log(nodeIndex, newName)
      setCurrentEditNode(null);
    },
  });

  const onClickAdd = useCallback(() => {}, []);

  const onClickDelete = useCallback(() => {}, []);

  const onClickRename = useCallback(() => {
    if (currentContextmenuNode !== null) {
      setCurrentEditNode(currentContextmenuNode.path);
    }
    setCurrentContextmenuNode(null);
    setContextmenuEventPosition(null);
  }, [currentContextmenuNode]);

  const onClickOutsideContextmenu = useCallback(() => {
    setCurrentContextmenuNode(null);
    setContextmenuEventPosition(null);
  }, []);

  useEffect(() => {
    setTreeSetting((setting) => ({
      ...setting,
      currentContextmenuNode,
      currentSelectNode,
      currentEditNode,
    }));
  }, [ currentContextmenuNode, currentSelectNode, currentEditNode ]);

  return (
    <TreeSettingsContext.Provider value={treeSetting}>
      <Container>
        <ProjectName>
          <strong>{projectName}</strong>
        </ProjectName>
        {
          expanded && treeData.map((treeNode, index) => (
            treeNode.hidden ? null : (
              <TreeNode
                key={treeNode.path}
                nodeIndex={index}
                {...treeNode}
              />
            )
          ))
        }
      </Container>
      <Contextmenu
        currentNodeType={currentContextmenuNode ? currentContextmenuNode.type : null}
        contextmenuEventPosition={contextmenuEventPosition}
        onAdd={onClickAdd}
        onDelete={onClickDelete}
        onRename={onClickRename}
        onClickOutside={onClickOutsideContextmenu}

      />
    </TreeSettingsContext.Provider>
  )
};

function getInitialDataFromStore(data: files): TreeNodeProps[] {
  const paths = Object.keys(data);

  const result = paths.map(path => {
    const { name, type } = data[path];

    const pathSplit = path.split('/');

    const depth = pathSplit.filter(Boolean).length;

    pathSplit.pop();

    const parentPath = pathSplit.join('/');

    const node: TreeNodeProps = {
      name,
      type,
      path,
      depth,
      parentPath: parentPath === '' ? '/' : parentPath,
      hidden: depth !== 1,
    };

    if (type === 'folder') {
      node.expanded = false;
    }

    return node;
  });

  return sortTreeData(result);
}

function sortTreeData(data: TreeNodeProps[]): TreeNodeProps[] {
  return data.sort((a, b) => {

    if (a.type === 'file' && b.type === 'file') {
      if (a.parentPath === b.parentPath) {
        return a.name < b.name ? -1 : 1;
      } else if (a.parentPath.startsWith(b.parentPath === '/' ? '/' : b.parentPath + '/')) {
        return -1;
      } else if (b.parentPath.startsWith(a.parentPath === '/' ? '/' : a.parentPath + '/')) {
        return 1;
      }

      return a.parentPath < b.parentPath ? -1 : 1;

    } else if (a.type === 'folder' && b.type === 'file') {
      if (a.parentPath === b.parentPath) {
        return -1;
      } else if (a.path === b.parentPath) {
        return -1;
      } else if (a.path.startsWith(b.parentPath === '/' ? '/' : b.parentPath + '/')) {
        return -1;
      } else if (b.parentPath.startsWith(a.path === '/' ? '/' : a.path + '/')) {
        return -1;
      }

      return a.path < b.parentPath ? -1 : 1;

    } else if (a.type === 'file' && b.type === 'folder') {
      if (a.parentPath === b.parentPath) {
        return 1;
      } else if (a.parentPath === b.path) {
        return 1;
      } else if (a.parentPath.startsWith(b.path === '/' ? '/' : b.path + '/')) {
        return 1;
      } else if (b.path.startsWith(a.parentPath === '/' ? '/' : a.parentPath + '/')) {
        return 1;
      }

      return a.parentPath < b.path ? -1 : 1;
    }

    return a.path < b.path ? -1 : 1;
  });
}

export default FileTree;