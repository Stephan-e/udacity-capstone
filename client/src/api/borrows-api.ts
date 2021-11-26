import { apiEndpoint } from '../config'
import { Borrow } from '../types/Borrow';
import { CreateBorrowRequest } from '../types/CreateBorrowRequest';
import Axios from 'axios'
import { UpdateBorrowRequest } from '../types/UpdateBorrowRequest';

export async function getBorrows(idToken: string): Promise<Borrow[]> {
  console.log('Fetching borrows')

  const response = await Axios.get(`${apiEndpoint}/borrows`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Borrows:', response.data)
  return response.data.items
}

export async function createBorrow(
  idToken: string,
  newBorrow: CreateBorrowRequest
): Promise<Borrow> {
  const response = await Axios.post(`${apiEndpoint}/borrows`,  JSON.stringify(newBorrow), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchBorrow(
  idToken: string,
  borrowId: string,
  updatedBorrow: UpdateBorrowRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/borrows/${borrowId}`, JSON.stringify(updatedBorrow), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteBorrow(
  idToken: string,
  borrowId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/borrows/${borrowId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  borrowId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/borrows/${borrowId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
