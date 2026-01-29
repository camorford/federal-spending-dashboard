import { useParams } from 'react-router-dom'

function RecipientDetail() {
  const { id } = useParams()
  
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900">Recipient Details</h1>
      <p className="mt-2 text-gray-500">Recipient ID: {id}</p>
      <p className="mt-2 text-gray-500">Coming soon</p>
    </div>
  )
}

export default RecipientDetail
