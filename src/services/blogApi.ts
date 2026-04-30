import axios from 'axios';
import { store } from '../app/store';
import { communityClient } from '../graphql/client';
import { GET_BLOGS, GET_BLOG_BY_ID, GET_NEWSLETTERS } from '../graphql/queries/blogQueries';
import { CREATE_BLOG, CREATE_NEWSLETTER } from '../graphql/mutations/blogMutations';

export const blogApi = {
    getAllBlogs: async () => {
        const { data } = await communityClient.query({ query: GET_BLOGS, fetchPolicy: 'network-only' });
        return data.getBlogs;
    },

    getBlogById: async (id: string) => {
        const { data } = await communityClient.query({ query: GET_BLOG_BY_ID, variables: { id }, fetchPolicy: 'network-only' });
        return data.getBlogById;
    },

    createBlog: async (blogData: any) => {
        const { data } = await communityClient.mutate({ mutation: CREATE_BLOG, variables: { input: blogData } });
        return data.createBlog;
    },

    getAllNewsletters: async () => {
        const { data } = await communityClient.query({ query: GET_NEWSLETTERS, fetchPolicy: 'network-only' });
        return data.getNewsletters;
    },

    createNewsletter: async (newsletterData: any) => {
        const { data } = await communityClient.mutate({ mutation: CREATE_NEWSLETTER, variables: { input: newsletterData } });
        return data.createNewsletter;
    },

    getNewsletterSubscribers: async () => {
        // Not yet implemented on backend
        return [];
    },

    uploadFile: async (file: File): Promise<{ blobUrl: string; objectUrl: string }> => {
        const fd = new FormData();
        fd.append('containerName', 'blog-assets');
        fd.append('file', file);
        fd.append('serviceName', 'chat-service');

        const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/file-upload/uploadFile';
        const token = store.getState().ar.accessToken;

        const response = await axios.post(uploadUrl, fd, {
            headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        });
        const payload = response.data?.payload || response.data?.data || response.data;
        const blobUrl: string = payload?.blobUrl || payload?.fileUrl || payload?.url || '';

        // Fetch the blob with auth header so <img>/<video> can display it
        const blobRes = await fetch(blobUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        const blob = await blobRes.blob();
        const objectUrl = URL.createObjectURL(blob);

        return { blobUrl, objectUrl };
    },

    uploadVideo: async (file: File) => blogApi.uploadFile(file),
    uploadImage: async (file: File) => blogApi.uploadFile(file)
};
