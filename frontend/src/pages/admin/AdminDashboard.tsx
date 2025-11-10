const AdminDashboard = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Categories</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Dealers</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

