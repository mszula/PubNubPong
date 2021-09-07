export const generateChannelId = (): string => {
    return Math.random().toString(36).substring(2, 15);
}