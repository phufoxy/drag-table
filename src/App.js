import React, { Component } from 'react';
import DnDTable from './DnDTable';
import update from 'immutability-helper';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: [
        {
          id: '1',
          name: 'grandfather1',
          parentId: null,
          subRows: [
            {
              id: '1-1',
              name: 'parent1',
              parentId: '1',
              subRows: [
                {
                  id: '1-1-1',
                  name: 'children1',
                  parentId: '1-1',
                  subRows: [],
                },
                {
                  id: '1-1-2',
                  name: 'children2',
                  parentId: '1-1',
                  subRows: [],
                },
              ],
            },
            {
              id: '1-2',
              name: 'parent2',
              parentId: '1',
              subRows: [
                {
                  id: '1-2-1',
                  name: 'children1',
                  parentId: '1-2',
                  subRows: [],
                },
                {
                  id: '1-2-2',
                  name: 'children2',
                  parentId: '1-2',
                  subRows: [],
                },
              ],
            },
          ],
        },
        {
          id: '2',
          name: 'grandfather2',
          parentId: null,
          subRows: [
            {
              parentId: '2',
              id: '2-1',
              name: 'parent1',
              subRows: [],
            },
          ],
        },
      ],
    };
  }

  columns = () => [
    {
      accessor: 'id',
      Header: 'ID',
      Cell: (row) => row.value,
    },
    {
      accessor: 'name',
      Header: 'Name',
      Cell: (row) => row.value,
    },
  ];

  moveRow = (flatRows, dragIndex, hoverIndex) => {
    const { data } = this.state;
    const source = flatRows[dragIndex];
    const target = flatRows[hoverIndex];
    const indexSource = source.index;
    const indexTarget = target.index;
    const sameRow = source?.original?.parentId === target?.original?.parentId;
    const sameDepth = source.depth === target.depth;
    // move level 0
    if (source.depth === 0 && sameDepth && sameRow) {
      const dataDrag = update(data, {
        $splice: [
          [indexSource, 1],
          [indexTarget, 0, data[indexSource]],
        ],
      });
      this.setState({
        data: dataDrag,
      });
    }
    // move level 1
    if (source.depth === 1 && sameDepth && sameRow) {
      const parent = flatRows.find(
        (i) => i.original.id === source.original.parentId
      );
      const dataDrag = update(data, {
        [parent.index]: {
          subRows: {
            $splice: [
              [indexSource, 1],
              [indexTarget, 0, data[parent.index].subRows[indexSource]],
            ],
          },
        },
      });
      this.setState({
        data: dataDrag,
      });
    }
    // move level 2
    if (source.depth === 2 && sameDepth && sameRow) {
      const parent = flatRows.find(
        (i) => i.original.id === source.original.parentId
      );
      const grandFather = flatRows.find(
        (i) => i.original.id === parent.original.parentId
      );
      const dataDrag = update(data, {
        [grandFather.index]: {
          subRows: {
            [parent.index]: {
              subRows: {
                $splice: [
                  [indexSource, 1],
                  [
                    indexTarget,
                    0,
                    data[grandFather.index].subRows[parent.index].subRows[
                      indexSource
                    ],
                  ],
                ],
              },
            },
          },
        },
      });
      this.setState({
        data: dataDrag,
      });
    }
  };

  render() {
    const { data } = this.state;
    return (
      <DnDTable
        bordered
        columns={this.columns()}
        data={data}
        sortRow={this.moveRow}
        expanded={{
          0: true,
          '0.0': true,
          0.1: true,
          1: true,
          '1.0': true,
          1.1: true,
        }}
      />
    );
  }
}

export default App;
