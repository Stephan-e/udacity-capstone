export interface BorrowItem {
  userId: string
  borrowId: string
  createdAt: string
  name: string
  borrowDate: string
  returned: boolean
  remind: boolean
  attachmentUrl?: string
}
