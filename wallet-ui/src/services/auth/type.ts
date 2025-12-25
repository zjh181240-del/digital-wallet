/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 15:10
 * @Description: AuthBo
 */
export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    password: string;
    email?: string;
}

export interface LoginResponse {
    accessToken: string;
    expireIn: number;
}

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 15:16
 * @Description: LoginUser
 */
export interface LoginUser {
    userId: string

    nickName?: string

    username: string

    email?: string

    createdAt?: Date
}
