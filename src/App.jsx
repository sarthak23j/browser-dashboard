import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Bangs from './pages/Bangs';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="bangs" element={<Bangs />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
