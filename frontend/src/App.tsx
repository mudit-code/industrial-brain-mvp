import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Copilot from './pages/Copilot';
import Documents from './pages/Documents';
import Assets from './pages/Assets';
import Compliance from './pages/Compliance';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/copilot" element={<Copilot />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/compliance" element={<Compliance />} />
      </Route>
    </Routes>
  );
}

export default App;
