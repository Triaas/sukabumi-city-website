'use server'

import { getAllNews } from './db'

export async function fetchNews() {
  return await getAllNews()
}
