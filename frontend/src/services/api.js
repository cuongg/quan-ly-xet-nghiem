export const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export async function workspaceRequest(token, payload) {
  const response = await fetch(apiBase + '/workspace', {
    method: payload ? 'PUT' : 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  })
  if (!response.ok)
    throw new Error(
      response.status === 409
        ? 'Dữ liệu đã thay đổi. Hãy tải lại trang.'
        : response.status === 401
          ? 'Khóa truy cập không hợp lệ.'
          : 'Không thể đọc hoặc lưu dữ liệu trên API.',
    )
  return response.json()
}
