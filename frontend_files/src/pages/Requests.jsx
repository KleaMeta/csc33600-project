function Requests({ submissions, handleApprove, handleDeny, requestError }) {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold mb-6">Open requests</h1>

      {requestError && <p className="text-red-500">{requestError}</p>}

      {submissions.length === 0 ? (
        <p className="text-gray-600">No requests submitted yet.</p>
      ) : (
        submissions.map((req, index) => (
          <div
            key={index}
            style={{ backgroundColor: "#F59E0B" }}
            className="border p-4 rounded-lg shadow-sm space-y-2"
          >
            <p>
              <strong>Price:</strong> {req.price}
            </p>
            <p>
              <strong>Date:</strong> {req.date}
            </p>
            <p>
              <strong>Ingredients:</strong> {req.ingredients.join(", ")}
            </p>
            <p>
              <strong>Equipment:</strong> {req.equipment.join(", ")}
            </p>
            <p>
              <strong>Request Summary:</strong> {req.summary}
            </p>
            {req.request_id && (
              <p>
                <strong>Request ID:</strong> {req.request_id}
              </p>
            )}

            {req.status === "approved" ? (
              <p className="text-green-700 font-bold mt-3">
                ✅ Request Approved
              </p>
            ) : (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleApprove(index)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleDeny(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Deny
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Requests;
