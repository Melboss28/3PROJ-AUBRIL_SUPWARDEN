import { jwtDecode } from "jwt-decode";

let saveToken = (token) => {
    localStorage.setItem('token', token)
}

let logout = () => {
    localStorage.removeItem('token')
}

let isLogged = () => {
    let token = localStorage.getItem('token')
    return !!token
}

let getToken = () => {
    return localStorage.getItem('token')
}

let getTokenInfo = () => {
    return jwtDecode (getToken())
}

export const accountService = {
    saveToken, logout, isLogged, getToken, getTokenInfo
}