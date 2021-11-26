/**
 * Fields in a request to update a single BORROW item.
 */
export interface UpdateBorrowRequest {
  name: string
  borrowDate: string
  returned: boolean
  remind: boolean
}