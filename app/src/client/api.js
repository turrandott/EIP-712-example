import axios from 'axios'

export const verifyUser = async (signature, address) => {
    try {
        const response = await axios.post(`/api/verify`, {signature, address})
        // console.log('response', response)
        return true
    } catch (error) {
        // console.log('error', {error})
        return false
    }
}