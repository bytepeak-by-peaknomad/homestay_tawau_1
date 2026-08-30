export interface Review {
  id: string;
  homestayId: string;
  rating: number;
  title: string | null;
  comment: string;
  reviewerName: string;
  createdAt: string;
}
