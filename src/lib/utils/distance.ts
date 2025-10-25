export interface Location {
    latitude: number;
    longitude: number;
}

export function calculateDistance(from: Location | null, to: Location | null): number | null {
    if (!from || !to) return null;
    
    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in km
    const dLat = (to.latitude - from.latitude) * Math.PI / 180;
    const dLon = (to.longitude - from.longitude) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
