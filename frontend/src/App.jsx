import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Awards from './pages/Awards'
import Agencies from './pages/Agencies'
import AgencyDetail from './pages/AgencyDetail'
import Recipients from './pages/Recipients'
import RecipientDetail from './pages/RecipientDetail'
import Search from './pages/Search'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/agencies" element={<Agencies />} />
        <Route path="/agencies/:id" element={<AgencyDetail />} />
        <Route path="/recipients" element={<Recipients />} />
        <Route path="/recipients/:id" element={<RecipientDetail />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Layout>
  )
}

export default App