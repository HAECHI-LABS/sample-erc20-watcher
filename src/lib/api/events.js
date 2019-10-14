import client from './client';

export default async () => {
    return client.get('/api/events')
}