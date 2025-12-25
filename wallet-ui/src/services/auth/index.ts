import request from '@/utils/request'
import { LoginRequest, LoginResponse, LoginUser, RegisterRequest } from "@/services/auth/type.ts";
import { AxiosPromise } from 'axios';

export const BASE_API = '/auth';

export function login(bo: LoginRequest): AxiosPromise<LoginResponse> {
    return request.post(BASE_API + '/login', bo, {headers: {isToken: false}})
}

export function register(bo: RegisterRequest): AxiosPromise<Boolean> {
    return request.post(BASE_API + '/register', bo, {headers: {isToken: false}})
}

export function logout(): AxiosPromise<any> {
    return request.post(BASE_API + '/logout')
}

export function getInfo(): AxiosPromise<LoginUser> {
    return request.get(BASE_API + '/getCurrentUser')
}
