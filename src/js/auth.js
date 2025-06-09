import axios from 'axios'

export async function useAuthRights() {
  const authData = {}
  const right = sessionStorage.getItem('right')
  const id = sessionStorage.getItem('id')

  authData.id = id

  if (right === '社員') {
    authData.auth = '1'
  } else if (right === '営業員') {
    authData.auth = '2'
  } else if (right === '営業組長') {
    try {
      const response = await axios.get(`/customer/responsibleDetail/${id}`)
      authData.auth = '3'
      authData.employee = response.data.employee
    } catch (error) {
      console.error('営業組長の詳細取得に失敗:', error)
      authData.auth = '3'
      authData.employee = null
    }
  } else {
    authData.auth = '4'
  }

  return authData
}
