import { useParams } from 'react-router-dom'

function AgencyDetail() {
  const { id } = useParams()
  
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900">Agency Details</h1>
      <p className="mt-2 text-gray-500">Agency ID: {id}</p>
      <p className="mt-2 text-gray-500">Coming soon</p>
    </div>
  )
}

export default AgencyDetail
