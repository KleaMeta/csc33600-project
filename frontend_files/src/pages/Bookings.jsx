function Bookings({ bookings, handleCancel, bookingError }) {
    return (
        <div className="p-8 max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

            {bookingError && <p className="text-red-500">{bookingError}</p>}

            {bookings.length === 0 ? (
                <p className="text-gray-600">No bookings yet.</p>
            ) : (
                bookings.map((req, index) => (
                    <div
                        key={req.request_id ?? index}
                        style={{ backgroundColor: "#F59E0B" }}
                        className="border p-4 rounded-lg shadow-sm space-y-2"
                    >
                        <p><strong>Price:</strong> {req.price}</p>
                        <p><strong>Date:</strong> {req.date}</p>
                        <p><strong>Ingredients:</strong> {req.ingredients.join(", ")}</p>
                        <p><strong>Equipment:</strong> {req.equipment.join(", ")}</p>
                        <p><strong>Request Summary:</strong> {req.summary}</p>
                        {req.request_id && (
                            <p><strong>Booking ID:</strong> {req.request_id}</p>
                        )}

                        <p className="text-green-700 font-bold">✅ Confirmed</p>

                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => handleCancel(req.request_id)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Bookings;