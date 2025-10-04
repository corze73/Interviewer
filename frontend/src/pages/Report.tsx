export function Report() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Interview Report</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Assessment Results</h2>
        <p className="text-gray-600">Detailed interview analysis and scoring will be displayed here.</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium">Communication</h3>
            <p className="text-2xl font-bold text-blue-600">8.5/10</p>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium">Technical Skills</h3>
            <p className="text-2xl font-bold text-green-600">9.2/10</p>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium">Problem Solving</h3>
            <p className="text-2xl font-bold text-purple-600">7.8/10</p>
          </div>
        </div>
      </div>
    </div>
  );
}