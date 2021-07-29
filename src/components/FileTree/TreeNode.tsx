import React, {useContext, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import type { TreeNodeProps } from './index';

import { TreeSettingsContext } from './index';
import { ReactComponent as IconFolderClose } from '../../assets/svg/folder.svg';
import { ReactComponent as IconFolderOpen } from '../../assets/svg/folder-open.svg';
import { ReactComponent as IconArrow } from '../../assets/svg/arrow.svg';
import { ReactComponent as IconFile } from '../../assets/svg/file.svg';

interface treeNodeFCProps extends TreeNodeProps {
  nodeIndex: number,
}

const NodeName = styled.span`
  margin-left: 2px;
  flex: 1;
`;

const CurrentNodeRow = styled.div<{
  depth: number,
  isFolder: boolean,
  isCurrentContextmenu: boolean,
  isCurrentSelectNode: boolean,
}>`
  display: flex;
  align-items: center;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 0 2px ${props => (props.depth - 1) * 18 + (props.isFolder ? 0 : 18) + 6}px;
  background-color: ${props => props.isCurrentSelectNode ? '#d3d3d3 !important' : props.isCurrentContextmenu ? 'red !important' : 'unset'};
  
  :hover {
    background-color: #d3d3d3;
  }
  
  & .tree-node-icon {
    flex-shrink: 0;
  }
  
  & button {
    flex-shrink: 0;
  }
  
  input {
    flex: 1;
    width: 100px;
  }
`;

const ButtonIcon = styled.button`
  height: 1em;
  width: 18px;
  line-height: 1em;
  outline: none;
  border: 0;
  padding: 0;
  margin: 0;
  background-color: transparent;
  cursor: pointer;
  user-select: none;
`;

const TreeNode: React.FC<treeNodeFCProps> = ({ depth, nodeIndex, expanded, path, type, name }) => {

  const { onNodeClick, onNodeContextmenu, currentContextmenuNode, currentSelectNode, currentEditNode, onNodeRename } = useContext(TreeSettingsContext);

  const [ isEditing, setIsEditing ] = useState<boolean>(false);

  const [ editInputValue, setEditInputValue ] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  const isFolder: boolean = type === 'folder';

  const isCurrentEditNode: boolean = currentEditNode !== null && path === currentEditNode;

  const isCurrentContextmenu: boolean = currentContextmenuNode !== null && path === currentContextmenuNode.path;

  const isCurrentSelectNode: boolean = currentSelectNode !== null && path === currentSelectNode;

  const IconFolder: React.FunctionComponent<any>= expanded ? IconFolderOpen : IconFolderClose;

  const handleNodeClick: () => void = () => {
    onNodeClick && onNodeClick(nodeIndex, isFolder);
  };

  const handleContextmenu: (e: React.MouseEvent) => void = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onNodeContextmenu && onNodeContextmenu(e, path, type, nodeIndex);
  };

  const handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
    setEditInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const value = editInputValue.trim();
    if (onNodeRename) {
      onNodeRename(nodeIndex, value, 'blur');
    }
  };

  const handleKeyDownEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const value = editInputValue.trim();
      if (onNodeRename) {
        onNodeRename(nodeIndex, value, 'enter');
      }
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleInputContextmenu = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    setIsEditing(isCurrentEditNode);
    !isCurrentEditNode && setEditInputValue('');
  }, [isCurrentEditNode]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
      setEditInputValue(name);
    }

  }, [ isEditing, name ]);

  return (
    <CurrentNodeRow isCurrentSelectNode={isCurrentSelectNode} isCurrentContextmenu={isCurrentContextmenu}  isFolder={isFolder} depth={depth} onClick={handleNodeClick}  onContextMenu={handleContextmenu}>
      {
        isFolder && (
          <ButtonIcon type='button'>
            <IconArrow width='1em' height='1em' className={classNames('tree-node-arrow', { 'rotate': !expanded })} />
          </ButtonIcon>
        )
      }
      {
        isFolder ? (
          <IconFolder width='18' height='1em' className="tree-node-icon" />
        ) : (
          <IconFile width='18' height='1em' className="tree-node-icon" />
        )
      }
      {
        isEditing ? (
          <input type="text" ref={inputRef} value={editInputValue} onClick={handleInputClick} onChange={handleInputChange} onBlur={handleInputBlur} onKeyDown={handleKeyDownEnter} onContextMenu={handleInputContextmenu} />
        ) : (
          <NodeName>{name}</NodeName>
        )
      }
    </CurrentNodeRow>
  );
};

export default TreeNode;