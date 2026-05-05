export interface CreateFeedbackDto {
  vendorId: string;
  userId: string;
  rating: number;
  comment?: string;
}
