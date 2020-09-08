import { DndProvider, createDndContext, useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';
import { useExpanded, useTable } from 'react-table';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React from 'react';

const Styles = styled.div`
  .drag {
    cursor: ns-resize;
  }
  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;
function DnDTable({ columns, data, footer, sortRow, onRowChange, expanded }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    flatRows,
  } = useTable(
    {
      columns: columns,
      data,
      initialState: {
        expanded: expanded,
      },
    },
    useExpanded // Use the useExpanded plugin hook
  );
  const moveRow = (dragIndex, hoverIndex) => {
    sortRow(flatRows, dragIndex, hoverIndex);
  };

  const manager = React.useRef(createDndContext(HTML5Backend));

  return (
    <>
      <Styles>
        <DndProvider manager={manager.current.dragDropManager}>
          <table {...getTableProps()} className='ant-table-fixed'>
            <thead className='ant-table-thead'>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  <th>Move</th>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                      {column.render('Header')}{' '}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className='ant-table-tbody' {...getTableBodyProps()}>
              {rows.map(
                (row, index) =>
                  prepareRow(row) || (
                    <Row
                      key={index}
                      id={row.id}
                      index={index}
                      moveRow={moveRow}
                      row={row}
                    />
                  )
              )}
            </tbody>
          </table>
        </DndProvider>
      </Styles>
    </>
  );
}
const DND_ITEM_TYPE = 'row';

const Row = ({ row, index, moveRow }) => {
  const dropRef = React.useRef(null);
  const dragRef = React.useRef(null);

  const [, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    drop(item, monitor) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: DND_ITEM_TYPE, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;

  preview(drop(dropRef));
  drag(dragRef);

  return (
    <tr
      ref={dropRef}
      className={`ant-table-row ant-table-row-level-${row.depth}`}
      style={{ opacity }}
      {...row.getRowProps()}
    >
      <td ref={dragRef}>Move</td>
      {row.cells.map((cell) => (
        <td className='ant-table-row-cell-break-word' {...cell.getCellProps()}>
          {cell.render('Cell')}
        </td>
      ))}
    </tr>
  );
};

export default DnDTable;
