export interface CreateBookingDto{
    packageId : string;
    eventId : string;
    priceOffered: number;
    startDate: string;
    endDate: string;
    message?: string;
}