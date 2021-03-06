import React from 'react';
import AceEditor from 'react-ace';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './App.global.css';

import store, { ReduxState } from './redux';
import { _editor } from './redux/actions';
import { EditorCell } from './kernel/types';
import useKernel from './kernel/useKernel';
import AceImports from './components/AceImports';

const editorOptions = {
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
};

const Editor = () => {
  const kernel = useKernel();
  const cells = useSelector((state: ReduxState) => state.editor.cells);

  const dispatch = useDispatch();
  const dispatchExecuteCode = React.useCallback(
    (cell: EditorCell) => kernel !== null && dispatch(_editor.executeCode(kernel, cell)),
    [dispatch, kernel]
  );
  const dispatchUpdateCellCode = React.useCallback(
    (cellId: string, code: string) => dispatch(_editor.updateCellCode(cellId, code)),
    [dispatch]
  );

  return (
    <div>
      {AceImports}

      {cells.map((cell) => (
        <React.Fragment key={cell._id}>
          <AceEditor
            name={cell._id}
            mode="python"
            theme="xcode"
            value={cell.code}
            onChange={(newValue) => dispatchUpdateCellCode(cell._id, newValue)}
            setOptions={editorOptions}
          />

          <button type="button" disabled={kernel === null || cell.active} onClick={() => dispatchExecuteCode(cell)}>
            Execute
          </button>

          <div>
            {cell.output.map((message) => (
              <React.Fragment key={message._id}>
                {message.name === 'stdout' ? (
                  message.data.text
                    .split('\n')
                    .map((subtext, subindex) => <p key={`${message._id}.${subindex}`}>{subtext}</p>)
                ) : message.name === 'display_data' ? (
                  <img src={`data:image/png;base64,${message.data.image}`} alt="" />
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/" component={Editor} />
        </Switch>
      </Router>
    </Provider>
  );
}
