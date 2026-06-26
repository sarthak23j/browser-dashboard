import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Bangs from './pages/Bangs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="bangs" element={<Bangs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
