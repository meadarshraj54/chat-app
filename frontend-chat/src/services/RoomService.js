import httpClient from '../config/AxiosHelper';

export const createRoomApi = async (roomDetail) => {
    const response = await httpClient.post(`/api/rooms`, roomDetail);
    return response.data;
};

export const joinChatApi = async (roomDetail) => {
    const response = await httpClient.post(`/api/rooms/join`, roomDetail);
    return response.data;
};

export const getMessages = async (roomId, password = "", size = 50, page = 0) => {
    const response = await httpClient.get(
        `/api/rooms/${roomId}/messages?password=${encodeURIComponent(password)}&size=${size}&page=${page}`
    );
    return response.data;
};