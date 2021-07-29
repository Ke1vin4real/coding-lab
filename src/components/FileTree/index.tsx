import React, { useState, createContext, useEffect, MouseEvent, useCallback } from 'react';
import styled from 'styled-components';

import TreeNode from './TreeNode';
import Contextmenu from '../Contextmenu';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { RootState } from '../../store';
import {addFile, addFolder, deleteFile, deleteFolder, renameFile, renameFolder} from '../../store/files';
import type { files } from '../../store/files';
import TemporaryTreeNode from "./TemporaryTreeNode";
import { ReactComponent as IconNewFile } from '../../assets/svg/create-file.svg';
import { ReactComponent as IconNewFolder } from '../../assets/svg/create-folder.svg';


interface TreeProps {
  projectName?: string,
}

interface treeSettingsProps {
  currentContextmenuNode: { path: string, type: 'file' | 'folder' } | null,
  currentSelectNode: string | null,
  currentEditNode: string | null,
  onNodeClick: ((index: number, isFolder: boolean) => void) | null,
  onNodeContextmenu: ((event: MouseEvent, path: string, type: 'file' | 'folder', index: number) => void) | null,
  onNodeRename: ((nodeIndex: number, newName: string, eventType: string) => void) | null,
}

export interface TreeNodeProps {
  depth: number,
  path: string,
  name: string,
  type: 'file' | 'folder',
  parentPath: string,
  hidden: boolean,
  expanded?: boolean,
  isTemporaryNode?: boolean,
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 13px;
  user-select: none;
  width: 100%;
`;

const ProjectName = styled.div`
  font-size: 12px;
  line-height: 12px;
  padding: 5px 0 5px 6px;
  display: flex;
  align-items: center;
  
  .icon-buttons {
    margin-left: auto;
    margin-right: 10px;
    white-space: nowrap;
    
    button + button {
      margin-left: 8px;
    }
  }
  
  button {
    border: 0;
    outline: none;
    padding: 0;
    margin: 0;
    background-color: transparent;
    cursor: pointer;
    height: 16px;
    width: 16px;
  }
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

  const dispatch = useAppDispatch();

  const [ treeData, setTreeData ] = useState<TreeNodeProps[]>(() => {
    return getInitialDataFromStore(filesMap);
  });

  const [ expanded ] = useState<boolean>(true);

  const [ currentContextmenuNode, setCurrentContextmenuNode ] = useState<{ path: string, type: 'folder' | 'file', index: number } | null>(null);

  const [ currentSelectNode, setCurrentSelectNode ] = useState<string | null>(null);

  const [ currentEditNode, setCurrentEditNode ]  = useState<string | null>(null);

  const [ contextmenuEventPosition, setContextmenuEventPosition ] = useState<{ clientX: number, clientY: number } | null>(null);

  const onClickDelete = useCallback(() => {
    if (currentContextmenuNode === null) return;

    const deletingNodeType = currentContextmenuNode.type;
    const deletingNodePath = currentContextmenuNode.path;
    const deletingNodeIndex = currentContextmenuNode.index;

    setCurrentContextmenuNode(null);
    setContextmenuEventPosition(null);

    if (deletingNodeType === 'file') {
      dispatch(deleteFile(deletingNodePath)).then(() => {
        const newTreeData = [...treeData];
        newTreeData.splice(deletingNodeIndex, 1);
        setTreeData(newTreeData);
      })
    } else if (deletingNodeType === 'folder') {
      const deletingPathPrefix = deletingNodePath + '/';
      const newTreeData = [...treeData];
      const deletingPaths: string[] = treeData.reduce((prev: string[], curr: TreeNodeProps) => {
        if (curr.path === deletingNodePath || curr.path.startsWith(deletingPathPrefix)) {
          prev.push(curr.path);
        }

        return prev;
      }, []);

      dispatch(deleteFolder(deletingPaths)).then(() => {
        newTreeData.splice(deletingNodeIndex, deletingPaths.length);
        setTreeData(newTreeData);
      });
    }
  }, [currentContextmenuNode, treeData, dispatch]);

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

  const onNodeClick = useCallback((index: number, isFolder: boolean) => {
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
  }, [treeData]);

  const onClickAddOnRoot = useCallback((type: 'file' | 'folder') => {
    setCurrentContextmenuNode(null);
    setContextmenuEventPosition(null);

    const newTreeData: TreeNodeProps[] = [...treeData];

    const temporaryTreeNode: TreeNodeProps = {
      depth: 1,
      path: '',
      name: '',
      type,
      parentPath: '/',
      hidden: false,
      isTemporaryNode: true,
    };

    let insertNodeIndex;

    if (type === 'folder') {
      insertNodeIndex = 0;
    } else {
      const firstChildFileNodeIndex = newTreeData.findIndex((node) => node.type === 'file' && node.parentPath === '/');
      insertNodeIndex = firstChildFileNodeIndex !== -1 ? firstChildFileNodeIndex : newTreeData.length;
    }

    newTreeData.splice(insertNodeIndex, 0, temporaryTreeNode);

    setTreeData(newTreeData);
  }, [treeData]);

  const onClickAdd = useCallback((type: 'file' | 'folder') => {
    if (!currentContextmenuNode) return;

    const { index: parentNodeIndex } = currentContextmenuNode;

    const parentNode = treeData[parentNodeIndex];

    if (!treeData[parentNodeIndex].expanded) {
      onNodeClick(parentNodeIndex, true);
    }

    const newTreeData: TreeNodeProps[] = [...treeData];

    const temporaryTreeNode: TreeNodeProps = {
      depth: parentNode.depth + 1,
      path: '',
      name: '',
      type,
      parentPath: parentNode.path,
      hidden: false,
      isTemporaryNode: true,
    };

    let insertNodeIndex;

    if (type === 'folder') {
      insertNodeIndex = parentNodeIndex + 1;
    } else {
      const firstChildFileNodeIndex = newTreeData.findIndex((node, index) => index > parentNodeIndex && node.type === 'file' && node.parentPath === parentNode.path);
      const nextParentNodeIndex = newTreeData.findIndex((node, index) => index > parentNodeIndex && !node.path.startsWith(parentNode.path));

      if (firstChildFileNodeIndex !== -1) insertNodeIndex = firstChildFileNodeIndex;
      else if (nextParentNodeIndex !== -1) insertNodeIndex = nextParentNodeIndex;
      else {
        insertNodeIndex = newTreeData.length;
      }
    }

    newTreeData.splice(insertNodeIndex, 0, temporaryTreeNode);

    setTreeData(newTreeData);

    setCurrentContextmenuNode(null);

    setContextmenuEventPosition(null);
  }, [currentContextmenuNode, treeData, onNodeClick]);

  const onNodeRename = useCallback((nodeIndex: number, newName: string, eventType: string) => {
    setCurrentEditNode(null);

    if (eventType === 'blur') return;

    const node = treeData[nodeIndex];

    if (newName === '' || newName === node.name) return;

    const pathSplit = node.path.split('/');

    pathSplit.pop();

    pathSplit.push(newName);

    const newNodePath = pathSplit.join('/');

    if (node.type === 'file') {
      if (treeData.some((i, index) => i.type === 'file' && index !== nodeIndex && i.parentPath === node.parentPath && i.name === newName)) return;

      dispatch(renameFile({ originPathname: node.path, newPathname: newNodePath, newFilename: newName })).then(() => {
        setTreeData(sortPartialFileData(treeData, nodeIndex, newName));
      });
    } else if (node.type === 'folder') {
      if (newName.indexOf('/') > -1) return;

      if (treeData.some((i, index) => i.type === 'folder' && index !== nodeIndex && i.parentPath === node.parentPath && i.name === newName)) return;

      const originPathPrefix = node.path;

      const _treeData = [...treeData];

      const childPaths: any[] = _treeData.reduce((accumulator: any[], currentValue: TreeNodeProps, index) => {
        const currentPath = currentValue.path;

        if (currentPath === originPathPrefix) {
          _treeData[index] = {
            ..._treeData[index],
            name: newName,
            path: newNodePath,
          }
        }

        if (currentPath.startsWith(originPathPrefix + '/')) {
          const _originPathname = currentValue.path;
          const _newPathname = _originPathname.replace(originPathPrefix, newNodePath);

          accumulator.push({ _originPathname, _newPathname });
          _treeData[index] = {
            ..._treeData[index],
            path: _newPathname,
            parentPath: _treeData[index].parentPath.replace(originPathPrefix, newNodePath),
          };
        }

        return accumulator;
      }, []);

      dispatch(renameFolder({ originPathname: originPathPrefix, newPathname: newNodePath, newFolderName: newName, childPaths })).then(() => {
        setTreeData(sortTreeData(_treeData));
      });
    }
  }, [treeData, dispatch]);

  const handleTemporaryNodeBlur = useCallback((nodeIndex: number) => {
    const newTreeData = [...treeData];
    newTreeData.splice(nodeIndex, 1);
    setTreeData(newTreeData);
  }, [treeData]);

  const handleTemporaryNodeKeydown = useCallback((nodeIndex: number, name: string, type: 'file' | 'folder', parentPath: string, path: string, depth: number) => {
    const newTreeData = [...treeData];

    newTreeData.splice(nodeIndex, 1);

    if (name !== '' && !newTreeData.some((node) => node.parentPath === parentPath && node.name === name)) {
      const newNode: TreeNodeProps = { type, path, parentPath, name, hidden: false, depth };
      if (type === 'folder') {
        newNode.expanded = false;
        dispatch(addFolder({name, path}));
      } else {
        dispatch(addFile({name, path, content: ''}));
      }
      newTreeData.splice(nodeIndex, 0, newNode)
    }

    setTreeData(sortTreeData(newTreeData));
  }, [dispatch, treeData]);

  const [ treeSetting, setTreeSetting ] = useState<treeSettingsProps>({
    currentContextmenuNode: null,
    currentEditNode: null,
    currentSelectNode: null,
    onNodeClick,
    onNodeRename,
    onNodeContextmenu: (event, path, type, index) => {
      const { clientX, clientY } = event;
      setCurrentContextmenuNode({ path, type, index });
      setContextmenuEventPosition({ clientX, clientY });
    },
  });

  useEffect(() => {
    setTreeSetting((setting) => ({
      ...setting,
      currentContextmenuNode,
      currentSelectNode,
      currentEditNode,
      onNodeRename,
      onNodeClick,
    }));
  }, [ currentContextmenuNode, currentSelectNode, currentEditNode, onNodeRename, onNodeClick ]);

  return (
    <TreeSettingsContext.Provider value={treeSetting}>
      <Container>
        <ProjectName>
          <strong>{projectName}</strong>
          <div className="icon-buttons">
            <button type="button" onClick={() => onClickAddOnRoot('file')}>
              <IconNewFile width="16" height="16" />
            </button>
            <button type="button" onClick={() => onClickAddOnRoot('folder')}>
              <IconNewFolder width="16" height="16" />
            </button>
          </div>
        </ProjectName>
        {
          expanded && treeData.map((treeNode, index) => (
            treeNode.hidden ? null : (
              treeNode.isTemporaryNode ? (
                <TemporaryTreeNode
                  key={treeNode.path}
                  nodeIndex={index}
                  onEnter={handleTemporaryNodeKeydown}
                  onBlur={handleTemporaryNodeBlur}
                  {...treeNode}
                />
              ) : (
                <TreeNode
                  key={treeNode.path}
                  nodeIndex={index}
                  {...treeNode}
                />
              )
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

function sortPartialFileData(data: TreeNodeProps[], index: number, newName: string) {
  const _data = [...data];

  const node = _data[index];

  const { parentPath } = node;

  const pathSplit = node.path.split('/');

  pathSplit.pop();

  pathSplit.push(newName);

  node.name = newName;

  node.path = pathSplit.join('/');

  return _data.sort((a, b) => {
    if (a.type === 'file' && b.type === 'file' && a.parentPath === parentPath && b.parentPath === parentPath) {
      return a.name < b.name ? -1 : 1;
    }

    return 0;
  });
}

export default FileTree;