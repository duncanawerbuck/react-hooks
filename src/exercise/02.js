// useEffect: persistent state
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react';

function Greeting({initialName = ''}) {
  // 🐨 initialize the state to the value from localStorage
  const nameFromLocalStorage =
    window.localStorage.getItem('name') ?? initialName;
  const [name, setName] = React.useState(() => initialName || nameFromLocalStorage);

  // 🐨 Here's where you'll use `React.useEffect`.
  // The callback should set the `name` in localStorage.
  React.useEffect(() => {
    window.localStorage.setItem('name', name);
  });

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
