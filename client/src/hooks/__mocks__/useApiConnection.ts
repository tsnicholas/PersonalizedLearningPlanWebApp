export const mockGet = jest.fn();
export const mockPost = jest.fn();
export const mockPut = jest.fn();
export const mockDelete = jest.fn();

export const useApiConnection = () => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete
});