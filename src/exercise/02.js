// useEffect: persistent state
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react';

function Greeting({initialName = ''}) {
  // Here we're using a custom hook that hides and encapsulates the use of localStorage. The custom
  // hook is implemented at the end of this file.
  const [name, setName] = useLocalStorageState(initialName);

  function handleChange(event) {
    setName(event.target.value);
  }

  return (
    <div>
      <form>
        <label htmlFor="name">Name: </label>
        <input value={name} onChange={handleChange} id="name" />
      </form>
      {name ? <strong>Hello {name}</strong> : 'Please type your name'}
    </div>
  );
}

function App() {
  return <Greeting />;
}

export default App;

/**
 * A custom hook that encapsulates the use of localStorage for reading and setting the name value,
 * allowing the name value that a user enters to be preserved across page refreshes.
 */
function useLocalStorageState(initialName) {
  const [name, setName] = React.useState(
    () => window.localStorage.getItem('name') || initialName || ''
  );

  React.useEffect(() => {
    window.localStorage.setItem('name', name);
  }, [name]);

  return [name, setName];
}
