interface TripRecord {
    _id: string;
    imei: string;
    igitionOn?: boolean;
    igitionOF?: boolean;
    createdAt: string;
}

export const calculateTotalTripTime = (records: TripRecord[]): string => {
    // Sort records by createdAt timestamp
    records.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let totalDuration = 0;
    let tripStart: any;

    records.forEach(record => {
        if (record.igitionOn) {
            tripStart = new Date(record.createdAt); // Start trip
        } else if (record.igitionOF==false && tripStart) {
            const tripEnd = new Date(record.createdAt);
            totalDuration += (tripEnd.getTime() - tripStart.getTime()) / 1000; // Convert ms to seconds
            tripStart = null; // Reset trip start after calculating
        }
    });
    // If the last trip is still running, add time up to the current moment
    if (tripStart) {
        totalDuration += (Date.now() - tripStart.getTime()) / 1000; // Convert ms to seconds
    }

    // Convert total seconds to HH:MM:SS format
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    return `${hours}h ${minutes}m`;
};
