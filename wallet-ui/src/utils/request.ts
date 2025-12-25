import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpStatus } from '@/enums/RespEnum';
import { errorCode } from '@/utils/errorCode';
import {message,Modal} from 'antd';
import * as authApi from './auth'
import { ExclamationCircleFilled } from '@ant-design/icons';
const { confirm } = Modal;
// 是否显示重新登录
export const isRelogin = {show: false};

export const getToken = (): String => {
    return authApi.getToken() || '';
}
export const globalHeaders = () => {
    return {
        Authorization: 'auth ' + getToken(),
    };
};

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    timeout: 50000
});

// 请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {

        const isToken = config.headers?.isToken === false;

        if (getToken() && !isToken) {
            config.headers['Authorization'] = 'auth ' + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
        }
        // FormData数据去请求头Content-Type
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (res: AxiosResponse) => {
        // 未设置状态码则默认成功状态
        const code = res.data.code || HttpStatus.SUCCESS;
        // 获取错误信息
        const msg = errorCode[code] || res.data.msg || errorCode['default'];
        // 二进制数据则直接返回
        if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
            return res.data;
        }
        if (code === 401) {
            authApi.removeToken();
            // 使用window.location.href进行跳转，避免使用useNavigate
            window.location.href = '/login';
            return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
        } else if (code === HttpStatus.SERVER_ERROR) {
            message.error(msg);
            return Promise.reject(new Error(msg));
        } else if (code === HttpStatus.WARN) {
            message.warning(msg);
            return Promise.reject(new Error(msg));
        } else if (code !== HttpStatus.SUCCESS) {
            message.error(msg);
            return Promise.reject('error');
        } else {
            return Promise.resolve(res.data);
        }
    },
    (error: any) => {
        let {message} = error;
        if (message == 'Network Error') {
            message = '后端接口连接异常';
        } else if (message.includes('timeout')) {
            message = '系统接口请求超时';
        } else if (message.includes('Request failed with status code')) {
            message = '系统接口' + message.substr(message.length - 3) + '异常';
        }
        message.error(message);
        return Promise.reject(error);
    }
);

// 导出 axios 实例
export default service;
