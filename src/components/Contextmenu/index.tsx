import React, {useState, useRef, useEffect, CSSProperties, useCallback} from 'react';
import styled from 'styled-components';

interface contextmenuProps {
  currentNodeType: 'file' | 'folder' | null,
  contextmenuEventPosition: {
    clientX: number,
    clientY: number,
  } | null,
  onClickOutside: () => void,
  onAdd: () => void,
  onDelete: () => void,
  onRename: () => void,
}

const Container = styled.ul<{ show: boolean }>`
  z-index: 100;
  position: fixed;
  background-color: #fff;
  border: 1px solid #ddd;
  cursor: pointer;
  width: 120px;
  font-size: 14px;
  left: 0;
  top: 0;
  visibility: ${(props) => props.show ? 'visible' : 'hidden'};
  
  & > li {
    height: 30px;
    line-height: 30px;
    padding-left: 20px;
  }
  
  & > li:hover {
    background-color: #d3d3d3;
  }
  
  & > li:last-child {
    color: red;
  }
`;

const Contextmenu = ({ currentNodeType, contextmenuEventPosition, onClickOutside, onAdd, onDelete, onRename }: contextmenuProps) => {

  const [ style, setStyle ] = useState<CSSProperties | undefined>(undefined);

  const [ show, setShow ] = useState<boolean>(false);

  const contextmenuDOMRef = useRef<HTMLUListElement | null>(null);

  const handleBodyClick = useCallback((event: MouseEvent) => {
    if (contextmenuDOMRef.current && !contextmenuDOMRef.current.contains(event.target as HTMLElement)) {
      onClickOutside();
    }
  }, [contextmenuDOMRef, onClickOutside]);

  useEffect(() => {
    document.body.addEventListener('click', handleBodyClick);

    return () => {
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, [handleBodyClick]);

  useEffect(() => {
    if (contextmenuEventPosition === null) {
      setShow(false);
      return;
    }

    if (!contextmenuDOMRef.current)return;

    const { clientX, clientY } = contextmenuEventPosition;

    const screenW: number = window.innerWidth;
    const screenH: number = window.innerHeight;

    const rightClickRefW: number = contextmenuDOMRef.current.offsetWidth;
    const rightClickRefH: number = contextmenuDOMRef.current.offsetHeight;

    const canAtRight: boolean = (screenW - clientX) > rightClickRefW;
    const canAtTop: boolean = (screenH - clientY) > rightClickRefH;

    const left = canAtRight ?  clientX + 6 : clientX - rightClickRefW - 6;
    const top = canAtTop ? clientY : clientY - rightClickRefH;

    setStyle({ left, top });
  }, [ contextmenuEventPosition ]);

  useEffect(() => {
    if (style) {
      setShow(true);
    }
  }, [style]);

  return (
    <Container ref={contextmenuDOMRef} style={style} show={show} >
      {
        currentNodeType === 'folder' && (
          <>
            <li onClick={onAdd}>New File</li>
            <li onClick={onAdd}>New Folder</li>
          </>
        )
      }
      <li onClick={onRename}>Rename</li>
      <li onClick={onDelete}>Delete</li>
    </Container>
  );
};

export default Contextmenu;